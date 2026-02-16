/**
 * UCONAI Core Logic V2.6 (Hardened Edition)
 * 
 * Implements:
 * - M4-3 Scoped Sandbox & Atomic Ops
 * - M4-4 RBAC & User Quotas
 * - M4-4.3 Security Audit Logging
 */

const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const CONFIG = require('./modules/config-loader');
const Policy = require('./modules/policy');
const Executor = require('./modules/executor');
const Telemetry = require('./modules/telemetry');
const HealthGuard = require('./modules/health-guard');
const SecureFS = require('./modules/secure-fs');
const QuotaManager = require('./modules/quota-manager');
const AuditLogger = require('./modules/audit-logger');

const DB_PATH = './uconai.db';
const PORT = 3001;

const db = new sqlite3.Database(DB_PATH);

// [Async Log Queue] (M4-1.4)
const logQueue = [];
let isFlushing = false;

async function flushLogs() {
    if (isFlushing || logQueue.length === 0) return;
    isFlushing = true;

    const batch = logQueue.splice(0, 50);
    const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',');
    const values = batch.flatMap(l => [l.jobId, l.level, l.spanType, l.message, JSON.stringify(l.data), l.jobId, l.spanType, 0]);

    db.run(`INSERT INTO job_logs (job_id, level, step, message, meta, trace_id, span_type, duration_ms) VALUES ${placeholders}`,
        values, (err) => {
            if (err) console.error(`Log Flush Fail: ${err.message}`);
            isFlushing = false;
            if (logQueue.length > 0) flushLogs();
        }
    );
}

const Logger = {
    info: (msg, meta = {}) => {
        console.log(`[INFO] ${msg}`, meta);
        logQueue.push({ jobId: 'SYSTEM', level: 'INFO', spanType: 'SYSTEM_EVENT', message: msg, data: meta });
    },
    error: (msg, meta = {}) => {
        console.error(`[ERROR] ${msg}`, meta);
        logQueue.push({ jobId: 'SYSTEM', level: 'ERROR', spanType: 'SYSTEM_EVENT', message: msg, data: meta });
    },
    warn: (msg, meta = {}) => {
        console.warn(`[WARN] ${msg}`, meta);
        logQueue.push({ jobId: 'SYSTEM', level: 'WARN', spanType: 'SYSTEM_EVENT', message: msg, data: meta });
    },
    trace: (jobId, spanType, message, data = {}) => {
        logQueue.push({ jobId, level: 'TRACE', spanType, message, data });
        if (logQueue.length > 10) flushLogs();
    }
};

setInterval(flushLogs, 5000);

// Initialize Components
db.serialize(() => {
    // Standard Config
    db.run("PRAGMA journal_mode = WAL");
    db.run("PRAGMA busy_timeout = 5000");

    // Table Setup
    db.run(`CREATE TABLE IF NOT EXISTS jobs (job_id TEXT PRIMARY KEY, chat_id TEXT, module TEXT, action TEXT, args TEXT, status TEXT DEFAULT 'RECEIVED', user_role TEXT DEFAULT 'DEV', result TEXT, error TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS job_logs (id INTEGER PRIMARY KEY, job_id TEXT, level TEXT, step TEXT, message TEXT, meta JSON, trace_id TEXT, span_type TEXT, duration_ms INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

    // M4 Features Start
    Executor.init({ db, Logger });
    SecureFS.init(db);
    QuotaManager.init(db);
    AuditLogger.init(db);

    // [C9/M4-1.5] Recovery Logic
    db.run(`UPDATE jobs SET status = 'FAILED_SAFE', error = 'E_SYSTEM_RESTART: Zombie Kill' WHERE status = 'EXECUTING'`);

    // Resume Pending
    db.all(`SELECT * FROM jobs WHERE status = 'RECEIVED' LIMIT 50`, (err, rows) => {
        if (!err && rows.length > 0) {
            Logger.info(`Resuming ${rows.length} jobs with RBAC-safe executor...`);
            rows.forEach(job => {
                const payload = { ...job, args: JSON.parse(job.args) };
                Executor.executeJob(payload, {}).catch(e => Logger.error(`Resume Fail: ${e.message}`));
            });
        }
    });

    const monitor = new Telemetry(db, Logger);
    monitor.start(60000);
    const guard = new HealthGuard(monitor, Logger);

    startServer(guard);
});

function startServer(guard) {
    const server = http.createServer(async (req, res) => {
        if (req.method === 'POST' && req.url === '/job') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const jobPayload = JSON.parse(body);
                    const jobId = jobPayload.job_id || `job_${Date.now()}`;
                    const userRole = jobPayload.user_role || 'DEV';

                    // 1. Quota Check (M4-4.2)
                    const quotaOk = await QuotaManager.checkAndIncrement(userRole);
                    if (!quotaOk) {
                        AuditLogger.log('WARN', 'QUOTA', userRole, 'REFUSE', 'DailyLimit', { jobId });
                        res.writeHead(429, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ success: false, error: 'LIMIT_EXCEEDED', reason: 'Daily job quota reached' }));
                    }

                    // 2. Health Assessment (Survival Logic) (M4-1.3)
                    const assessment = await guard.assess(jobPayload.priority);
                    if (assessment.action === 'REFUSE') {
                        Logger.warn(`Job Refused: ${assessment.reason}`, { jobId, code: assessment.code });
                        res.writeHead(503, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ success: false, error: assessment.code, reason: assessment.reason }));
                    }

                    // 3. Persist & Respond
                    db.run(`INSERT INTO jobs (job_id, module, action, args, status, user_role) VALUES (?, ?, ?, ?, 'RECEIVED', ?)`,
                        [jobId, jobPayload.module || '', jobPayload.action || '', JSON.stringify(jobPayload.args || {}), userRole],
                        (err) => {
                            if (err) {
                                res.writeHead(500);
                                return res.end(JSON.stringify({ success: false, error: 'DB_ERROR' }));
                            }

                            res.writeHead(202, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, job_id: jobId, role: userRole }));

                            // 4. Run Job
                            const run = () => {
                                guard.onJobStart(jobPayload.priority);
                                Executor.executeJob({ job_id: jobId, user_role: userRole, ...jobPayload }, {})
                                    .then(() => guard.onJobEnd(jobPayload.priority))
                                    .catch(e => {
                                        Logger.error(`Job ${jobId} Failed: ${e.message}`);
                                        guard.onJobEnd(jobPayload.priority);
                                    });
                            };

                            if (assessment.action === 'DELAY') {
                                setTimeout(run, assessment.delayMs);
                            } else {
                                run();
                            }
                        });
                } catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'INVALID_JSON' }));
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    server.listen(PORT, () => {
        Logger.info(`UCONAI Core V2.6 (Hardened) listening on port ${PORT}`);
    });
}

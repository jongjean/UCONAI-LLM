/**
 * UCONAI Core Logic V2.7 (Identity Edition)
 * 
 * Implements:
 * - M5-1 API Key Authentication & User Identification
 * - Integrated RBAC, Quotas, and Audit Logging
 */

const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const CONFIG = require('./modules/config-loader');
const Executor = require('./modules/executor');
const Telemetry = require('./modules/telemetry');
const HealthGuard = require('./modules/health-guard');
const SecureFS = require('./modules/secure-fs');
const QuotaManager = require('./modules/quota-manager');
const AuditLogger = require('./modules/audit-logger');
const UserManager = require('./modules/user-manager');

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
            isFlushing = false;
            if (logQueue.length > 0) flushLogs();
        }
    );
}

const Logger = {
    info: (msg, meta = {}) => { console.log(`[INFO] ${msg}`, meta); logQueue.push({ jobId: 'SYSTEM', level: 'INFO', spanType: 'SYSTEM_EVENT', message: msg, data: meta }); },
    error: (msg, meta = {}) => { console.error(`[ERROR] ${msg}`, meta); logQueue.push({ jobId: 'SYSTEM', level: 'ERROR', spanType: 'SYSTEM_EVENT', message: msg, data: meta }); },
    warn: (msg, meta = {}) => { console.warn(`[WARN] ${msg}`, meta); logQueue.push({ jobId: 'SYSTEM', level: 'WARN', spanType: 'SYSTEM_EVENT', message: msg, data: meta }); },
    trace: (jobId, spanType, message, data = {}) => { logQueue.push({ jobId, level: 'TRACE', spanType, message, data }); if (logQueue.length > 10) flushLogs(); }
};

setInterval(flushLogs, 5000);

// Initialize Components
db.serialize(() => {
    db.run("PRAGMA journal_mode = WAL");
    db.run("PRAGMA busy_timeout = 5000");

    // Init Managers
    Executor.init({ db, Logger });
    SecureFS.init(db);
    QuotaManager.init(db);
    AuditLogger.init(db);
    UserManager.init(db);

    const monitor = new Telemetry(db, Logger);
    monitor.start(60000);
    const guard = new HealthGuard(monitor, Logger);

    startServer(guard);
});

function startServer(guard) {
    const server = http.createServer(async (req, res) => {
        // Headers for JSON response
        const sendJson = (code, data) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        };

        if (req.method === 'POST' && req.url === '/job') {
            // 1. Identity Check (M5-1)
            const apiKey = req.headers['x-api-key'];
            const user = await UserManager.authenticate(apiKey);

            if (!user) {
                AuditLogger.log('ALERT', 'AUTH', 'UNKNOWN', 'DENY', 'Access', { reason: 'Invalid or Missing API Key' });
                return sendJson(401, { success: false, error: 'UNAUTHORIZED', reason: 'Valid API Key required in x-api-key header' });
            }

            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const jobPayload = JSON.parse(body);
                    const jobId = jobPayload.job_id || `job_${Date.now()}`;
                    const userRole = user.role;

                    // 2. Quota Check (M4-4.2)
                    const quotaOk = await QuotaManager.checkAndIncrement(userRole);
                    if (!quotaOk) {
                        AuditLogger.log('WARN', 'QUOTA', user.username, 'REFUSE', 'DailyLimit', { jobId });
                        return sendJson(429, { success: false, error: 'LIMIT_EXCEEDED', reason: 'Daily job quota reached' });
                    }

                    // 3. Health Assessment (Survival Logic) (M4-1.3)
                    const assessment = await guard.assess(jobPayload.priority);
                    if (assessment.action === 'REFUSE') {
                        return sendJson(503, { success: false, error: assessment.code, reason: assessment.reason });
                    }

                    // 4. Persist & Respond
                    db.run(`INSERT INTO jobs (job_id, module, action, args, status, user_role) VALUES (?, ?, ?, ?, 'RECEIVED', ?)`,
                        [jobId, jobPayload.module || '', jobPayload.action || '', JSON.stringify(jobPayload.args || {}), userRole],
                        (err) => {
                            if (err) return sendJson(500, { success: false, error: 'DB_ERROR' });

                            sendJson(202, { success: true, job_id: jobId, user: user.username, role: userRole });

                            // 5. Run Job
                            const run = () => {
                                guard.onJobStart(jobPayload.priority);
                                Executor.executeJob({ job_id: jobId, user_role: userRole, ...jobPayload }, {})
                                    .then(() => guard.onJobEnd(jobPayload.priority))
                                    .catch(e => {
                                        Logger.error(`Job ${jobId} Failed: ${e.message}`);
                                        guard.onJobEnd(jobPayload.priority);
                                    });
                            };

                            if (assessment.action === 'DELAY') setTimeout(run, assessment.delayMs);
                            else run();
                        });
                } catch (e) {
                    sendJson(400, { error: 'INVALID_JSON' });
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    server.listen(PORT, () => {
        Logger.info(`UCONAI Core V2.7 (Identity) listening on port ${PORT}`);
    });
}

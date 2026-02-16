/**
 * UCONAI Core Logic V2.5 (Production Hardening Phase)
 * 
 * Implements:
 * - M4-1.2 Telemetry Integration
 * - M4-1.4 Async Log Flush Queue (SQLite Contention Fix)
 * - M4-1.3 Health Guard (Placeholder for next step)
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
const SecureFS = require('./modules/secure-fs'); // [M4-3]

const DB_PATH = './uconai.db';
const PORT = 3001;

const db = new sqlite3.Database(DB_PATH);

// [Async Log Queue] (M4-1.4)
// ... (omitted)

// Later in the file
// WAL Mode (M4-1.4)
db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA busy_timeout = 5000");

Executor.init({ db, Logger });
SecureFS.init(db); // [M4-3.3] Transaction Logging

// [Telemetry & Health Guard] (M4-1.2 / M4-1.3)
let monitor;
let guard;

// [Async Log Queue] (M4-1.4)
const logQueue = [];
let isFlushing = false;

async function flushLogs() {
    if (isFlushing || logQueue.length === 0) return;
    isFlushing = true;

    // Batch up to 50 logs
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
        // Enforce Async Batching (C11)
        logQueue.push({ jobId, level: 'TRACE', spanType, message, data });
        if (logQueue.length > 10) flushLogs();
    }
};

// Periodically flush logs regardless of count
setInterval(flushLogs, 5000);

db.serialize(() => {
    // Basic Tables
    db.run(`CREATE TABLE IF NOT EXISTS jobs (job_id TEXT PRIMARY KEY, chat_id TEXT, module TEXT, action TEXT, args TEXT, status TEXT DEFAULT 'RECEIVED', result TEXT, error TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS job_logs (id INTEGER PRIMARY KEY, job_id TEXT, level TEXT, step TEXT, message TEXT, meta JSON, trace_id TEXT, span_type TEXT, duration_ms INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

    // WAL Mode (M4-1.4)
    db.run("PRAGMA journal_mode = WAL");
    db.run("PRAGMA busy_timeout = 5000");

    Executor.init({ db, Logger });

    // [C9/M4-1.5] Zombie Kill & Recovery Logic
    db.serialize(() => {
        db.run(`UPDATE jobs SET status = 'FAILED_SAFE', error = 'E_SYSTEM_RESTART: Zombie Kill' 
                WHERE status = 'EXECUTING'`, (err) => {
            if (!err) Logger.info("Zombie cleanup completed.");
        });

        // Resume Pending Jobs (C5/C6)
        db.all(`SELECT * FROM jobs WHERE status = 'RECEIVED' LIMIT 50`, (err, rows) => {
            if (!err && rows.length > 0) {
                Logger.info(`Resuming ${rows.length} pending jobs...`);
                rows.forEach(job => {
                    const payload = { ...job, args: JSON.parse(job.args) };
                    Executor.executeJob(payload, {}).catch(e => Logger.error(`Resume Fail: ${e.message}`));
                });
            }
        });
    });

    monitor = new Telemetry(db, Logger);
    monitor.start(60000);

    guard = new HealthGuard(monitor, Logger);
});

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/job') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const jobPayload = JSON.parse(body);
                const jobId = jobPayload.job_id || `job_${Date.now()}`;

                // [M4-1.3] Health Assessment (Survival Logic)
                const assessment = await guard.assess(jobPayload.priority);
                console.log(`[ASSESS] Job ${jobId} [Prio: ${jobPayload.priority || 'MED'}] -> ${assessment.action} (${assessment.reason || 'OK'})`);

                if (assessment.action === 'REFUSE') {
                    Logger.warn(`Job Refused: ${assessment.reason}`, { jobId, code: assessment.code });
                    res.writeHead(503, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: assessment.code, reason: assessment.reason }));
                }

                const jobInsertResult = await new Promise(resolve => db.run(`INSERT INTO jobs (job_id, module, action, args, status) VALUES (?, ?, ?, ?, 'RECEIVED')`,
                    [jobId, jobPayload.module || '', jobPayload.action || '', JSON.stringify(jobPayload.args || {})], (err) => resolve(err)));

                if (jobInsertResult) {
                    Logger.error(`Job Insert Fail: ${jobInsertResult.message}`, { jobId });
                    res.writeHead(500);
                    return res.end(JSON.stringify({ success: false, error: 'DB_ERROR', reason: jobInsertResult.message }));
                }

                res.writeHead(202, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, job_id: jobId }));

                // Execute Job with Backpressure (DELAY) (M4-1.3)
                const run = () => {
                    guard.onJobStart(jobPayload.priority);
                    Executor.executeJob({ job_id: jobId, ...jobPayload }, {})
                        .then(() => guard.onJobEnd(jobPayload.priority))
                        .catch(e => {
                            Logger.error(`Job ${jobId} Failed: ${e.message}`);
                            guard.onJobEnd(jobPayload.priority);
                        });
                };

                if (assessment.action === 'DELAY') {
                    Logger.info(`Backpressure Applied: Delaying ${assessment.delayMs}ms`, { jobId });
                    setTimeout(run, assessment.delayMs);
                } else {
                    run();
                }

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
    Logger.info(`UCONAI Core V2.5 listening on port ${PORT}`);
});

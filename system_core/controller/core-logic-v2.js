/**
 * UCONAI Core Logic V2.8 (Master Governance Edition)
 * Zero-Dependency Native HTTP Implementation - Hardened
 */
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// [M7.1.1] Governance Integrated Components
const Executor = require('./modules/executor');
const Telemetry = require('./modules/telemetry');
const HealthGuard = require('./modules/health-guard');
const SecureFS = require('./modules/secure-fs');
const QuotaManager = require('./modules/quota-manager');
const AuditLogger = require('./modules/audit-logger');
const GCore = require('./modules/governance-core');
const UserManager = require('./modules/user-manager');
const MemoryManager = require('./modules/memory-manager');
const AuditExporter = require('./modules/audit-exporter');

const DB_PATH = './uconai.db';
const PORT = 3001;
const db = new sqlite3.Database(DB_PATH);

const logQueue = [];
const MAX_QUEUE_SIZE = 1000;
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

db.serialize(() => {
    db.run("PRAGMA journal_mode = WAL");
    Executor.init({ db, Logger });
    SecureFS.init(db);
    QuotaManager.init(db);
    AuditLogger.init(db);
    UserManager.init(db);
    MemoryManager.init(db);
    GCore.init(db);
    AuditExporter.init(db);

    const monitor = new Telemetry(db, Logger);
    monitor.start(60000);
    const guard = new HealthGuard(monitor, Logger);

    startServer(guard);
});

function startServer(guard) {
    const server = http.createServer(async (req, res) => {
        const sendJson = (code, data) => {
            res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(data));
        };

        // [M7.4.1] Governance Monitoring APIs
        if (req.method === 'GET' && req.url === '/admin/gov-status') {
            try {
                const HealthPulse = require('./modules/health-pulse');
                const FailSafe = require('./modules/emergency-mode');
                const CooldownMgr = require('./modules/cooldown-mgr');
                const RiskEvaluator = require('./modules/risk-calc');
                const riskMap = {};
                for (const tid of [0, 1]) {
                    riskMap[tid] = { score: await RiskEvaluator.calculateScore(tid), cooldown: CooldownMgr.getPhase(tid) };
                }
                return sendJson(200, { status: 'OK', governance: { health: HealthPulse.getStatus(), failSafe: FailSafe.isInEmergency, riskMap } });
            } catch (e) { return sendJson(500, { error: e.message }); }
        }

        // [M7.4.2] Human Override API (C24 - Audit v3.3 Hardened)
        if (req.method === 'POST' && req.url === '/admin/override') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const { teamId, action, scope, durationSec, reason, actor } = JSON.parse(body);
                    const FailSafe = require('./modules/emergency-mode');

                    if (!reason || !actor || !durationSec) {
                        return sendJson(400, { status: 'ERROR', message: "Missing C24 Required Audit Metadata (Reason/Actor/Duration)" });
                    }

                    if (action === 'RESET_RISK') {
                        const CooldownMgr = require('./modules/cooldown-mgr');
                        if (CooldownMgr.records && CooldownMgr.records[teamId]) {
                            delete CooldownMgr.records[teamId];
                        }
                    } else if (action === 'ENABLE_OVERRIDE') {
                        FailSafe.applyOverride(scope || 'global', durationSec, reason, actor);
                    } else if (action === 'DISABLE_FAILSAFE') {
                        FailSafe.reset();
                    }

                    AuditLogger.log('ALERT', 'PRIVILEGE', actor, 'HUMAN_OVERRIDE', 'GOV', { action, scope, durationSec, reason }, 0, 0);
                    sendJson(200, { status: 'OK', message: `C24 Override ${action} applied to scope ${scope || 'global'}` });
                } catch (error) {
                    sendJson(500, { status: 'ERROR', message: error.message });
                }
            });
            return;
        }

        if (req.method === 'GET' && req.url.startsWith('/admin/report/')) {
            try {
                const teamId = req.url.split('/').pop();
                const report = await AuditExporter.generateReport(teamId);
                return sendJson(200, report);
            } catch (e) { return sendJson(500, { error: e.message }); }
        }

        // [M6-1] Core Job Execution Logic
        if (req.method === 'POST' && req.url === '/job') {
            const apiKey = req.headers['x-api-key'];
            const user = await UserManager.authenticate(apiKey);
            if (!user) return sendJson(401, { error: 'UNAUTHORIZED' });

            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const jobPayload = JSON.parse(body);
                    const jobId = jobPayload.job_id || `job_${Date.now()}`;
                    if (!(await QuotaManager.checkAndIncrement(user.role, user.team_id))) return sendJson(429, { error: 'LIMIT' });

                    const assessment = await guard.assess(jobPayload.priority);
                    if (assessment.action === 'REFUSE') return sendJson(503, { error: assessment.code });

                    db.run(`INSERT INTO jobs (job_id, module, action, args, status, user_role, owner, team_id) VALUES (?, ?, ?, ?, 'RECEIVED', ?, ?, ?)`,
                        [jobId, jobPayload.module || '', jobPayload.action || '', JSON.stringify(jobPayload.args || {}), user.role, user.username, user.team_id],
                        (err) => {
                            if (err) return sendJson(500, { error: 'DB' });
                            sendJson(202, { success: true, job_id: jobId });

                            const run = async () => {
                                guard.onJobStart(jobPayload.priority);
                                const ctx = { requestId: jobId, actorId: user.id, teamId: user.team_id, role: user.role, abortSignal: null };
                                const memories = await MemoryManager.search(ctx, jobPayload.action, 3);
                                const finalPayload = { ...jobPayload, job_id: jobId, user_id: user.id, team_id: user.team_id, memory_context: memories.map(m => m.content).join('\n') };
                                Executor.executeJob(finalPayload, {}).then(() => guard.onJobEnd(jobPayload.priority)).catch(e => guard.onJobEnd(jobPayload.priority));
                            };
                            setTimeout(run, assessment.delayMs || 0);
                        });
                } catch (e) { sendJson(400, { error: 'JSON' }); }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    server.listen(PORT, () => {
        Logger.info(`UCONAI Core V2.8 (Master Governance) listening on port ${PORT}`);
    });
}

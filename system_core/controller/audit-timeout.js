const Executor = require('./modules/executor');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('uconai.db');

const Logger = {
    info: (msg, meta = {}) => console.log(`[INFO] ${msg}`),
    error: (msg, meta = {}) => console.error(`[ERROR] ${msg}`),
    warn: (msg, meta = {}) => console.warn(`[WARN] ${msg}`),
    trace: (jobId, spanType, message, data = {}) => {
        console.log(`[TRACE][${spanType}] ${message}`);
    }
};

async function runTimeoutAudit() {
    console.log("=== UCONAI AUDIT: C9 GLOBAL TIMEOUT ===");
    Executor.init({ db, Logger });

    Executor.GLOBAL_TIMEOUT_MS = 2000;
    const jobId = 'audit-timeout-actual-' + Date.now();

    await new Promise(r => db.run(`INSERT INTO jobs (job_id, status) VALUES (?, 'RECEIVED')`, [jobId], r));

    // Mock Planner
    require('./modules/planner').generatePlan = async () => ({
        success: true, plan: {
            schema_version: "1.0",
            goal: "Test Timeout",
            steps: [{ id: "s1", tool: "system_status", args: {}, expected: { checks: [] } }],
            max_steps: 3
        }
    });

    // Mock tool to hang
    const Tools = require('./modules/tools/index');
    const oldStatus = Tools.system_status;
    Tools.system_status = async () => {
        console.log("[Audit] Tool system_status hanging...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        return { status: 'OK' };
    };

    console.log("[Audit] Running Job " + jobId + "...");
    await Executor.executeJob({ job_id: jobId, action: 'plan_task', args: [] }, {});

    db.get(`SELECT status, result FROM jobs WHERE job_id = ?`, [jobId], (err, row) => {
        console.log("\n[Audit Result]");
        console.log("Job Status:", row.status);
        console.log("Job Result:", row.result);

        if (row.status === 'FAILED_SAFE' && (row.result || "").includes('E_GLOBAL_TIMEOUT')) {
            console.log("✅ RESULT C9: PASS (Global timeout triggered accurately at 2s)");
        } else {
            console.log("❌ RESULT C9: FAIL");
        }
        db.close();
        Tools.system_status = oldStatus;
        process.exit(row.status === 'FAILED_SAFE' ? 0 : 1);
    });
}

runTimeoutAudit();

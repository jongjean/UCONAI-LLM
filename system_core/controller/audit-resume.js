const Executor = require('./modules/executor');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('uconai.db');

const Logger = {
    info: (msg, meta = {}) => console.log(`[INFO] ${msg}`),
    error: (msg, meta = {}) => console.error(`[ERROR] ${msg}`),
    warn: (msg, meta = {}) => console.warn(`[WARN] ${msg}`),
    trace: (jobId, spanType, message, data = {}) => {
        console.log(`[TRACE][${spanType}] ${message}`, data);
        db.run(`INSERT INTO job_logs (job_id, level, step, message, meta, trace_id, span_type, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [jobId, 'TRACE', spanType, message, JSON.stringify(data), jobId, spanType, 0]);
    }
};

async function runIdempotencyAudit() {
    console.log("=== UCONAI AUDIT: C5/C6 IDEMPOTENCY ===");
    Executor.init({ db, Logger });

    const jobId = 'audit-resume-test-' + Date.now();

    // 1. Manually insert the STEP_DONE for step_1
    console.log("[Audit] Pre-inserting STEP_DONE for 'step_1'...");
    await new Promise((resolve) => {
        db.run(`INSERT INTO job_logs (job_id, level, step, message, meta, trace_id, span_type, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [jobId, 'TRACE', 'STEP_DONE', 'Step step_1 finished successfully', JSON.stringify({ step_id: 'step_1' }), jobId, 'STEP_DONE', 0], resolve);
    });

    const plan = {
        schema_version: "1.0",
        goal: "Test Resume Logic",
        steps: [
            { id: "step_1", tool: "system_status", args: {}, expected: { checks: [{ type: "status_ok" }] } },
            { id: "step_2", tool: "system_status", args: {}, expected: { checks: [{ type: "status_ok" }] } }
        ],
        max_steps: 3
    };

    console.log("[Audit] Running Job " + jobId + "...");
    // We call the internal loop directly to see the skipping
    const result = await Executor._runLoop({ job_id: jobId, action: 'plan_task', args: [] }, {}, new AbortController().signal);

    // Check logs for 'STEP_SKIP'
    db.all(`SELECT span_type, message, meta FROM job_logs WHERE job_id = ? ORDER BY id ASC`, [jobId], (err, rows) => {
        const skipped = rows.some(r => r.span_type === 'STEP_SKIP' && r.message.includes('step_1'));

        const executed2 = rows.some(r => {
            if (r.span_type !== 'STEP_EXEC') return false;
            try {
                const meta = JSON.parse(r.meta || '{}');
                return meta.step_id === 'step_2';
            } catch (e) { return false; }
        });

        console.log("\n[Audit Result]");
        console.log("Step 1 Skipped:", skipped ? "✅ YES" : "❌ NO");
        console.log("Step 2 Executed:", executed2 ? "✅ YES" : "❌ NO");

        if (skipped && executed2) {
            console.log("✅ RESULT C5/C6: PASS (Idempotency proven by log marker)");
        } else {
            console.log("❌ RESULT C5/C6: FAIL");
        }
        db.close();
    });
}

// Inject a workaround for Executor._runLoop calling Planner.generatePlan (we don't want LLM here)
const originalGenerate = require('./modules/planner').generatePlan;
require('./modules/planner').generatePlan = async () => ({
    success: true, plan: {
        schema_version: "1.0",
        goal: "Test Resume Logic",
        steps: [
            { id: "step_1", tool: "system_status", args: {}, expected: { checks: [{ type: "status_ok" }] } },
            { id: "step_2", tool: "system_status", args: {}, expected: { checks: [{ type: "status_ok" }] } }
        ],
        max_steps: 3
    }
});

runIdempotencyAudit();

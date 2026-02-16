const Executor = require('./modules/executor');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('uconai.db');

// Mock Logger matching core-logic-v2 spec
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

async function runAudit() {
    console.log("=== UCONAI PHASE 3 AUDIT TOOL v1.1 ===");

    // Setup Context
    Executor.init({ db, Logger });

    // Inject Fixed Plan Directly to Executor bypass LLM
    const plan = {
        schema_version: "1.0",
        goal: "Test C4 Verification Failure",
        steps: [
            {
                id: "s1",
                tool: "read_file",
                args: { path: "C:\\OpenClaw\\controller\\package.json" },
                expected: {
                    checks: [{ type: "contains_text", regex: "NON_EXISTENT_TOKEN_999" }]
                }
            }
        ],
        max_steps: 3
    };

    console.log("[Audit 1] Testing Verification Fail...");

    try {
        const toolOutput = { status: 'OK', data: { content: "Actual content from package.json" } };
        const verifyResult = await Executor._verify(plan.steps[0], toolOutput);

        console.log("[Audit 1] Verification Verdict:", JSON.stringify(verifyResult));

        if (verifyResult.status === 'FAIL' && verifyResult.reason.includes('EXPECTED_NOT_MET')) {
            console.log("✅ RESULT 1: PASS (C4 Verifier accurately detected data mismatch)");
        } else {
            console.log("❌ RESULT 1: FAIL (Verifier allowed mismatch)");
        }

        console.log("\n[Audit 2] Testing File Exists Success...");
        const plan2 = {
            id: "s2",
            tool: "read_file",
            args: { path: "C:\\OpenClaw\\controller\\package.json" },
            expected: { checks: [{ type: "file_exists" }] }
        };
        const verifyResult2 = await Executor._verify(plan2, toolOutput);
        console.log("[Audit 2] Verification Verdict:", JSON.stringify(verifyResult2));
        if (verifyResult2.status === 'OK') {
            console.log("✅ RESULT 2: PASS (C4 Verifier confirmed file exists)");
        }

    } catch (e) {
        console.error("Audit Crash:", e);
    } finally {
        setTimeout(() => {
            db.close();
        }, 500);
    }
}

runAudit();

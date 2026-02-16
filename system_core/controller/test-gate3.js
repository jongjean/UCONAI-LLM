/**
 * M4-2.1 Gate 3 Validation Test (Selective Executor LLM)
 * 
 * Objective: Verify Executor triggers ANALYSIS role only on failure.
 */
const http = require('http');

async function sendJob(id, shouldFail = false) {
    const data = JSON.stringify({
        job_id: `gate3_test_${shouldFail ? 'FAIL' : 'PASS'}_${id}_${Date.now()}`,
        action: 'plan_task',
        module: shouldFail ? 'invalid_tool' : 'file', // Invalid module triggers failure
        args: shouldFail ? { action: 'break' } : { action: 'read', path: '/test/config.json' }
    });

    return new Promise((resolve) => {
        const start = Date.now();
        const req = http.request('http://localhost:3001/job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                const latency = Date.now() - start;
                resolve({ id, shouldFail, status: res.statusCode, latency, jobId: JSON.parse(data).job_id });
            });
        });
        req.on('error', e => resolve({ id, error: e.message }));
        req.write(data);
        req.end();
    });
}

async function runTest() {
    console.log("=== M4-2.1 GATE 3: SELECTIVE LLM TEST ===\n");

    // 1. Success Case
    console.log("[Phase 1] Sending SUCCESS Job...");
    const successJob = await sendJob(1, false);
    console.log(`PASS Job: ${successJob.jobId} (HTTP ${successJob.status})`);

    // 2. Failure Case
    console.log("\n[Phase 2] Sending FAILURE Job...");
    const failJob = await sendJob(2, true);
    console.log(`FAIL Job: ${failJob.jobId} (HTTP ${failJob.status})`);

    console.log("\n[Verification Steps (Manual)]");
    console.log("1. Check DB for PASS Job:");
    console.log("   - Status: COMPLETED");
    console.log("   - LLM Calls: ONLY Planner (1 call), NO Executor Analysis");
    console.log("2. Check DB for FAIL Job:");
    console.log("   - Status: FAILED_SAFE");
    console.log("   - LLM Calls: Planner (if generated) + Executor ANALYSIS Role");
    console.log("   - 'analysis' column should contain JSON RCA.");

    console.log("\n[Expected Behavior]");
    console.log("✅ PASS Job is cheap (1 LLM call)");
    console.log("✅ FAIL Job is insightful (RCA generated)");

    console.log("\n=========================================\n");
}

runTest();

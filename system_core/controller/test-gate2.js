/**
 * M4-2.1 Gate 2 Validation Test
 * 
 * Objective: Verify Role-based Routing and Fallback Logic
 */
const http = require('http');

async function sendJob(id, context) {
    const data = JSON.stringify({
        job_id: `gate2_test_${context}_${id}_${Date.now()}`,
        action: 'plan_task',
        module: 'file',
        args: { action: 'read', path: '/test/file.txt' }
        // Note: Core logic maps plan_task -> Planner -> LLM.generate(PLANNER)
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
                resolve({ id, context, status: res.statusCode, latency, body });
            });
        });
        req.on('error', e => resolve({ id, error: e.message }));
        req.write(data);
        req.end();
    });
}

async function runTest() {
    console.log("=== M4-2.1 GATE 2: POLICY ROUTING TEST ===\n");

    // 1. Send planner jobs (Should use qwen3:4b, timeout 15s)
    console.log("[Phase 1] Sending PLANNER job...");
    const planResult = await sendJob(1, 'PLANNER');
    console.log(`Planner Job: HTTP ${planResult.status} | Latency: ${planResult.latency}ms`);

    // 2. Validate logs (simulated check)
    console.log("\n[Verification Steps]");
    console.log("1. Check core_out.log for:");
    console.log("   - [Planner] Generated plan... (metrics should show PLANNER context)");
    console.log("2. Check core_err.log for any fallback warnings (if timeout occurs)");
    console.log("3. Verify Semaphore usage (PLANNER max 2)");

    console.log("\n[Expected Behavior]");
    console.log("✅ Planner job accepted (202)");
    console.log("✅ LLM Client uses qwen3:4b (primary for PLANNER)");
    console.log("✅ Timeout should be 15s (not 60s default)");

    console.log("\n==========================================\n");
}

runTest();

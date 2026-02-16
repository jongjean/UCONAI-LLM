/**
 * M4-2.2 Optimization Verification Test
 * 
 * Objective: Verify Prompt Optimization works correctly
 */
const http = require('http');

async function sendJob(id) {
    const data = JSON.stringify({
        job_id: `opt_test_${id}_${Date.now()}`,
        action: 'plan_task',
        module: 'file',
        args: { action: 'read', path: '/test/config.json' }
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
                resolve({ id, status: res.statusCode, latency, body });
            });
        });
        req.on('error', e => resolve({ id, error: e.message }));
        req.write(data);
        req.end();
    });
}

async function runTest() {
    console.log("=== M4-2.2 OPTIMIZATION TEST ===\n");

    console.log("[Phase 1] Sending Optimized Job...");
    const result = await sendJob(1);
    console.log(`Job Status: HTTP ${result.status} | Latency: ${result.latency}ms`);

    // 2. Validate logs (simulated check)
    console.log("\n[Verification Steps]");
    console.log("1. Check core_out.log for '[Planner] Generated plan...'");
    console.log("2. Verify that latency (ms) is lower than baseline (~2000ms)");
    console.log("3. Ensure Schema validation still PASSES");

    console.log("\n[Expected Behavior]");
    console.log("✅ Efficiency: Faster generation (less tokens)");
    console.log("✅ Accuracy: Plan structure remains valid");
    console.log("✅ Compatibility: qwen3:4b understands the compact prompt");

    console.log("\n====================================\n");
}

runTest();

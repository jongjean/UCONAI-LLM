/**
 * M4-2.1 Gate 1 Validation Test
 * 
 * Objective: Verify Semaphore prevents LLM saturation
 */
const http = require('http');

async function sendJob(id) {
    const data = JSON.stringify({
        job_id: `semaphore_test_${id}_${Date.now()}`,
        action: 'plan_task',
        module: 'file',
        args: { action: 'read', path: '/test/file.txt' }
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
    console.log("=== M4-2.1 GATE 1: SEMAPHORE STRESS TEST ===\n");
    console.log("[Phase 1] Sending 10 concurrent jobs...");

    const jobs = [];
    for (let i = 0; i < 10; i++) {
        jobs.push(sendJob(i));
    }

    const results = await Promise.all(jobs);

    const stats = results.reduce((acc, r) => {
        const key = r.status || 'ERROR';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    console.log("\n[Results]");
    Object.entries(stats).forEach(([status, count]) => {
        console.log(`  ${status}: ${count} jobs`);
    });

    const avgLatency = results.reduce((sum, r) => sum + (r.latency || 0), 0) / results.length;
    console.log(`\n[Performance]`);
    console.log(`  Avg Response Time: ${avgLatency.toFixed(0)}ms`);
    console.log(`  Max Response Time: ${Math.max(...results.map(r => r.latency || 0))}ms`);

    console.log("\n[Expected Behavior]");
    console.log("  ✅ All jobs should return 202 (accepted)");
    console.log("  ✅ No E_OVERLOAD_THROTTLED errors (queue should handle 10 jobs)");
    console.log("  ✅ Max response time should be reasonable (<2s for acceptance)");

    console.log("\n[Next Steps]");
    console.log("  1. Check core_out.log for '[PLANNER]' timing messages");
    console.log("  2. Monitor job completion (some may be DELAYED or queued)");
    console.log("  3. Run: node soak-dashboard.js to check queue metrics");

    console.log("\n=========================================\n");
}

runTest();

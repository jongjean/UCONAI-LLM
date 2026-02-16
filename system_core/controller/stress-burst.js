const http = require('http');

async function sendJob(id, priority = 'LOW', playbook = 'pb1_health') {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            job_id: `stress_${id}_${Date.now()}`,
            action: 'run_playbook',
            args: [playbook],
            priority: priority
        });

        const req = http.request('http://localhost:3001/job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });

        req.on('error', (e) => resolve({ status: 'ERROR', error: e.message }));
        req.write(data);
        req.end();
    });
}

async function runTest() {
    console.log("[STRESS] Starting Heavy Sync Hang (30s)...");
    // 1. Kick off the hang
    sendJob('hang', 'HIGH', 'pb_chaos_heavy_sync');

    await new Promise(r => setTimeout(r, 2000)); // Give it a sec to start

    console.log("[STRESS] Sending Burst of 10 jobs...");
    const burst = [];
    for (let i = 0; i < 10; i++) {
        burst.push(sendJob(`burst_${i}`, i < 2 ? 'HIGH' : 'LOW'));
    }

    const results = await Promise.all(burst);
    console.log("\n[STRESS] Burst Results (Received after hang released):");
    results.forEach((r, i) => {
        console.log(`Job ${i}: HTTP ${r.status} | Priority: ${i < 2 ? 'HIGH' : 'LOW'}`);
    });
}

runTest();

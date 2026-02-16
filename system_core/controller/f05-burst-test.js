const http = require('http');

async function sendJob(i) {
    const data = JSON.stringify({
        job_id: `f05_burst_${i}_${Date.now()}`,
        action: 'system_status',
        priority: i % 5 === 0 ? 'HIGH' : 'LOW'
    });

    return new Promise((resolve) => {
        const req = http.request('http://localhost:3001/job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ id: i, status: res.statusCode, body }));
        });
        req.on('error', e => resolve({ id: i, error: e.message }));
        req.write(data);
        req.end();
    });
}

async function runF05() {
    console.log("=== F-05: LLM CONCURRENCY & BURST TEST ===");
    console.log("Sending 25 concurrent jobs...");
    const jobs = [];
    for (let i = 0; i < 25; i++) {
        jobs.push(sendJob(i));
    }

    const results = await Promise.all(jobs);

    const stats = results.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {});

    console.log("Burst Results:", stats);
    console.log("Checking if some were DELAYED or REFUSED...");
}

runF05();

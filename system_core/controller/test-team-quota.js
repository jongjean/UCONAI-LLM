const http = require('http');

async function sendJob(key) {
    return new Promise((resolve) => {
        const req = http.request('http://localhost:3001/job', {
            method: 'POST',
            headers: { 'x-api-key': key, 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', e => resolve({ error: e.message }));
        req.write(JSON.stringify({ action: 'status' }));
        req.end();
    });
}

async function run() {
    const GUEST_KEY = 'uc_gst_456';
    console.log("--- TEST: Team Quota Limit (Limit: 1) ---");

    console.log("\n[Request 1] (Should succeed)");
    const r1 = await sendJob(GUEST_KEY);
    console.log(r1);

    console.log("\n[Request 2] (Should fail with 429)");
    const r2 = await sendJob(GUEST_KEY);
    console.log(r2);
}

run();

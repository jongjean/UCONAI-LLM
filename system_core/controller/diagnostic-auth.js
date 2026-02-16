const http = require('http');

async function testAuth(key) {
    return new Promise((resolve) => {
        const req = http.request('http://localhost:3001/job', {
            method: 'POST',
            headers: key ? { 'x-api-key': key, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
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
    console.log("--- TEST 1: NO KEY ---");
    console.log(await testAuth(null));

    console.log("\n--- TEST 2: INVALID KEY ---");
    console.log(await testAuth('wrong_key'));

    console.log("\n--- TEST 3: VALID KEY (uc_dev_123) ---");
    console.log(await testAuth('uc_dev_123'));
}

run();

const http = require('http');

async function check(url) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', () => resolve('FAILED'));
    });
}

async function run() {
    console.log('--- PHASE 7 FINAL GATE CERTIFICATION ---');
    const status = await check('http://localhost:3001/admin/gov-status');
    const report = await check('http://localhost:3001/admin/report/0');

    console.log('GATE 1 (Health):', status);
    console.log('GATE 2 (Compliance):', report);
    process.exit(0);
}

run();

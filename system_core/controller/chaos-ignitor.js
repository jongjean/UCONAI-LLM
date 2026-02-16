const http = require('http');

function sendChaos(id) {
    const data = JSON.stringify({
        job_id: `chaos_${Date.now()}`,
        action: 'run_playbook',
        args: [id],
        priority: 'MEDIUM'
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
        res.on('end', () => {
            console.log(`[IGNITOR] Sent Chaos ${id}: HTTP ${res.statusCode}`);
            console.log(`[IGNITOR] Response: ${body}`);
        });
    });

    req.write(data);
    req.end();
}

const type = process.argv[2] || 'pb_chaos_sync';
sendChaos(type);

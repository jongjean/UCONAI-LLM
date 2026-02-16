const http = require('http');

/**
 * UCONAI M4-1.1 Soak Runner
 * 
 * PHASES:
 * 1. Ramp-up (0-X min): Increase load gradually
 * 2. Steady-state (X-Y min): Constant high load
 * 3. Cool-down (Y-Z min): Decrease load
 */

const API_URL = 'http://localhost:3001/job';
const DURATION_TOTAL_MIN = 24 * 60; // 24 Hours
const RAMP_UP_MIN = 4 * 60;
const STEADY_MIN = 12 * 60;
const COOL_DOWN_MIN = 4 * 60;

const PB_POOL = [
    { type: 'playbook', id: 'pb1_health', weight: 0.6 },
    { type: 'playbook', id: 'pb2_io', weight: 0.2 },
    { type: 'task', id: 'planner_stress', weight: 0.1, payload: { action: 'plan_task', module: 'System', args: { task: 'Analyze server health and logs' } } },
    { type: 'fuzz', weight: 0.1 }
];

let stats = {
    total_sent: 0,
    success: 0,
    fail: 0,
    latency: [],
    test_cases: {}
};

async function sendJob(jobPayload, testCaseId) {
    return new Promise((resolve) => {
        const start = Date.now();
        const data = JSON.stringify(jobPayload);

        const req = http.request(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                const duration = Date.now() - start;
                stats.total_sent++;
                stats.latency.push(duration);

                if (res.statusCode === 200 || res.statusCode === 202) {
                    stats.success++;
                } else {
                    stats.fail++;
                }

                // Log test case result
                if (!stats.test_cases[testCaseId]) stats.test_cases[testCaseId] = { s: 0, f: 0 };
                if (res.statusCode < 400) stats.test_cases[testCaseId].s++;
                else stats.test_cases[testCaseId].f++;

                resolve();
            });
        });

        req.on('error', (e) => {
            stats.fail++;
            resolve();
        });

        req.write(data);
        req.end();
    });
}

function getRandomJob() {
    const r = Math.random();
    let acc = 0;
    for (const item of PB_POOL) {
        acc += item.weight;
        if (r <= acc) {
            if (item.type === 'playbook') {
                return { payload: { action: 'run_playbook', args: [item.id] }, id: item.id };
            } else if (item.type === 'task') {
                return { payload: item.payload, id: item.id };
            } else {
                return { payload: { action: 'invalid_tool', args: { fuzz: Math.random() } }, id: 'fuzz' };
            }
        }
    }
}

async function runSoak() {
    console.log(`=== UCONAI SOAK RUNNER STARTING (${DURATION_TOTAL_MIN} min) ===`);
    const startTime = Date.now();

    const interval = setInterval(() => {
        const elapsedMin = (Date.now() - startTime) / 60000;

        // Determine current Rate (Jobs per minute)
        let rate = 1; // Base
        if (elapsedMin < RAMP_UP_MIN) {
            rate = 1 + (9 * (elapsedMin / RAMP_UP_MIN)); // 1 -> 10 over 4h
        } else if (elapsedMin < RAMP_UP_MIN + STEADY_MIN) {
            rate = 10;
        } else if (elapsedMin < DURATION_TOTAL_MIN) {
            const coolElapsed = elapsedMin - (RAMP_UP_MIN + STEADY_MIN);
            rate = 10 - (9 * (coolElapsed / COOL_DOWN_MIN)); // 10 -> 1
        } else {
            clearInterval(interval);
            printFinalReport();
            process.exit(0);
        }

        // Send 'rate' jobs this minute (roughly)
        const jobsToSpawn = Math.max(1, Math.round(rate / 6)); // We check every 10s
        for (let i = 0; i < jobsToSpawn; i++) {
            const job = getRandomJob();
            sendJob(job.payload, job.id);
        }

    }, 10000); // Pulse every 10 seconds

    // Periodic Heartbeat
    setInterval(() => {
        const elapsed = Math.round((Date.now() - startTime) / 60000);
        console.log(`[SOAK_HEARTBEAT] Elapsed: ${elapsed}min | Sent: ${stats.total_sent} | Success: ${stats.success} | Fail: ${stats.fail}`);
    }, 60000);
}

function printFinalReport() {
    console.log("\n=== SOAK TEST FINAL REPORT ===");
    console.log(`Duration: ${DURATION_TOTAL_MIN} min`);
    console.log(`Total Jobs: ${stats.total_sent}`);
    console.log(`Success: ${stats.success}`);
    console.log(`Fail: ${stats.fail}`);

    const avgLatency = stats.latency.length ? (stats.latency.reduce((a, b) => a + b, 0) / stats.latency.length).toFixed(2) : 0;
    console.log(`Avg Latency: ${avgLatency}ms`);
    console.log("Test Case Results:", JSON.stringify(stats.test_cases, null, 2));
}

runSoak();

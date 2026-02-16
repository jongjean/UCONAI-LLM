/**
 * UCONAI Enterprise Ops Dashboard v1.3
 * 
 * Objective: 24h Trend Analysis, SLO Compliance, and Failure Categorization.
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./uconai.db');

const query = `
    WITH RecentTelemetry AS (
        SELECT 
            CAST(json_extract(meta, '$.heapUsed') AS REAL) / 1024 / 1024 as heapMB,
            CAST(json_extract(meta, '$.p99Lag') AS REAL) as lagP99,
            CAST(json_extract(meta, '$.maxLag') AS REAL) as lagMax,
            CAST(json_extract(meta, '$.queueDepth') AS INTEGER) as qDepth,
            created_at
        FROM job_logs 
        WHERE span_type = 'TELEMETRY'
        AND created_at > datetime('now', '-24 hours')
    )
    SELECT 
        COUNT(*) as samples,
        AVG(heapMB) as avgHeap,
        MAX(heapMB) as maxHeap,
        MIN(heapMB) as minHeap,
        AVG(lagP99) as avgP99,
        MAX(lagMax) as peakLag,
        AVG(qDepth) as avgQueue,
        (SELECT COUNT(*) FROM jobs WHERE status = 'COMPLETED') as success_count,
        (SELECT COUNT(*) FROM jobs WHERE status = 'FAILED_SAFE') as fail_count,
        (SELECT COUNT(*) FROM job_logs WHERE level = 'ERROR' AND created_at > datetime('now', '-1 hour')) as errors_1h
    FROM RecentTelemetry;
`;

const errorQuery = `
    SELECT error, COUNT(*) as count 
    FROM jobs 
    WHERE status = 'FAILED_SAFE' AND error IS NOT NULL 
    GROUP BY error 
    ORDER BY count DESC 
    LIMIT 10;
`;

db.get(query, (err, row) => {
    if (err || !row || row.samples === 0) {
        console.error("Dashboard Error: No telemetry data in last 24h.");
        db.close();
        return;
    }

    db.all(errorQuery, (err, errors) => {
        console.log("\n" + "=".repeat(60));
        console.log(" UCONAI ENTERPRISE OPS COMMAND CENTER v1.3");
        console.log("=".repeat(60));

        const total = row.success_count + row.fail_count;
        const rate = ((row.success_count / (total || 1)) * 100).toFixed(1);
        const uptimeStr = process.uptime() > 3600 ? `${(process.uptime() / 3600).toFixed(1)}h` : `${(process.uptime() / 60).toFixed(1)}m`;

        console.log(`[AVAILABILITY & GOVERNANCE]`);
        console.log(`- Status:       [ 🟢 ONLINE ] | Uptime: ${uptimeStr}`);
        console.log(`- Success Rate: ${rate}% (${row.success_count} OK / ${row.fail_count} FAIL)`);
        console.log(`- 1h Error Spikes: ${row.errors_1h}`);
        console.log(`- Total Telemetry Samples: ${row.samples}`);

        console.log(`\n[VITAL PERFORMANCE (24h Window)]`);
        console.log(`- Event Loop P99 (Avg): ${row.avgP99.toFixed(2)}ms`);
        console.log(`- Event Loop Peak:      ${row.peakLag.toFixed(2)}ms`);
        console.log(`- Queue Depth (Avg):    ${row.avgQueue.toFixed(2)} jobs`);

        console.log(`\n[MEMORY HEALTH]`);
        console.log(`- Heap Usage:   Avg ${row.avgHeap.toFixed(2)}MB | Max ${row.maxHeap.toFixed(2)}MB`);
        const drift = row.maxHeap - row.minHeap;
        const driftColor = drift < 10 ? "🟢" : (drift < 50 ? "🟡" : "🔴");
        console.log(`${driftColor} Heap Drift:  ${drift.toFixed(2)} MB variance detected.`);

        if (errors && errors.length > 0) {
            console.log(`\n[TOP FAILURE MODES]`);
            errors.forEach(e => {
                const label = (e.error || 'UNSPECIFIED').substring(0, 40);
                console.log(`  > ${label.padEnd(42)} : ${e.count}`);
            });
        }

        console.log("=".repeat(60) + "\n");
        db.close();
    });
});

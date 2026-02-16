/**
 * UCONAI SLO Predictive Monitor (Phase 4 Hardening)
 * 
 * Objective: Predict future SLO violations based on current trends.
 * Thresholds: 
 * - Heap Drift > 5% in 24h
 * - Availability < 99.9%
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./uconai.db');

const PREDICT_QUERY = `
    WITH RecentData AS (
        SELECT 
            id,
            created_at,
            CAST(json_extract(meta, '$.heapUsed') AS REAL) / 1024 / 1024 as heapMB
        FROM job_logs 
        WHERE span_type = 'TELEMETRY'
        ORDER BY id DESC 
        LIMIT 60 -- Last hour (if 60s interval)
    ),
    SlopeData AS (
        SELECT 
            MIN(heapMB) as initialHeap,
            MAX(heapMB) as currentHeap,
            (SELECT heapMB FROM RecentData ORDER BY id ASC LIMIT 1) as firstInWindow,
            (SELECT heapMB FROM RecentData ORDER BY id DESC LIMIT 1) as lastInWindow
        FROM RecentData
    )
    SELECT 
        firstInWindow,
        lastInWindow,
        (lastInWindow - firstInWindow) as driftInHour
    FROM SlopeData;
`;

db.get(PREDICT_QUERY, (err, row) => {
    if (err || !row) {
        console.error("Prediction Error:", err ? err.message : "No data");
    } else {
        const driftPerHour = row.driftInHour || 0;
        const driftIn24h = driftPerHour * 24;
        const baseline = row.firstInWindow;
        const driftPercent = (driftIn24h / baseline) * 100;

        console.log("\n=== UCONAI SLO PREDICTIVE ANALYTICS ===");
        console.log(`- Current Drift Rate: ${driftPerHour.toFixed(4)} MB/hr`);
        console.log(`- Projected 24h Drift: ${driftIn24h.toFixed(2)} MB (${driftPercent.toFixed(2)}%)`);

        if (driftPercent > 5) {
            console.log("🔴 WARNING: Projected drift exceeds 5% SLO.");
        } else if (driftPercent > 2) {
            console.log("🟡 CAUTION: Drift detected, monitor closely.");
        } else {
            console.log("🟢 OPTIMAL: Memory trend is flat or decreasing.");
        }
        console.log("========================================\n");
    }
    db.close();
});

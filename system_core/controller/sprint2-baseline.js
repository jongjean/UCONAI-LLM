/**
 * Sprint 2 Baseline Analysis Tool
 * 
 * Objective: Measure current Token usage and Planner performance
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./uconai.db');

console.log("\n=== SPRINT 2 BASELINE ANALYSIS ===\n");

// 1. Planner Performance Analysis
const plannerQuery = `
    SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as success,
        COUNT(CASE WHEN status = 'FAILED_SAFE' AND error LIKE '%PARSE_ERR%' THEN 1 END) as planner_failures,
        AVG(CASE 
            WHEN status = 'COMPLETED' 
            THEN (julianday(updated_at) - julianday(created_at)) * 86400000 
        END) as avg_e2e_latency_ms
    FROM jobs
    WHERE created_at > datetime('now', '-6 hours');
`;

db.get(plannerQuery, (err, row) => {
    if (err) {
        console.error("Planner Query Error:", err.message);
        return;
    }

    console.log("[PLANNER PERFORMANCE (Last 6h)]");
    console.log(`- Total Jobs: ${row.total_jobs}`);
    console.log(`- Success: ${row.success} (${((row.success / row.total_jobs) * 100).toFixed(1)}%)`);
    console.log(`- Planner Failures: ${row.planner_failures}`);
    console.log(`- Avg E2E Latency: ${row.avg_e2e_latency_ms ? row.avg_e2e_latency_ms.toFixed(0) : 'N/A'}ms`);

    // 2. Token Usage Estimation
    const avgPromptLength = 450; // Estimated from _buildPrompt
    const avgResponseLength = 300; // Estimated JSON plan
    const totalTokensPerJob = Math.ceil((avgPromptLength + avgResponseLength) / 4); // Rough token estimate

    console.log(`\n[TOKEN USAGE ESTIMATE (Baseline)]`);
    console.log(`- Avg Prompt Length: ~${avgPromptLength} chars`);
    console.log(`- Avg Response Length: ~${avgResponseLength} chars`);
    console.log(`- Estimated Tokens/Job: ~${totalTokensPerJob} tokens`);
    console.log(`- Total Token Usage (6h): ~${(totalTokensPerJob * row.total_jobs).toLocaleString()} tokens`);

    // 3. Timeout Analysis
    const timeoutQuery = `
        SELECT 
            error,
            COUNT(*) as count
        FROM jobs
        WHERE status = 'FAILED_SAFE' 
        AND (error LIKE '%TIMEOUT%' OR error LIKE '%timeout%')
        AND created_at > datetime('now', '-6 hours')
        GROUP BY error;
    `;

    db.all(timeoutQuery, (err, timeouts) => {
        console.log(`\n[TIMEOUT BREAKDOWN]`);
        if (timeouts && timeouts.length > 0) {
            timeouts.forEach(t => {
                console.log(`  > ${t.error}: ${t.count} occurrences`);
            });
        } else {
            console.log(`  > No timeout errors in last 6h`);
        }

        // 4. Optimization Targets
        console.log(`\n[M4-2.2 OPTIMIZATION TARGETS]`);
        console.log(`✅ Goal: Reduce token usage by 30%`);
        console.log(`   Target: ${Math.ceil(totalTokensPerJob * 0.7)} tokens/job`);
        console.log(`✅ Goal: Reduce Planner latency to <5s`);
        console.log(`   Current E2E: ${row.avg_e2e_latency_ms ? row.avg_e2e_latency_ms.toFixed(0) : 'N/A'}ms`);

        console.log("\n=====================================\n");
        db.close();
    });
});

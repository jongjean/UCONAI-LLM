/**
 * 📊 Risk Evaluator (M7.2.1)
 * Calculates real-time Risk Score (0-100) based on audit and job history.
 */
class RiskEvaluator {
    constructor() {
        this.db = null;
    }

    init(db) {
        this.db = db;
    }

    /**
     * Calculate Risk Score for a specific team
     * Formula: (Violations * 5) + (Abort Freq * 2) + (Quota Breach * 3) + (Error Rate * 1.5)
     */
    async calculateScore(teamId) {
        if (!this.db) return 0;

        try {
            // [M7.2.1.1] Fetch metrics from last 1 hour
            const metrics = await this._getMetrics(teamId);

            let score = (metrics.violations * 5) +
                (metrics.aborts * 2) +
                (metrics.quotaBreaches * 3) +
                (metrics.errorRate * 1.5);

            // Cap at 100
            return Math.min(100, Math.max(0, score));
        } catch (error) {
            console.error('[RiskEvaluator] Calculation Error:', error.message);
            return 50; // Neutral risk on error (Fail-Safe)
        }
    }

    async _getMetrics(teamId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    SUM(CASE WHEN action = 'GLOBAL_MEMORY_SEARCH' OR action = 'AUTH_FAIL' THEN 1 ELSE 0 END) as violations,
                    SUM(CASE WHEN status = 'FAILED' AND result LIKE '%E_ABORTED%' THEN 1 ELSE 0 END) as aborts,
                    SUM(CASE WHEN result LIKE '%QUOTA_EXCEEDED%' THEN 1 ELSE 0 END) as quotaBreaches,
                    AVG(CASE WHEN status = 'FAILED' THEN 1.0 ELSE 0.0 END) * 10 as errorRate
                FROM jobs 
                WHERE team_id = ? AND created_at > datetime('now', '-1 hour')
            `;

            this.db.get(sql, [teamId], (err, row) => {
                if (err) reject(err);
                else {
                    resolve({
                        violations: row.violations || 0,
                        aborts: row.aborts || 0,
                        quotaBreaches: row.quotaBreaches || 0,
                        errorRate: row.errorRate || 0
                    });
                }
            });
        });
    }
}

module.exports = new RiskEvaluator();

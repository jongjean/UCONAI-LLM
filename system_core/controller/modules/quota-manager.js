/**
 * Quota Manager (M4-4.2)
 * 
 * Manages daily job limits per user role using SQLite.
 * Ensures atomicity and persistence across restarts.
 */
const RBAC = require('../config/rbac-policy');
const AuditLogger = require('./audit-logger'); // [M4-4.3] Audit Log

class QuotaManager {
    constructor() {
        this.db = null;
    }

    init(db) {
        this.db = db;
        AuditLogger.init(db); // [M4-4.3] Audit Log Init
        // [M4-4.2] Create Quota Table + [M5-2.2] Multi-target support
        this.db.run(`CREATE TABLE IF NOT EXISTS daily_quotas (
            target_type TEXT, -- ROLE or TEAM
            target_id TEXT,
            date TEXT,
            job_count INTEGER DEFAULT 0,
            PRIMARY KEY (target_type, target_id, date)
        )`, (err) => {
            if (err) console.error('[QuotaManager] DB Init Error:', err.message);
        });
    }

    /**
     * Check and increment daily job count. (M4-4.2 Role + M5-2.2 Team)
     * @param {string} role - User Role
     * @param {number|null} teamId - Team ID
     * @returns {Promise<boolean>}
     */
    async checkAndIncrement(role, teamId = null) {
        if (!this.db) throw new Error("QuotaManager not initialized");

        let targetType = 'ROLE';
        let targetId = role;
        let limit = 0;

        // 1. Determine Effective Limit (M5-2.2)
        if (teamId) {
            const team = await new Promise(res => this.db.get("SELECT daily_quota FROM teams WHERE id = ?", [teamId], (err, row) => res(row)));
            if (team) {
                targetType = 'TEAM';
                targetId = String(teamId);
                limit = team.daily_quota;
            }
        }

        // 2. Fallback to Role Quota if no Team Quota
        if (limit === 0) {
            const rolePolicy = RBAC.roles[role] || RBAC.roles[RBAC.defaultRole];
            if (!rolePolicy || !rolePolicy.quotas) return true; // No quota
            limit = rolePolicy.quotas.maxDailyJobs;
        }

        if (limit === 0) return true; // Unlimited

        const today = new Date().toISOString().split('T')[0];

        return new Promise((resolve, reject) => {
            // 3. Ensure record exists
            this.db.run(`INSERT OR IGNORE INTO daily_quotas (target_type, target_id, date, job_count) VALUES (?, ?, ?, 0)`,
                [targetType, targetId, today],
                (err) => {
                    if (err) return reject(err);

                    // 4. Atomic Increment with Check
                    this.db.run(`UPDATE daily_quotas 
                                 SET job_count = job_count + 1 
                                 WHERE target_type = ? AND target_id = ? AND date = ? AND job_count < ?`,
                        [targetType, targetId, today, limit],
                        function (err) {
                            if (err) return reject(err);

                            const success = this.changes > 0;
                            if (!success) {
                                AuditLogger.log('WARN', 'QUOTA', `${targetType}:${targetId}`, 'EXCEED', 'DailyLimit', { limit, today });
                            }
                            resolve(success);
                        }
                    );
                }
            );
        });
    }

    /**
     * Get current usage (for telemetry/status)
     */
    async getUsage(role) {
        if (!this.db) return 0;
        const today = new Date().toISOString().split('T')[0];

        return new Promise((resolve, reject) => {
            this.db.get(`SELECT job_count FROM daily_quotas WHERE user_role = ? AND date = ?`,
                [role, today],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.job_count : 0);
                }
            );
        });
    }
}

module.exports = new QuotaManager();

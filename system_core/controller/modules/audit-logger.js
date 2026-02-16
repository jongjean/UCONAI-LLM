/**
 * Audit Logger (M4-4.3)
 * 
 * Centralized security event logging for compliance and monitoring.
 * distinct from debug logs; focuses on security-relevant actions.
 */
class AuditLogger {
    constructor() {
        this.db = null;
    }

    init(db) {
        this.db = db;
        // [M4-4.3] Create Audit Log Table + [M5.5] Tenant Columns
        this.db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            severity TEXT,
            category TEXT,
            actor TEXT,
            action TEXT,
            target TEXT,
            details TEXT,
            user_id INTEGER,
            team_id INTEGER
        )`, (err) => {
            if (err) console.error('[AuditLogger] DB Init Error:', err.message);
        });
    }

    /**
     * Log Security Event with Tenant Context (M6.1)
     */
    log(severity, category, actor, action, target, details = {}, userId = null, teamId = null) {
        if (!this.db) return;

        // [M6.4.2] Performance Hardening: Atomic Write with Error Code
        this.db.run(`INSERT INTO audit_logs (severity, category, actor, action, target, details, user_id, team_id) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [severity, category, actor, action, target, JSON.stringify(details), userId, teamId],
            (err) => {
                if (err) {
                    console.error(`[ERROR] E_AUDIT_WRITE_DEGRADED: Audit Write Failed - ${err.message}`);
                }
            }
        );

        if (severity === 'ALERT') {
            console.error(`[SECURITY ALERT] ${category} - ${action} by ${actor} [Team:${teamId}]`);
        }
    }

    /**
     * [M5.5 Repository Pattern] - Fetch logs with mandatory team filtering
     */
    async getLogsByTeam(teamId, limit = 20, isAdmin = false) {
        if (!this.db) throw new Error("DB_NOT_INIT");
        if (!isAdmin && teamId === undefined) throw new Error("E_ISOLATION_VIOLATION: teamId required");

        return new Promise((resolve, reject) => {
            const query = isAdmin ?
                "SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?" :
                "SELECT * FROM audit_logs WHERE team_id = ? ORDER BY id DESC LIMIT ?";
            const params = isAdmin ? [limit] : [teamId, limit];

            this.db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = new AuditLogger();

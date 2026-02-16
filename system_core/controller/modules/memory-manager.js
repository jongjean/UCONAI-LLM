/**
 * Memory Repository (M6-1.1 Hardened)
 * 
 * [C11] Context Contract based isolation
 * [C12] Tenant Mandatory Filter
 * [C14] Provenance Trace
 */
const crypto = require('crypto');

class MemoryRepository {
    constructor() {
        this.db = null;
    }

    init(db) {
        this.db = db;
        // [C14] Hardened Schema with Hash & Provenance
        this.db.run(`CREATE TABLE IF NOT EXISTS memory_store (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            job_id TEXT,
            type TEXT, -- SUMMARY, DOCUMENT, PATTERN
            content TEXT NOT NULL,
            content_hash TEXT,
            metadata TEXT, -- JSON: score, source, etc.
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_mem_team ON memory_store(team_id)`);
    }

    /**
     * [M6.1.3] Search with Mandatory SQL Isolation
     */
    async search(ctx, query, limit = 5) {
        this._verifyCtx(ctx);
        // [M6.2.2] Loop Abort Checkpoint (100ms Target)
        if (ctx.abortSignal && ctx.abortSignal.aborted) throw new Error('E_ABORTED_BY_SIGNAL');

        const isGlobal = ctx.role === 'ADMIN' && ctx.viewAllTenants === true;

        // [M6.1.4] Governance Audit
        if (isGlobal) {
            const AuditLogger = require('./audit-logger');
            AuditLogger.log('ALERT', 'PRIVILEGE', 'SYSTEM', 'GLOBAL_MEMORY_SEARCH', 'memory_store',
                { actorId: ctx.actorId, query }, ctx.actorId, ctx.teamId);
        }

        return new Promise((resolve, reject) => {
            const sql = isGlobal ?
                `SELECT id, type, content, content_hash, metadata, created_at FROM memory_store WHERE content LIKE ? ORDER BY id DESC LIMIT ?` :
                `SELECT id, type, content, content_hash, metadata, created_at FROM memory_store WHERE team_id = ? AND content LIKE ? ORDER BY id DESC LIMIT ?`;

            const params = isGlobal ? [`%${query}%`, limit] : [ctx.teamId, `%${query}%`, limit];

            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else {
                    // [M6.3.1] Extended Provenance Metadata
                    resolve(rows.map(r => ({
                        memoryId: r.id,
                        type: r.type,
                        content: r.content,
                        hash: r.content_hash,
                        createdAt: r.created_at,
                        metadata: JSON.parse(r.metadata || '{}')
                    })));
                }
            });
        });
    }

    /**
     * [M6.1.1] Learn with Strict Context
     */
    async learn(ctx, record) {
        this._verifyCtx(ctx);
        if (ctx.abortSignal && ctx.abortSignal.aborted) throw new Error('E_ABORTED_BY_SIGNAL');

        const { jobId, type, content, metadata = {} } = record;
        const contentHash = crypto.createHash('sha256').update(content).digest('hex');

        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO memory_store (team_id, user_id, job_id, type, content, content_hash, metadata) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [ctx.teamId, ctx.actorId, jobId, type, content, contentHash, JSON.stringify(metadata)],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    _verifyCtx(ctx) {
        // [M6.1.2] Access Enforcement (Zero Bypass)
        if (!ctx || ctx.teamId === undefined || ctx.teamId === null) {
            const err = new Error("E_ISOLATION_VIOLATION: Missing mandatory team_id in context");
            err.code = 'E_ISOLATION_VIOLATION';
            throw err;
        }
        if (!ctx.actorId) {
            const err = new Error("E_AUTH_VIOLATION: Missing actor_id in context (C11)");
            err.code = 'E_AUTH_VIOLATION';
            throw err;
        }
    }
}

module.exports = new MemoryRepository();

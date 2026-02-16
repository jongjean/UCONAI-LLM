/**
 * Secure File System (M4-3.1 Scoped Sandbox)
 * 
 * Provides validated file operations enforcing security policy.
 * All file tools MUST use this module instead of raw 'fs'.
 */
const fs = require('fs').promises;
const path = require('path');
const policy = require('../config/security-policy');

class SecureFS {
    constructor() {
        this.root = policy.filesystem.workspaceRoot;
        this.db = null;
    }

    /**
     * Initialize DB Connection (M4-3.3)
     */
    init(db) {
        this.db = db;
        // Ensure table exists
        this.db.run(`CREATE TABLE IF NOT EXISTS fs_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT,
            path TEXT,
            op_type TEXT,
            backup_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('[SecureFS] DB Init Error:', err.message);
        });
    }

    /**
     * Record FS Transaction
     */
    _logTransaction(jobId, path, opType, backupPath) {
        if (!this.db || !jobId) return; // Skip if no DB or context

        this.db.run(`INSERT INTO fs_transactions (job_id, path, op_type, backup_path) VALUES (?, ?, ?, ?)`,
            [jobId, path, opType, backupPath],
            (err) => {
                if (err) console.error('[SecureFS] Log Error:', err.message);
            }
        );
    }

    /**
     * Resolve and validate path against security policy.
     * @param {Object} ctx - Context with jobId/teamId
     * @returns {string} - Validated absolute path
     */
    _validatePath(userPath, enforceExtension = false, ctx = {}) {
        const teamId = ctx.teamId;
        // [M5-2.1] Namespace isolation (team_X directory)
        const teamRoot = teamId ? path.join(this.root, `team_${teamId}`) : this.root;

        // Ensure team directory exists implicitly or we resolve it
        const resolved = path.resolve(teamRoot, userPath);

        // [C2] Sandbox Check
        if (!resolved.startsWith(teamRoot)) {
            const err = new Error(`Access Denied: Path '${userPath}' escapes sandbox root`);
            err.code = 'E_ACCESS_DENIED';
            throw err;
        }

        // [C3] Dangerous Pattern Check
        const fileName = path.basename(resolved);
        if (policy.filesystem.dangers.some(p => resolved.includes(p) || fileName === p)) {
            const err = new Error(`Access Denied: Forbidden pattern in '${userPath}'`);
            err.code = 'E_FORBIDDEN_PATTERN';
            throw err;
        }

        // [C4] Extension Check (Whitelist)
        if (enforceExtension) {
            const ext = path.extname(resolved).toLowerCase();
            if (!policy.filesystem.allowedExtensions.includes(ext)) {
                const err = new Error(`Access Denied: Extension '${ext}' not allowed`);
                err.code = 'E_FORBIDDEN_EXTENSION';
                throw err;
            }
        }

        return resolved;
    }

    async readFile(userPath, ctx = {}) {
        if (!policy.filesystem.allowRead) {
            throw new Error('E_POLICY_VIOLATION: Read operation disabled');
        }

        const safePath = this._validatePath(userPath, true, ctx);
        return fs.readFile(safePath, 'utf8');
    }

    /**
     * Atomic Write Operation (M4-3.2 + M4-3.3 Log)
     * 1. Write to .tmp file
     * 2. Rename original to .bak (if exists)
     * 3. Rename .tmp to target
     */
    async writeAtomic(userPath, content, ctx = {}) {
        if (!policy.filesystem.allowWrite) {
            throw new Error('E_POLICY_VIOLATION: Write operation disabled');
        }

        const jobId = typeof ctx === 'string' ? ctx : (ctx ? ctx.jobId : null);
        const teamId = ctx && ctx.teamId ? ctx.teamId : null;

        const safePath = this._validatePath(userPath, true, { teamId });
        const tempPath = `${safePath}.tmp`;
        const backupPath = `${safePath}.bak`;

        // Ensure directory exists
        await fs.mkdir(path.dirname(safePath), { recursive: true });

        // Check size limit
        if (content.length > policy.filesystem.maxFileSize) {
            throw new Error(`E_RESOURCE_LIMIT: Content size exceeds limit`);
        }

        // 1. Write to temp file
        await fs.writeFile(tempPath, content, 'utf8');

        // 2. Create backup if original exists
        let hasOriginal = false;
        try {
            await fs.access(safePath);
            hasOriginal = true;
            // Copy instead of rename for backup (safer if rename fails)
            await fs.copyFile(safePath, backupPath);
        } catch (e) { /* No original file */ }

        // 3. Atomic Rename (Replace)
        try {
            await fs.rename(tempPath, safePath);
        } catch (e) {
            // Cleanup temp
            await fs.unlink(tempPath).catch(() => { });
            throw new Error(`E_ATOMIC_FAIL: Rename failed - ${e.message}`);
        }

        // [M4-3.3] Log Transaction
        if (jobId) {
            this._logTransaction(jobId, userPath, 'WRITE', hasOriginal ? backupPath : null);
        }

        return {
            path: safePath,
            backup: hasOriginal ? backupPath : null,
            size: content.length
        };
    }

    /**
     * Rollback to backup version (M4-3.2)
     */
    async rollback(userPath, ctx = {}) {
        const safePath = this._validatePath(userPath, true, ctx);
        const backupPath = `${safePath}.bak`;

        try {
            await fs.access(backupPath);
        } catch (e) {
            throw new Error(`E_ROLLBACK_FAIL: No backup found for ${userPath}`);
        }

        // Restore backup
        await fs.copyFile(backupPath, safePath);
        return { restored: true, from: backupPath };
    }

    // Legacy wrapper for compatibility
    async writeFile(userPath, content) {
        // Redirect to atomic write for safety
        const result = await this.writeAtomic(userPath, content);
        return result.path;
    }

    async listDir(userPath, ctx = {}) {
        const safePath = this._validatePath(userPath, false, ctx);
        return fs.readdir(safePath);
    }

    async stat(userPath, ctx = {}) {
        const safePath = this._validatePath(userPath, false, ctx);
        return fs.stat(safePath);
    }

    /**
     * Rollback all operations for a specific Job ID (M4-5)
     */
    async rollbackJob(jobId) {
        if (!this.db) throw new Error("Database not initialized for SecureFS");

        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM fs_transactions WHERE job_id = ? ORDER BY id DESC`, [jobId], async (err, rows) => {
                if (err) return reject(err);
                if (!rows || rows.length === 0) return resolve({ changes: 0 });

                let successCount = 0;
                for (const row of rows) {
                    if (row.op_type === 'WRITE' && row.backup_path) {
                        try {
                            const targetPath = this._validatePath(row.path);
                            const backupPath = row.backup_path; // Already absolute in DB

                            // Restore backup
                            await fs.copyFile(backupPath, targetPath);
                            // Cleanup backup file
                            await fs.unlink(backupPath).catch(() => { });

                            successCount++;
                        } catch (e) {
                            console.error(`[SecureFS] Rollback failed for ${row.path}: ${e.message}`);
                        }
                    }
                }

                // [M4-4.3] Log the rollback event
                this._logTransaction(jobId, 'SYSTEM', 'ROLLBACK', `Restored ${successCount} files`);
                resolve({ changes: successCount });
            });
        });
    }
}

module.exports = new SecureFS();

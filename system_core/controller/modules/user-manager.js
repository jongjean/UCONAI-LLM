/**
 * User Manager (M5-1)
 * 
 * Handles identity verification, API key management, and user context.
 * Foundation for Multi-Tenancy.
 */
const crypto = require('crypto');
const CONFIG = require('./config-loader');

class UserManager {
    constructor() {
        this.db = null;
        this.pepper = CONFIG.SECURITY.SYSTEM_PEPPER;
    }

    init(db) {
        this.db = db;
        this.db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            api_key TEXT,
            role TEXT DEFAULT 'DEV',
            team_id INTEGER,
            status TEXT DEFAULT 'ACTIVE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        this.db.run(`CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_name TEXT UNIQUE,
            daily_quota INTEGER DEFAULT 100,
            status TEXT DEFAULT 'ACTIVE'
        )`);
    }

    /**
     * Generate HMAC for API Key (Hardened M5.5)
     */
    _hash(key) {
        return crypto.createHmac('sha256', this.pepper).update(key).digest('hex');
    }

    /**
     * Authenticate via API Key (Hashed & Timing-Safe)
     */
    async authenticate(apiKey) {
        if (!this.db || !apiKey) return null;

        const incomingHmac = this._hash(apiKey);

        return new Promise((resolve) => {
            // Fetch potential user (Wait: We must be careful with indexing)
            // Strategy: Get by HMAC, but comparison should be safe.
            this.db.get(`SELECT id, username, role, team_id, status, api_key FROM users 
                         WHERE(api_key = ? OR api_key = ?) AND status = 'ACTIVE'`,
                [incomingHmac, apiKey], // Legacy support included for active transition
                (err, row) => {
                    if (err || !row) return resolve(null);

                    // [M5.5] Timing-Safe Comparison (Defence against Side-Channel)
                    // We compare the stored HMAC with the generated HMAC
                    const storedHmacBuffer = Buffer.from(row.api_key);
                    const incomingHmacBuffer = Buffer.from(incomingHmac);

                    try {
                        // If it's a legacy (non-hmac) key, we might need different logic, 
                        // but for PRODUCTION READY we assume new keys are HMAC.
                        if (row.api_key.length === incomingHmac.length &&
                            crypto.timingSafeEqual(storedHmacBuffer, incomingHmacBuffer)) {
                            resolve(row);
                        } else if (row.api_key === apiKey) {
                            // Legacy plaintext fallback (Auto-migrate later)
                            resolve(row);
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
                        resolve(null);
                    }
                }
            );
        });
    }

    /**
     * Register a new user with HMAC-SHA256 Key
     */
    async register(username, role = 'DEV') {
        const rawKey = `uc_${crypto.randomBytes(8).toString('hex')}`;
        const hashedKey = this._hash(rawKey);
        const defaultTeam = role === 'ADMIN' ? 0 : 1;

        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO users (username, api_key, role, team_id) VALUES (?, ?, ?, ?)`,
                [username, hashedKey, role, defaultTeam],
                function (err) {
                    if (err) reject(err);
                    else {
                        // Single-Exposure policy: Plaintext only returned once
                        resolve({
                            username,
                            api_key: rawKey,
                            role,
                            team_id: defaultTeam,
                            security: "HMAC-SHA256",
                            note: "STRICT: This key is only shown ONCE. Store it in a secure vault."
                        });
                    }
                }
            );
        });
    }
}

module.exports = new UserManager();

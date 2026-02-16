/**
 * ❄️ Cooldown Manager (M7.2.3)
 * Prevents system oscillation by enforcing a gradual release period after a LOCKDOWN.
 */
class CooldownManager {
    constructor() {
        this.records = {}; // { teamId: { lastLockdown: timestamp } }
        this.COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes default
    }

    /**
     * Mark a team as having entered LOCKDOWN
     */
    trigger(teamId) {
        this.records[teamId] = {
            lastLockdown: Date.now()
        };
    }

    /**
     * Determine the current cooldown phase for a team
     * @returns {string} - 'STRICT' (Still in Cooldown) or 'CLEAR'
     */
    getPhase(teamId) {
        const record = this.records[teamId];
        if (!record) return 'CLEAR';

        const elapsed = Date.now() - record.lastLockdown;
        if (elapsed < this.COOLDOWN_MS) {
            return 'STRICT';
        }

        // Auto-cleanup after cooldown expires
        delete this.records[teamId];
        return 'CLEAR';
    }

    getRemainingSeconds(teamId) {
        const record = this.records[teamId];
        if (!record) return 0;
        const remaining = this.COOLDOWN_MS - (Date.now() - record.lastLockdown);
        return Math.max(0, Math.floor(remaining / 1000));
    }
}

module.exports = new CooldownManager();

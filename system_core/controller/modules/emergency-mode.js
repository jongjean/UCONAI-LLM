/**
 * 🚨 Hybrid Fail-Safe Engine (M7.3.3)
 * Provides "Survival Mode" when Governance is unresponsive.
 * Rules: No Writes, No Cloud, No Shell, Read-Only ONLY.
 */
class FailSafeEngine {
    constructor() {
        this.isInEmergency = false;
        this.failSafeCounter = 0;
        this.policyDegradeCount = 0;
        this.overrides = new Map(); // Map<scope, { expiresAt, reason, actor }>

        // Strictly allowed tools during emergency
        this.SAFE_READ_TOOLS = ['read_file', 'system_status', 'query_knowledge'];
    }

    /**
     * Calculate Drift Index (Audit v3.3)
     */
    getDriftIndex() {
        const score = (this.failSafeCounter * 20) + (this.policyDegradeCount * 5);
        if (score === 0) return 'STABLE';
        if (score < 30) return 'WARNING';
        if (score < 70) return 'CHRONIC_DRIFT';
        return 'STRUCTURAL_FAILURE';
    }

    /**
     * Engage Emergency Mode
     */
    engage(reason) {
        if (!this.isInEmergency) {
            this.failSafeCounter++;
            console.error(`[CRITICAL] GOVERNANCE_DEAD_EVENT: ${reason} (Drift: ${this.getDriftIndex()})`);
            this.isInEmergency = true;
        }
    }

    /**
     * Apply Human Override (C24 Supremacy)
     * Duration is MANDATORY. No permanent overrides.
     */
    applyOverride(scope, durationSec, reason, actor) {
        const expiresAt = Date.now() + (durationSec * 1000);
        this.overrides.set(scope, { expiresAt, reason, actor });
        console.warn(`[C24] PRIVILEGE_OVERRIDE_ENGAGED: Scope=${scope}, Actor=${actor}, Reason=${reason}, ExpiresIn=${durationSec}s`);
    }

    /**
     * Check if a specific scope is overridden
     */
    isOverridden(scope) {
        const override = this.overrides.get(scope) || this.overrides.get('global');
        if (!override) return false;

        if (Date.now() > override.expiresAt) {
            this.overrides.delete(scope);
            return false;
        }
        return true;
    }

    /**
     * Disengage (Requires Admin Manual Override later)
     */
    reset() {
        this.isInEmergency = false;
    }

    /**
     * Evaluate action during emergency
     */
    allow(target) {
        // C24: Human Sovereignty check first
        if (this.isOverridden('global') || this.isOverridden(target)) return true;
        if (!this.isInEmergency) return true;

        const toolName = target.replace('tool:', '');
        return this.SAFE_READ_TOOLS.includes(toolName);
    }
}

module.exports = new FailSafeEngine();

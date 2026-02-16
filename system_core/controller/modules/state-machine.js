/**
 * 🚦 Governance State Machine (M7.2.4)
 * Defines the operational modes based on risk levels.
 */
const GOV_STATES = {
    SAFE: { priority: 0, label: 'SAFE', allow_cloud: true, max_delay: 0 },
    WATCH: { priority: 1, label: 'WATCH', allow_cloud: true, max_delay: 0 },
    THROTTLE: { priority: 2, label: 'THROTTLE', allow_cloud: false, max_delay: 2000 },
    LOCKDOWN: { priority: 3, label: 'LOCKDOWN', allow_cloud: false, max_delay: -1 } // -1 means Block
};

class GovernanceStateMachine {
    /**
     * Resolve the current state based on metrics and policy
     */
    resolveState(riskScore, thresholds, cooldownPhase) {
        if (riskScore >= thresholds.lockdown) return GOV_STATES.LOCKDOWN;

        // Cooldown period forces at least THROTTLE state
        if (cooldownPhase === 'STRICT') return GOV_STATES.THROTTLE;

        if (riskScore >= thresholds.throttle) return GOV_STATES.THROTTLE;
        if (riskScore >= thresholds.watch) return GOV_STATES.WATCH;

        return GOV_STATES.SAFE;
    }

    getStates() {
        return GOV_STATES;
    }
}

module.exports = new GovernanceStateMachine();

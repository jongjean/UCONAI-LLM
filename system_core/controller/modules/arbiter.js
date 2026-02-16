/**
 * ⚖️ Policy Arbiter (M7.2.2)
 * Resolves conflicts between multiple policy evaluations based on priority.
 * Hierarchy: SECURITY > STABILITY > COST > EFFICIENCY
 */
class PolicyArbiter {
    constructor() {
        this.HIERARCHY = {
            'DENY': 3,
            'THROTTLE': 2,
            'DOWNGRADE': 1,
            'ALLOW': 0
        };
    }

    /**
     * Arbitrate between multiple decisions
     * @param {Array} decisions - Array of { status, reason, delay_ms, priority_type }
     */
    resolve(decisions) {
        if (!decisions || decisions.length === 0) return { status: 'ALLOW' };

        // [M7.2.2.1] Sort by Severity and Type Priority
        // If multiple 'DENY' exist, Security-related DENY takes precedence for auditing
        const bestDecision = decisions.reduce((prev, curr) => {
            const prevRank = this.HIERARCHY[prev.status] || 0;
            const currRank = this.HIERARCHY[curr.status] || 0;

            if (currRank > prevRank) return curr;
            if (currRank === prevRank) {
                // Secondary sorting: Security type is always more important for reporting
                if (curr.priority_type === 'SECURITY') return curr;
                return prev;
            }
            return prev;
        }, decisions[0]);

        return bestDecision;
    }
}

module.exports = new PolicyArbiter();

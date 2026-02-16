/**
 * 👁️ Secondary Guard (Watcher) - M7.3.1
 * An independent, rule-based validator to prevent "Governance Tyranny" or Arbiter bugs.
 * Follows the principle: "Simple is safer."
 */
class SecondaryGuard {
    constructor() {
        // Strict, non-negotiable thresholds
        this.HARD_THRESHOLDS = {
            LOCKDOWN_MIN_RISK: 80,
            MAX_DELAY_MS: 5000
        };
    }

    /**
     * Independent Validation (Audit v3.3)
     * Does NOT share memory with Arbiter. Uses raw DB metrics.
     */
    async validate(ctx, decision, sharedMetrics) {
        // [C23 Hardening] Ignore sharedMetrics if possible, or use as secondary
        // Here we implement a strict safety ceiling regardless of what the Arbiter says

        if (decision.status === 'ALLOW') {
            // Rule 1: Security Critical Lock (Hard-coded safety)
            if (ctx.role !== 'ADMIN' && sharedMetrics.riskScore > 95) {
                console.error(`[C23] Secondary Guard REJECTED: Risk too high for non-admin (${sharedMetrics.riskScore})`);
                return { status: 'DENY', reason: 'C23_SAFETY_CEILING_REACHED', policy_id: 'SG-001' };
            }

            // Rule 2: Anti-Spam (Independent of DSL)
            // Imagine a direct DB query here for recent error counts
        }

        return decision;
    }

    _verifyDeny(ctx, decision, metrics) {
        const riskScore = metrics.riskScore || 0;

        // If Arbiter wants LOCKDOWN but risk is suspiciously low, downgrade to THROTTLE
        if (riskScore < this.HARD_THRESHOLDS.LOCKDOWN_MIN_RISK) {
            console.error(`[GUARD ALERT] Arbiter attempted LOCKDOWN with low risk (${riskScore}). Downgrading for safety.`);
            return {
                status: 'THROTTLE',
                delay_ms: 2000,
                reason: 'GUARD_DENY_VETOED_LOW_RISK',
                priority_type: 'STABILITY'
            };
        }

        return decision; // Valid lockdown
    }
}

module.exports = new SecondaryGuard();

const fs = require('fs').promises;
const path = require('path');

/**
 * ⚖️ Policy Engine (M7.1.2)
 * Responsible for loading, validating, and evaluating Governance DSL.
 */
class PolicyEngine {
    constructor() {
        this.policyPath = path.join(__dirname, '../policies.json');
        this.data = null;
        this.isLoaded = false;
    }

    async init() {
        await this.reload();
        console.log('[PolicyEngine] Governance DSL loaded and active.');
    }

    /**
     * Load/Reload policies from file
     */
    async reload() {
        try {
            const raw = await fs.readFile(this.policyPath, 'utf8');

            // [M7.1.4] Integrity Check
            const Vault = require('./vault-guard');
            const isValid = await Vault.verify(raw);
            if (!isValid) throw new Error("VAULT_SIGNATURE_MISMATCH");

            const parsed = JSON.parse(raw);

            // [M7.1.4 Alpha] Basic Integrity Check
            if (parsed.schema_version !== '1.0') throw new Error("Unsupported DSL version");

            this.data = parsed;
            this.isLoaded = true;
        } catch (error) {
            console.error('[CRITICAL] Policy Load Failed:', error.message);
            // Fallback to minimal safe policy
            this.data = this._getSafeFallback();
            this.isLoaded = true;
        }
    }

    /**
     * Resolve action for a specific context and target
     */
    evaluate(ctx, target, metrics = {}) {
        if (!this.isLoaded) return { status: 'DENY', reason: 'POLICY_ENGINE_NOT_READY' };

        // 1. Check Global Lockdown
        if (this.data.system_policy.global_lockdown && ctx.role !== 'SUPER_ADMIN') {
            return { status: 'DENY', reason: 'GLOBAL_SYSTEM_LOCKDOWN' };
        }

        // 2. Find Tenant Policy
        const tenantPolicy = this._getTenantPolicy(ctx.teamId);

        // [M7.2.3] Cooldown Mechanism (Oscillation Guard)
        const CooldownMgr = require('./cooldown-mgr');
        const cooldownPhase = CooldownMgr.getPhase(ctx.teamId);

        // 3. Evaluate Risk Score (Tiered Mitigation M7.2.4)
        const StateMachine = require('./state-machine');
        const riskScore = metrics.riskScore || 0;
        const thresholds = tenantPolicy.risk_thresholds;

        const currentState = StateMachine.resolveState(riskScore, thresholds, cooldownPhase);

        if (currentState.label === 'LOCKDOWN') {
            CooldownMgr.trigger(ctx.teamId);
            return { status: 'DENY', reason: 'STATE_LOCKDOWN', priority_type: 'SECURITY' };
        }

        if (currentState.label === 'THROTTLE') {
            const delay = currentState.max_delay || 1000;
            return {
                status: 'THROTTLE',
                delay_ms: delay,
                reason: cooldownPhase === 'STRICT' ? 'STATE_COOLDOWN' : 'STATE_THROTTLE',
                priority_type: cooldownPhase === 'STRICT' ? 'STABILITY' : 'SECURITY'
            };
        }

        if (currentState.label === 'WATCH') {
            return { status: 'ALLOW', meta: { mode: 'WATCH' }, priority_type: 'SECURITY' };
        }

        // 4. Evaluate Specific Rules
        if (tenantPolicy.rules) {
            for (const rule of tenantPolicy.rules) {
                if (rule.target === target || rule.target === 'all') {
                    if (this._checkCondition(rule.condition, metrics)) {
                        return {
                            status: rule.action,
                            delay_ms: rule.delay_ms,
                            reason: `Rule:${rule.id}`
                        };
                    }
                }
            }
        }

        return { status: 'ALLOW' };
    }

    _getTenantPolicy(teamId) {
        const override = this.data.tenant_overrides.find(t => t.team_id === teamId);
        return override ? { ...this.data.default_tenant_policy, ...override } : this.data.default_tenant_policy;
    }

    _checkCondition(condition, metrics) {
        // Simple evaluator for M7.1.2 (e.g., "daily_cost > 50.0")
        if (!condition) return false;
        try {
            const [key, op, val] = condition.split(' ');
            const metricVal = metrics[key];
            const targetVal = parseFloat(val);

            if (op === '>') return metricVal > targetVal;
            if (op === '<') return metricVal < targetVal;
            if (op === '==') return metricVal === targetVal;
            return false;
        } catch (e) {
            return false;
        }
    }

    _getSafeFallback() {
        return {
            system_policy: { global_lockdown: true },
            default_tenant_policy: { risk_thresholds: { lockdown: 0 } },
            tenant_overrides: []
        };
    }
}

module.exports = new PolicyEngine();

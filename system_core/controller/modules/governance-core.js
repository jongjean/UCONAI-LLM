/**
 * 🏛️ UCONAI Governance Core (G-Core) v1.0
 * [C15] Policy Primacy: Execution is a shadow of policy.
 * [C23] Dual Validation Readiness
 */
class GovernanceCore {
    constructor() {
        this.policies = null; // To be loaded via PolicyEngine
        this.isInitialized = false;
    }

    async init(db) {
        this.db = db;
        const PolicyEngine = require('./policy-engine');
        const RiskEvaluator = require('./risk-calc');
        await PolicyEngine.init();
        RiskEvaluator.init(db);
        this.isInitialized = true;
        console.log('[G-Core] Master Governance Core initialized with Policy & Risk engines.');
    }

    /**
     * [M7.1.1] Universal Hook: Authorize action before execution
     * @param {Object} ctx - Standardized Context (C11)
     * @param {string} tool - Tool name
     * @param {Object} args - Tool arguments
     */
    async authorize(ctx, tool, args) {
        const { performance } = require('perf_hooks');
        const startTime = performance.now();
        if (!this.isInitialized) throw new Error('E_GOVERNANCE_NOT_INIT');

        this._verifyCtx(ctx);

        const BoundaryMgr = require('./boundary-mgr');
        const HealthPulse = require('./health-pulse');
        const FailSafe = require('./emergency-mode');
        const target = `tool:${tool}`;

        if (!BoundaryMgr.isManaged(target)) {
            return { authorized: true, mode: 'AUTONOMOUS' };
        }

        try {
            // [C24/C22] Human Sovereignty & Emergency Check
            if (FailSafe.isInEmergency || FailSafe.isOverridden(target)) {
                if (FailSafe.allow(target)) {
                    return { authorized: true, mode: 'GOV_OVERRIDE', meta: { warning: 'DEGRADED_BY_SOVEREIGNTY' } };
                } else {
                    const err = new Error("E_FAIL_SAFE_BLOCK: System in survival mode");
                    err.code = 'E_FAIL_SAFE_BLOCK';
                    throw err;
                }
            }

            const RiskEvaluator = require('./risk-calc');
            const PolicyEngine = require('./policy-engine');
            const Arbiter = require('./arbiter');
            const SecondaryGuard = require('./watcher-guard');
            const AuditLogger = require('./audit-logger');

            const riskScore = await RiskEvaluator.calculateScore(ctx.teamId);
            const metrics = { riskScore, daily_cost: 0 };

            // --- [L1: Security Critical] ---
            const decisions = [PolicyEngine.evaluate(ctx, target, metrics)];
            let finalDecision = Arbiter.resolve(decisions);

            // --- [L2: Stability] ---
            finalDecision = await SecondaryGuard.validate(ctx, finalDecision, metrics);

            // --- [L3: Efficiency & Cost] (Graded Skip) ---
            const currentLatency = performance.now() - startTime;
            if (currentLatency < 40) {
                // Execute L3 checks here (CostMonitor, etc.)
                // Placeholder for future L3 checks
            } else {
                FailSafe.policyDegradeCount++;
                AuditLogger.log('WARN', 'GOV', 'PERF', 'DEGRADED', target, { latency: currentLatency, skipped: 'L3_EFFICIENCY' }, 0, 0);
            }

            const totalLatency = performance.now() - startTime;
            if (!HealthPulse.judge(totalLatency)) FailSafe.engage(HealthPulse.getStatus());

            if (finalDecision.status === 'DENY') {
                const err = new Error(`E_GOVERNANCE_REJECTED: ${finalDecision.reason}`);
                err.code = 'E_GOVERNANCE_REJECTED';
                err.policy_violation = finalDecision.policy_id;
                throw err;
            }

            if (finalDecision.status === 'THROTTLE') {
                const delay = finalDecision.delay_ms || 1000;
                AuditLogger.log('WARNING', 'GOV', 'SYSTEM', 'THROTTLE', target, { delay_ms: delay }, ctx.actorId, ctx.teamId);
                await new Promise(r => setTimeout(r, delay));
            }

            return {
                authorized: true,
                traceId: `gov_${Date.now()}`,
                vitals: { latency: totalLatency, drift: FailSafe.getDriftIndex() }
            };

        } catch (error) {
            if (error.code !== 'E_GOVERNANCE_REJECTED' && error.code !== 'E_FAIL_SAFE_BLOCK') HealthPulse.reportDB(false);
            throw error;
        }
    }
    /**
     * Internal Decision Logic (To be expanded in Sprint 2)
     */
    async _evaluate(ctx, tool, args) {
        // [Sprint 1] Basic Rule-based Shield (Secondary Guard Seed)

        // Example: Global Lockdown Check (C24 Placeholder)
        // if (global.SYSTEM_LOCKDOWN && ctx.role !== 'SUPER_ADMIN') {
        //    return { status: 'DENY', reason: 'System undergoing emergency lockdown', policy_id: 'SEC_001' };
        // }

        return { status: 'ALLOW', meta: { mode: 'DEFAULT' } };
    }

    _verifyCtx(ctx) {
        if (!ctx || ctx.teamId === undefined || ctx.teamId === null) {
            throw new Error("E_GOVERNANCE_FAULT: Context missing teamId");
        }
    }
}

module.exports = new GovernanceCore();

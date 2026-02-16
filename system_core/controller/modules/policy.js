/**
 * UCONAI 2.0 Policy Enforcement Engine (Fail-Safe)
 * 
 * Objective: Deterministic Decision Making based on Config Rules.
 * Input: Job Object
 * Output: Decision { decision, reason, score, cost_est }
 */

const CONFIG = require('./config-loader'); // Use Fail-Safe Loader

class PolicyEngine {
    constructor() {
        this.config = CONFIG;
    }

    /**
     * Main Decision Function (Executor Ready)
     * @param {Object} job - { module, action, args, history }
     * @returns {Object} - { decision, reason, score, cost_est, model, risk_level, requires_approval, allowed_tools }
     */
    decide(job) {
        // [1] Sanitation
        const sanitizedJob = {
            ...job,
            args: Array.isArray(job.args) ? job.args : (job.args ? [job.args] : []),
            history: Array.isArray(job.history) ? job.history : []
        };

        // Base Result
        const result = {
            decision: 'ROUTED_LOCAL',
            reason: 'DEFAULT',
            score: 0,
            cost_est: 0.0,
            model: this.config.MODELS ? this.config.MODELS.LOCAL.name : 'qwen2.5-14b-instruct',
            // [New] P2.1 Execution Control Fields
            risk_level: 'LOW',
            requires_approval: false,
            allowed_tools: ['read_file', 'system_status'], // Default Safe Tools
            budget_cap: 0.1
        };

        try {
            // [2] Safety Guard (Whitelist Check)
            if (!this.isSafeAction(sanitizedJob.module, sanitizedJob.action)) {
                return { ...result, decision: 'BLOCKED', reason: 'SAFETY_VIOLATION', score: 100, risk_level: 'HIGH', model: null };
            }

            // [3] Complexity Analysis
            result.score = this.calculateComplexityScore(sanitizedJob);

            // [4] Cost Estimation
            const { inputTokens, cost } = this.estimateCost(sanitizedJob);
            result.cost_est = isNaN(cost) || cost < 0 ? 0.0 : cost;

            // [5] Risk Assessment (New Logic)
            const risk = this.assessRisk(sanitizedJob);
            result.risk_level = risk.level;
            result.requires_approval = risk.level === 'HIGH';
            if (risk.level === 'HIGH' || risk.level === 'MEDIUM') {
                result.allowed_tools = ['read_file', 'write_file', 'search_web']; // Expanded tools for complex tasks
            }

            // [6] Routing Logic
            const inputLimit = this.config.THRESHOLDS ? this.config.THRESHOLDS.MAX_INPUT_TOKENS : 1000;
            const scoreLimit = this.config.THRESHOLDS ? this.config.THRESHOLDS.COMPLEXITY_SCORE : 50;

            // Rule A: High Complexity or High Risk -> Cloud
            if (result.score > scoreLimit || result.risk_level === 'HIGH') {
                result.decision = 'ROUTED_CLOUD';
                result.reason = result.risk_level === 'HIGH' ? 'HIGH_RISK_TASK' : 'HIGH_COMPLEXITY';
                result.model = this.config.MODELS.CLOUD.name;
            }

            // Rule B: Token Overflow -> Cloud
            if (inputTokens > inputLimit) {
                result.decision = 'ROUTED_CLOUD';
                result.reason = 'TOKEN_OVERFLOW';
                result.model = this.config.MODELS.CLOUD.name;
            }

            // Rule C: Approval Override
            if (result.requires_approval) {
                result.decision = 'APPROVAL_REQUIRED';
                result.reason = 'HIGH_RISK_CONFIRMATION';
            }

            return result;

        } catch (e) {
            // Global Fail-Safe
            return {
                decision: 'ROUTED_LOCAL',
                reason: `POLICY_ERROR_FALLBACK: ${e.message}`,
                score: 0,
                cost_est: 0.0,
                model: 'SAFE_LOCAL',
                risk_level: 'LOW',
                requires_approval: false
            };
        }
    }

    // [New] Assess Risk Level based on Keywords & Actions
    assessRisk(job) {
        const highRiskKeywords = ['delete', 'remove', 'kill', 'format', 'shutdown', 'reboot'];
        const mediumRiskKeywords = ['write', 'update', 'change', 'install', 'upload'];

        const argsStr = JSON.stringify(job.args).toLowerCase();

        // Level 3: HIGH (Destructive)
        if (highRiskKeywords.some(kw => argsStr.includes(kw)) || job.action === 'execute') {
            return { level: 'HIGH' };
        }

        // Level 2: MEDIUM (State Change)
        if (mediumRiskKeywords.some(kw => argsStr.includes(kw)) || job.module === 'fs') {
            return { level: 'MEDIUM' };
        }

        // Level 1: LOW (Read Only)
        return { level: 'LOW' };
    }

    isSafeAction(module, action) {
        if (!this.config.SAFE_ACTIONS) return false;
        const allowedActions = this.config.SAFE_ACTIONS[module] || [];
        return allowedActions.includes(action);
    }

    calculateComplexityScore(job) {
        let score = 0;

        // Factor 1: Args Length
        const argsStr = JSON.stringify(job.args || []);
        if (argsStr.length > 200) score += 20;
        if (argsStr.length > 1000) score += 40;

        // Factor 2: Action Type
        if (['analyze', 'summarize', 'review'].includes(job.action)) score += 30;
        if (['trace', 'metrics'].includes(job.action)) score += 10;

        return Math.min(score, 100);
    }

    estimateCost(job) {
        // Simple Token Estimation: 1 char ~= 0.25 tokens
        const argsStr = JSON.stringify(job.args || []);
        const inputTokens = Math.ceil(argsStr.length / 4);

        // Output Estimation: Heuristic (Input * 0.6)
        const outputTokens = Math.ceil(inputTokens * 0.6);

        // Calculate Cost based on Cloud Pricing (Local is 0)
        let price = { input: 0, output: 0 };
        if (this.config.MODELS && this.config.MODELS.CLOUD && this.config.MODELS.CLOUD.cost_per_1m) {
            price = this.config.MODELS.CLOUD.cost_per_1m;
        }

        // We calculate "Potential Cloud Cost" even if routed to Local, for comparison
        const cost = (inputTokens * price.input / 1000000) + (outputTokens * price.output / 1000000);

        return { inputTokens, outputTokens, cost };
    }
}

module.exports = new PolicyEngine();

/**
 * UCONAI Tool Guard v1.0 (Contract C2: Parameter Policy)
 * 
 * Objective: Validate execution plans for security and risk.
 * Features: Path Traversal prevention, Whitelist enforcement, Risk scoring.
 */

const POLICIES = require('./tool-policies');
const RBAC = require('../config/rbac-policy'); // [M4-4.1] Role Policy
const AuditLogger = require('./audit-logger'); // [M4-4.3] Audit Log
const path = require('path');

class ToolGuard {
    /**
     * Validate an entire plan
     * @param {Object} plan - The JSON plan from Planner
     * @returns {Object} { safe: boolean, risk_level: string, requires_approval: boolean, issues: Array }
     */
    validatePlan(plan, role = RBAC.defaultRole) {
        const report = {
            safe: true,
            risk_level: 'LOW',
            requires_approval: false,
            issues: []
        };

        // [M4-4.1] Validate Role
        const rolePolicy = RBAC.roles[role] || RBAC.roles[RBAC.defaultRole];
        if (!rolePolicy) {
            report.safe = false;
            report.issues.push(`Access Denied: Invalid role '${role}'`);
            AuditLogger.log('WARN', 'RBAC', role, 'DENY', 'PlanValidation', { reason: 'Invalid Role' });
            return report;
        }

        // [M4-4.2] Check Quotas (Max Steps)
        if (rolePolicy.quotas && plan.steps.length > rolePolicy.quotas.maxStepsPerJob) {
            report.safe = false;
            report.issues.push(`Quota Exceeded: Job steps (${plan.steps.length}) exceed role limit (${rolePolicy.quotas.maxStepsPerJob}) for '${role}'`);
            AuditLogger.log('WARN', 'QUOTA', role, 'EXCEED', 'MaxSteps', { steps: plan.steps.length, limit: rolePolicy.quotas.maxStepsPerJob });
            return report;
        }

        for (const step of plan.steps) {
            // [M4-4.1] Role-Based Access Control (RBAC) Check
            if (rolePolicy.allowedTools[0] !== '*') {
                const isAllowed = rolePolicy.allowedTools.includes(step.tool);
                const isForbidden = rolePolicy.forbiddenTools ? rolePolicy.forbiddenTools.includes(step.tool) : false;

                if (!isAllowed || isForbidden) {
                    report.safe = false;
                    report.issues.push(`Access Denied: Role '${role}' cannot use '${step.tool}'`);
                    AuditLogger.log('ALERT', 'RBAC', role, 'DENY', step.tool, { reason: 'Tool Forbidden' });
                    continue;
                }
            }

            const stepResult = this.validateStep(step);

            if (!stepResult.safe) {
                report.safe = false;
                report.issues.push(`Step ${step.id}: ${stepResult.reason}`);
            }

            // High risk escalation
            if (stepResult.risk === 'HIGH' || stepResult.risk === 'CRITICAL') {
                report.risk_level = stepResult.risk;
                report.requires_approval = true;
            } else if (stepResult.risk === 'MEDIUM' && report.risk_level === 'LOW') {
                report.risk_level = 'MEDIUM';
            }
        }

        return report;
    }

    /**
     * Validate a single tool execution step
     */
    validateStep(step) {
        const policy = POLICIES[step.tool];

        // 1. Whitelist Check
        if (!policy) {
            return { safe: false, reason: `Tool '${step.tool}' is not whitelisted` };
        }

        // 2. Enabled Check
        if (policy.enabled === false) {
            return { safe: false, reason: `Tool '${step.tool}' is currently disabled` };
        }

        // 3. Parameter Check (Spec-specific)
        if (step.tool === 'read_file' || step.tool === 'write_file') {
            const filePath = step.args.path;
            const pathResult = this._validatePath(filePath, policy);
            if (!pathResult.safe) return pathResult;
        }

        return { safe: true, risk: policy.risk };
    }

    _validatePath(filePath, policy) {
        if (!filePath) return { safe: false, reason: 'Missing path argument' };

        // Path Traversal Check
        if (filePath.includes('..')) {
            return { safe: false, reason: 'Path traversal (..) detected in arguments' };
        }

        // Forbidden Patterns Check
        if (policy.forbidden_patterns) {
            const forbidden = policy.forbidden_patterns.find(regex => regex.test(filePath));
            if (forbidden) {
                return { safe: false, reason: `Forbidden pattern detected in path: ${forbidden}` };
            }
        }

        // Root Directory Check
        if (policy.allowed_roots) {
            const normalizedPath = path.normalize(filePath);
            const isInsideAllowedRoot = policy.allowed_roots.some(root => {
                const normalizedRoot = path.normalize(root);
                return normalizedPath.startsWith(normalizedRoot);
            });

            if (!isInsideAllowedRoot) {
                return { safe: false, reason: `Access to path outside allowed roots: ${normalizedPath}` };
            }
        }

        return { safe: true };
    }
}

module.exports = new ToolGuard();

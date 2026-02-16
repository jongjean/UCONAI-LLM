/**
 * 🛰️ Governance Scope Manager (M7.1.3)
 * Defines the boundaries of control to prevent Over-Governance.
 */
class ScopeManager {
    constructor() {
        // [C20] Strict Boundaries
        this.MANAGED_SCOPES = [
            'tool_invocation',   // Tool calls
            'model_escalation', // Switching to high-cost models
            'write_operation',  // Filesystem modifications
            'cloud_access',     // Internet/External API
            'quota_consumption' // Resource limits
        ];

        this.AUTONOMOUS_SCOPES = [
            'internal_reasoning', // LLM thought process
            'prompt_content',     // The content of the prompt
            'memory_scoring'      // Similarity logic
        ];
    }

    /**
     * Determine if a target/action requires Governance authorization
     */
    isManaged(target) {
        if (!target) return false;

        // 1. Tool Check
        if (target.startsWith('tool:')) return true;

        // 2. Resource/Action Check
        if (this.MANAGED_SCOPES.some(scope => target.includes(scope))) return true;

        // 3. Known Autonomous Scopes (Bypass)
        if (this.AUTONOMOUS_SCOPES.some(scope => target.includes(scope))) return false;

        // Default: If unknown and potentially risky, manage it (Conservative)
        return false;
    }

    getManagedList() {
        return this.MANAGED_SCOPES;
    }
}

module.exports = new ScopeManager();

/**
 * Model Policy Configuration (M4-2.1 Gate 2)
 * 
 * Defines which models to use for each role and fallback strategy.
 */

module.exports = {
    roles: {
        PLANNER: {
            models: [
                { name: 'qwen3:4b', priority: 1, timeout: 15000 },
                { name: 'qwen3:8b', priority: 2, timeout: 30000 }
            ],
            concurrency: 2,
            fallbackToCloud: false,
            description: 'Fast JSON plan generation'
        },
        EXECUTOR: {
            models: [
                { name: 'qwen3:8b', priority: 1, timeout: 60000 },
                { name: 'gemma3:12b', priority: 2, timeout: 90000 }
            ],
            concurrency: 5,
            fallbackToCloud: false,
            description: 'Quality reasoning and analysis'
        },
        HEAVY: {
            models: [
                { name: 'gemma3:12b', priority: 1, timeout: 120000 },
                { name: 'gpt-oss:20b', priority: 2, timeout: 180000 }
            ],
            concurrency: 1,
            fallbackToCloud: false,
            description: 'Complex multi-step reasoning'
        },
        CHAT: {
            models: [
                { name: 'qwen3:8b', priority: 1, timeout: 60000 }
            ],
            concurrency: 3,
            fallbackToCloud: false,
            description: 'User-facing conversational responses'
        },
        ANALYSIS: {
            models: [
                { name: 'qwen3:8b', priority: 1, timeout: 60000 },
                { name: 'gemma3:12b', priority: 2, timeout: 90000 }
            ],
            concurrency: 2,
            description: 'Failure Root Cause Analysis (RCA)'
        },
        SUMMARY: {
            models: [
                { name: 'qwen3:4b', priority: 1, timeout: 15000 }
            ],
            concurrency: 2,
            description: 'Tool output summarization'
        }
    },

    // Escalation policy (manual approval required)
    escalation: {
        triggerOnFailCount: 2,  // Escalate after 2 consecutive local failures
        targetRole: 'HEAVY',
        cloudFallback: {
            enabled: false,  // Disabled by default, requires governance
            model: 'claude-3-opus-20240229',
            maxCallsPerHour: 10,
            requiresApproval: true
        }
    },

    // Global limits (across all roles)
    global: {
        maxConcurrentLLMCalls: 6,
        defaultTimeout: 60000,
        maxRetries: 1  // Max 1 fallback per role
    }
};

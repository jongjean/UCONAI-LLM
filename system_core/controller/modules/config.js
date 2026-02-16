/**
 * UCONAI 2.0 Core Intelligence Policy & Config
 * 
 * Objective: Centralized Policy Management for Gateway v8 Compatibility
 *            & Real-World Constraints (Cost/Model/Ops)
 */

module.exports = {
    // [1] Model Pricing & Specs (Sync with UCONAI Reality)
    MODELS: {
        LOCAL: {
            name: 'qwen2.5-14b-instruct', // Real Model Name (Ollama)
            provider: 'ollama',
            endpoint: 'http://localhost:11434',
            cost_per_1m: { input: 0, output: 0 },
            max_tokens: 4096 // Local Limit
        },
        CLOUD: {
            name: 'claude-3-5-sonnet-20240620', // Anthropic API
            provider: 'anthropic',
            // Current Price: Input $3.00 / Output $15.00 per 1M tokens
            cost_per_1m: { input: 3.00, output: 15.00 },
            max_tokens: 8192
        }
    },

    // [2] Thresholds (Safety Nets)
    THRESHOLDS: {
        COMPLEXITY_SCORE: 50, // > 50 -> Cloud
        MAX_INPUT_TOKENS: 2000, // > 2000 -> Cloud
        DAILY_COST_LIMIT_USD: 1.00, // Circuit Breaker for Billing
        HISTORY_TURNS: 10 // Max Context History
    },

    // [3] Safety Guard (Sync with Gateway v8 Registry)
    // Must match ai-bridge-v2.js COMMAND_REGISTRY
    SAFE_ACTIONS: {
        host: ['status', 'restart', 'logs'],
        pipe: ['pause', 'resume', 'test'],
        review: ['approve', 'reject', 'list'], // Review is safe logic
        ops: ['retry', 'trace', 'metrics'],
        llm: ['test_llm_cycle', 'chat', 'generate', 'plan_task']
    }
};

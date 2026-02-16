/**
 * UCONAI 2.0 Fail-Safe Configuration Loader
 * 
 * Objective: Load config.js robustly. If missing or invalid, fallback to SAFE_DEFAULTS.
 * Strategy: "Trust nothing, verify everything."
 */

const Logger = {
    warn: (msg, meta) => console.log(JSON.stringify({ level: 'WARN', message: msg, ...meta })),
    info: (msg, meta) => console.log(JSON.stringify({ level: 'INFO', message: msg, ...meta }))
};

// --- [HARDCODED SAFE DEFAULTS] ---
// Minimal set of rules to keep the system alive in worst-case scenarios.
const SAFE_DEFAULTS = {
    MODELS: {
        LOCAL: {
            name: 'qwen2.5-14b-instruct',
            provider: 'ollama',
            endpoint: 'http://localhost:11434',
            cost_per_1m: { input: 0, output: 0 },
            max_tokens: 2048
        },
        CLOUD: {
            name: 'claude-3-5-sonnet-20240620', // Fallback cloud model
            provider: 'anthropic',
            cost_per_1m: { input: 3.00, output: 15.00 },
            max_tokens: 4096
        }
    },
    THRESHOLDS: {
        COMPLEXITY_SCORE: 100, // Very high -> Prefer Local
        MAX_INPUT_TOKENS: 1000,
        DAILY_COST_LIMIT_USD: 0.50, // Conservative limit
        HISTORY_TURNS: 5
    },
    SAFE_ACTIONS: {
        // Only essential ops allowed in Safe Mode
        host: ['status', 'check'],
        pipe: ['status'],
        ops: ['metrics']
    },
    SECURITY: {
        SYSTEM_PEPPER: 'ucon_salt_777_hardened_p55', // [M5.5] Pepper for HMAC
        AUTH_TOKEN_TTL: 3600
    }
};

function loadConfig() {
    try {
        // Try loading actual config
        const userConfig = require('./config');

        // Ensure security exists (M5.5)
        if (!userConfig.SECURITY) userConfig.SECURITY = SAFE_DEFAULTS.SECURITY;

        return userConfig;

    } catch (e) {
        // Fallback Logic
        Logger.warn('Config Load Failed - Switching to SAFE MODE', { error: e.message });
        return SAFE_DEFAULTS;
    }
}

module.exports = loadConfig();

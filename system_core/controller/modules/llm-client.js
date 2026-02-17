const http = require('http');
const https = require('https');
const Semaphore = require('./semaphore');

// [Contract C7: Error Taxonomy]
const ERRORS = {
    TIMEOUT: 'E_TIMEOUT',
    TIMEOUT_LOCAL: 'E_TIMEOUT_LOCAL',
    TIMEOUT_CLOUD: 'E_TIMEOUT_CLOUD',
    NETWORK: 'E_NETWORK',
    PROVIDER: 'E_PROVIDER',
    RATE_LIMIT: 'E_429',
    OVERLOAD: 'E_OVERLOAD_THROTTLED'
};

const CONFIG = {
    LOCAL_URL: 'http://127.0.0.1:11434/api/generate',
    CLOUD_API_KEY: process.env.OPENCLAW_API_KEY,
    TIMEOUT_LOCAL: 60000,
    TIMEOUT_CLOUD: 30000,
    RETRIES: 2,
    SEMAPHORE_WAIT_TIMEOUT: 10000  // Max 10s wait for slot
};

// [M4-2.1 Gate 1] Role-based Semaphores
const SEMAPHORES = {
    PLANNER: new Semaphore(2, 'PLANNER'),
    EXECUTOR: new Semaphore(5, 'EXECUTOR'),
    HEAVY: new Semaphore(1, 'HEAVY'),
    GLOBAL: new Semaphore(6, 'GLOBAL')
};

/**
 * Universal LLM Client v2.2 (M4-2.1 Gate 2: Role-based Routing)
 * 
 * Enhancements:
 * - Policy-driven model selection per role
 * - Automatic fallback on timeout (4b → 8b)
 * - Detailed attempt and model tracking
 */
class LLMClient {

    constructor() {
        // Load model policy
        this.policy = require('../config/model-policy');

        // Legacy defaults (for backward compatibility)
        this.modelLocal = 'qwen3:4b';
        this.modelCloud = 'claude-3-opus-20240229';

        this.metrics = {
            totalCalls: 0,
            byContext: {},
            byModel: {},
            fallbackUsed: 0
        };
    }

    /**
     * Get model for a given role and attempt
     * @param {string} role - PLANNER|EXECUTOR|HEAVY|CHAT
     * @param {number} attempt - 0-indexed attempt number
     * @returns {Object} - { model, timeout, isLocal }
     */
    _getModelForRole(role, attempt = 0) {
        const roleConfig = this.policy.roles[role] || this.policy.roles.EXECUTOR;
        const models = roleConfig.models;

        if (attempt >= models.length) {
            // Exhausted all models for this role
            return null;
        }

        const modelConfig = models[attempt];
        return {
            model: modelConfig.name,
            timeout: modelConfig.timeout,
            isLocal: true  // All current models are local (Ollama)
        };
    }

    /**
     * [M4-2.1 Gate 2] Unified generate method with role-based routing
     * @param {string} prompt - The prompt text
     * @param {string} role - 'PLANNER'|'EXECUTOR'|'HEAVY'|'CHAT'
     * @param {number} attempt - Internal retry counter
     * @param {AbortSignal} signal - Optional signal for mid-command termination (M5.5)
     * @returns {Promise<string>} - Generated text
     */
    async generate(prompt, role = 'EXECUTOR', attempt = 0, signal = null) {
        if (signal && signal.aborted) throw new Error('E_ABORTED_BY_SIGNAL');
        const modelInfo = this._getModelForRole(role, attempt);

        if (!modelInfo) {
            const error = new Error(`No more models available for role: ${role}`);
            error.code = 'E_MODEL_EXHAUSTED';
            error.llm_context = role;
            throw error;
        }

        const startTime = Date.now();

        try {
            // [Step 1.6] Apply Markdown-Free Policy for Chat
            let finalPrompt = prompt;
            if (role === 'CHAT') {
                finalPrompt = `[DIRECTIVE: NO_MARKDOWN] 대답에 마크다운 기호(**, #, -, \` 등)를 절대 사용하지 마세요. 오직 순수 텍스트로만 대답하세요.\n\n질문: ${prompt}`;
            }

            // Execute request with role-specific model
            const payload = {
                model: modelInfo.model,
                prompt: finalPrompt,
                stream: false
            };

            const result = await this._executeRequest('LOCAL', payload, role, modelInfo.timeout, signal);
            const latency = Date.now() - startTime;

            this._recordMetrics(role, modelInfo.model, latency, 'SUCCESS', 0, attempt);

            return result;

        } catch (error) {
            console.error(`[LLM_GEN_ERR] role=${role} attempt=${attempt} error=${error.message}`);
            const latency = Date.now() - startTime;
            const queueWaitMs = 0;

            // Check if we should fallback to next model
            const shouldFallback = (
                error.code === ERRORS.TIMEOUT_LOCAL ||
                error.code === ERRORS.TIMEOUT
            ) && attempt < this.policy.global.maxRetries;

            if (shouldFallback) {
                console.warn(`[LLM] ${role} fallback: ${modelInfo.model} → trying next model (attempt ${attempt + 1})`);
                this.metrics.fallbackUsed++;

                // Recursive call with next attempt
                return this.generate(prompt, role, attempt + 1, signal);
            }

            // No fallback available or non-retriable error
            this._recordMetrics(role, modelInfo.model, latency, 'FAILURE', queueWaitMs, attempt);

            error.llm_context = role;
            error.llm_provider = 'LOCAL';
            error.llm_model = modelInfo.model;
            error.llm_latency_ms = latency;
            error.llm_queue_wait_ms = queueWaitMs;
            error.llm_attempt = attempt;
            error.fallback_used = attempt > 0;

            throw error;

        } finally {
            // Semaphores disabled
        }

    }

    /**
     * [Legacy] Generate text using Local LLM (backward compatibility)
     * @param {string} prompt - The prompt text
     * @param {string} context - 'PLANNER'|'EXECUTOR'|'CHAT' for observability
     */
    async generateLocal(prompt, context = 'UNKNOWN') {
        // Redirect to new generate() method
        return this.generate(prompt, context, 0);
    }

    async generateCloud(prompt, context = 'UNKNOWN') {
        if (!CONFIG.CLOUD_API_KEY) throw new Error('Missing OPENCLAW_API_KEY');

        const startTime = Date.now();
        const payload = {
            model: this.modelCloud,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        };

        try {
            const result = await this._requestWithRetry('CLOUD', payload, context);
            const latency = Date.now() - startTime;

            this._recordMetrics(context, this.modelCloud, latency, 'SUCCESS');

            return result;
        } catch (error) {
            const latency = Date.now() - startTime;
            this._recordMetrics(context, this.modelCloud, latency, 'FAILURE');

            error.llm_context = context;
            error.llm_provider = 'CLOUD';
            error.llm_model = this.modelCloud;
            error.llm_latency_ms = latency;

            throw error;
        }
    }

    async _requestWithRetry(type, payload, context, attempt = 1) {
        try {
            return await this._executeRequest(type, payload, context);
        } catch (error) {
            if (attempt <= CONFIG.RETRIES && this._isRetryable(error)) {
                const delay = 1000 * attempt;
                await new Promise(r => setTimeout(r, delay));

                // Enrich error with attempt info
                error.llm_attempt = attempt + 1;

                return this._requestWithRetry(type, payload, context, attempt + 1);
            }

            // Final attempt info
            error.llm_attempt = attempt;
            error.fallback_used = false;

            throw error;
        }
    }

    _isRetryable(error) {
        return [ERRORS.TIMEOUT, ERRORS.TIMEOUT_LOCAL, ERRORS.NETWORK, ERRORS.RATE_LIMIT].includes(error.code);
    }

    async _executeRequest(type, payload, context, timeoutOverride = null, signal = null) {
        const isLocal = type === 'LOCAL';
        const url = isLocal ? CONFIG.LOCAL_URL : 'https://api.anthropic.com/v1/messages';
        const timeoutMs = timeoutOverride || (isLocal ? CONFIG.TIMEOUT_LOCAL : CONFIG.TIMEOUT_CLOUD);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(isLocal ? {} : {
                        'x-api-key': CONFIG.CLOUD_API_KEY,
                        'anthropic-version': '2023-06-01'
                    })
                },
                body: JSON.stringify(payload),
                signal: signal || controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorBody = await response.text();
                const err = new Error(`Provider Error ${response.status}: ${errorBody.slice(0, 100)}`);
                err.code = response.status === 429 ? ERRORS.RATE_LIMIT : ERRORS.PROVIDER;
                throw err;
            }

            const json = await response.json();
            const result = isLocal ? json.response : json.content[0].text;
            return result;

        } catch (e) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError') {
                const err = new Error(`${type} Request Timeout`);
                err.code = isLocal ? ERRORS.TIMEOUT_LOCAL : ERRORS.TIMEOUT_CLOUD;
                throw err;
            }
            throw e;
        }
    }

    _recordMetrics(context, model, latency, status, queueWaitMs = 0) {
        this.metrics.totalCalls++;

        if (!this.metrics.byContext[context]) {
            this.metrics.byContext[context] = {
                count: 0,
                totalLatency: 0,
                totalQueueWait: 0,
                failures: 0
            };
        }
        this.metrics.byContext[context].count++;
        this.metrics.byContext[context].totalLatency += latency;
        this.metrics.byContext[context].totalQueueWait += queueWaitMs;
        if (status === 'FAILURE') this.metrics.byContext[context].failures++;

        if (!this.metrics.byModel[model]) {
            this.metrics.byModel[model] = { count: 0, totalLatency: 0 };
        }
        this.metrics.byModel[model].count++;
        this.metrics.byModel[model].totalLatency += latency;
    }

    getMetrics() {
        return this.metrics;
    }
}

module.exports = new LLMClient();


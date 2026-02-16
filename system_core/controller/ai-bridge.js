/**
 * UCONAI 2.0 Industrial Disaster-Resilient Gateway (v8)
 * 
 * Objective: Absolute Survival & Zero-Risk Control
 * Architecture: 7-Step Pipeline + 4-Guard Model
 * 
 * @module ai-bridge-v2
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

// --- [CONFIGURATION] ---
const CONFIG = {
    PORT: 18081,
    MAX_BODY_LENGTH: 512,
    RATE_LIMIT: {
        WINDOW_MS: 1000,
        MAX_REQUESTS: 3,
        BURST: 5,
        CLEANUP_INTERVAL_MS: 10000,
        TTL_MS: 60000
    },
    QUEUE: {
        MAX_SIZE: 1000,
        HIGH_KEY_TTL: 300000
    },
    CIRCUIT: {
        FAILURE_THRESHOLD: 3,
        RESET_TIMEOUT_MS: 30000,
        HALF_OPEN_RETRIES: 1
    },
    CORE_API_URL: 'http://localhost:3000',
    AUTH_CHAT_IDS: ['5870068428', '6992520626'] // Dr. Kang's IDs
};

// --- [UTILS: LOGGER] ---
const Logger = {
    _print(level, message, meta = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            ...meta
        };
        console.log(JSON.stringify(logEntry));
    },
    info: (msg, meta) => Logger._print('INFO', msg, meta),
    warn: (msg, meta) => Logger._print('WARN', msg, meta),
    error: (msg, meta) => Logger._print('ERROR', msg, meta),
    debug: (msg, meta) => Logger._print('DEBUG', msg, meta)
};

// --- [COMPONENT: RATE LIMITER] ---
class RateLimiter {
    constructor() {
        this.clients = new Map();
        setInterval(() => this.cleanup(), CONFIG.RATE_LIMIT.CLEANUP_INTERVAL_MS);
    }

    check(clientId) {
        const now = Date.now();
        let client = this.clients.get(clientId);

        if (!client) {
            client = { tokens: CONFIG.RATE_LIMIT.BURST, lastRefill: now };
            this.clients.set(clientId, client);
        }

        const timePassed = now - client.lastRefill;
        const tokensToAdd = Math.floor(timePassed / CONFIG.RATE_LIMIT.WINDOW_MS) * CONFIG.RATE_LIMIT.MAX_REQUESTS;

        if (tokensToAdd > 0) {
            client.tokens = Math.min(CONFIG.RATE_LIMIT.BURST, client.tokens + tokensToAdd);
            client.lastRefill = now;
        }

        if (client.tokens > 0) {
            client.tokens--;
            return true;
        }
        return false;
    }

    cleanup() {
        const now = Date.now();
        for (const [clientId, client] of this.clients.entries()) {
            if (now - client.lastRefill > CONFIG.RATE_LIMIT.TTL_MS) {
                this.clients.delete(clientId);
            }
        }
    }
}

// --- [COMPONENT: CIRCUIT BREAKER] ---
const CB_STATE = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker {
    constructor(name) {
        this.name = name;
        this.state = CB_STATE.CLOSED;
        this.failures = 0;
        this.nextRetryTime = 0;
    }

    recordFailure() {
        this.failures++;
        if (this.failures >= CONFIG.CIRCUIT.FAILURE_THRESHOLD) {
            this.trip();
        }
    }

    recordSuccess() {
        this.failures = 0;
        this.state = CB_STATE.CLOSED;
        // Logger.info(`[CB] ${this.name} Recovered`, { state: this.state });
    }

    trip() {
        this.state = CB_STATE.OPEN;
        this.nextRetryTime = Date.now() + CONFIG.CIRCUIT.RESET_TIMEOUT_MS;
        Logger.warn(`[CB] ${this.name} Tripped`, { state: this.state, nextRetry: new Date(this.nextRetryTime).toISOString() });
    }

    canAttempt() {
        if (this.state === CB_STATE.CLOSED) return true;

        const now = Date.now();
        if (this.state === CB_STATE.OPEN && now >= this.nextRetryTime) {
            this.state = CB_STATE.HALF_OPEN;
            Logger.info(`[CB] ${this.name} Entering HALF_OPEN`, { state: this.state });
            return true;
        }

        if (this.state === CB_STATE.HALF_OPEN) {
            return true;
        }

        return false;
    }

    isOpen() {
        if (this.state === CB_STATE.OPEN && Date.now() >= this.nextRetryTime) return false;
        return this.state === CB_STATE.OPEN;
    }
}

const breakers = {
    core: new CircuitBreaker('CoreAPI')
};

// --- [COMPONENT: COMMAND REGISTRY & PARSER] ---
const COMMAND_REGISTRY = {
    host: {
        actions: ['status', 'restart', 'logs'],
        priority: 'HIGH'
    },
    pipe: {
        actions: ['pause', 'resume', 'test'],
        priority: 'HIGH'
    },
    review: {
        actions: ['approve', 'reject', 'list'],
        priority: 'MED'
    },
    ops: {
        actions: ['retry', 'trace', 'metrics'],
        priority: (action) => action === 'trace' ? 'LOW' : 'MED'
    }
};

const Parser = {
    parse(text) {
        if (!text || !text.startsWith('/')) return null;

        const parts = text.trim().slice(1).split(/\s+/);
        if (parts.length === 0) return null;

        const module = parts[0].toLowerCase();
        const action = parts[1] ? parts[1].toLowerCase() : null;
        const args = parts.slice(2);

        const cmdDef = COMMAND_REGISTRY[module];
        if (!cmdDef) return { error: 'UNKNOWN_MODULE', module };

        if (!action) return { error: 'MISSING_ACTION', module, help: `Available: ${cmdDef.actions.join(', ')}` };

        if (!cmdDef.actions.includes(action)) return { error: 'INVALID_ACTION', module, action };

        let priority = 'LOW';
        if (typeof cmdDef.priority === 'function') {
            priority = cmdDef.priority(action);
        } else {
            priority = cmdDef.priority || 'LOW';
        }

        return { module, action, args, priority };
    }
};

// --- [COMPONENT: PRIORITY QUEUE] ---
class PriorityQueueManager {
    constructor() {
        this.queues = {
            HIGH: new Map(), // Coalescing
            MED: [],
            LOW: []
        };
        this.totalSize = 0;
    }

    push(job) {
        if (job.priority === 'HIGH') {
            const key = `${job.module}:${job.action}`;
            if (this.queues.HIGH.has(key)) {
                Logger.info(`[Queue] Coalesced HIGH job`, { key, reqId: job.reqId });
                return { status: 'coalesced', jobId: this.queues.HIGH.get(key).reqId };
            }
            this.queues.HIGH.set(key, job);
            this.totalSize++;
            return { status: 'accepted', jobId: job.reqId };
        }

        if (this.totalSize >= CONFIG.QUEUE.MAX_SIZE) {
            if (job.priority === 'LOW') {
                Logger.warn(`[Queue] Dropped LOW job (Full)`, { reqId: job.reqId });
                return { status: 'dropped', error: 'QUEUE_FULL' };
            }

            if (this.queues.LOW.length > 0) {
                const evicted = this.queues.LOW.shift();
                this.totalSize--;
                Logger.warn(`[Queue] Evicted LOW job for MED`, { evictedId: evicted.reqId, newId: job.reqId });
            } else if (this.queues.MED.length > 0 && job.priority === 'MED') {
                Logger.warn(`[Queue] Dropped MED job (Full, No LOW to evict)`, { reqId: job.reqId });
                return { status: 'dropped', error: 'QUEUE_FULL' };
            }
        }

        if (job.priority === 'MED') this.queues.MED.push(job);
        else this.queues.LOW.push(job);

        this.totalSize++;
        return { status: 'accepted', jobId: job.reqId };
    }

    pop() {
        if (this.queues.HIGH.size > 0) {
            const [key, job] = this.queues.HIGH.entries().next().value;
            this.queues.HIGH.delete(key);
            this.totalSize--;
            return job;
        }
        if (this.queues.MED.length > 0) {
            this.totalSize--;
            return this.queues.MED.shift();
        }
        if (this.queues.LOW.length > 0) {
            this.totalSize--;
            return this.queues.LOW.shift();
        }
        return null;
    }
}

const queueManager = new PriorityQueueManager();
const rateLimiter = new RateLimiter();

// --- [SERVER INGRESS] ---
const server = http.createServer((req, res) => {
    const reqId = crypto.randomUUID();
    const meta = { reqId };

    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end();
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk;
        if (body.length > CONFIG.MAX_BODY_LENGTH) {
            Logger.warn('Ingress Block', { ...meta, reason: 'INPUT_TOO_LONG' });
            res.writeHead(413, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'INPUT_TOO_LONG' }));
            req.destroy();
        }
    });

    req.on('end', () => {
        if (!body) return;

        try {
            let payload;
            try {
                payload = JSON.parse(body);
            } catch (e) {
                res.writeHead(400); res.end(); return;
            }

            const message = payload.message || {};
            const text = message.text || '';
            const chatId = message.chat?.id ? String(message.chat.id) : null;
            meta.chatId = chatId;

            // 1. Auth Guard
            if (!CONFIG.AUTH_CHAT_IDS.includes(chatId)) {
                Logger.warn('Auth Block', meta);
                // Don't respond to unauthorized to avoid probing? Or 403.
                // Telegram might retry on 403/500, but 200 OK prevents retry.
                res.writeHead(200);
                res.end();
                return;
            }

            // 2. Rate Limit Guard
            if (chatId && !rateLimiter.check(chatId)) {
                Logger.warn('Rate Limit Block', meta);
                res.writeHead(429, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'RATE_LIMIT', message: 'Too many requests' }));
                return;
            }

            // 3. Parser & Validator
            const cmd = Parser.parse(text);
            if (!cmd) {
                Logger.info('Block Non-Command', { ...meta, text: text.slice(0, 20) });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    method: 'sendMessage',
                    chat_id: chatId,
                    text: '⛔ 일반 대화는 지원하지 않습니다. /help 를 입력하세요.'
                }));
                return;
            }

            if (cmd.error) {
                Logger.warn('Invalid Command', { ...meta, error: cmd.error, module: cmd.module });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    method: 'sendMessage',
                    chat_id: chatId,
                    text: `⚠️ 명령 오류: ${cmd.error}`
                }));
                return;
            }

            // 4. Circuit Breaker Pre-Check
            if (breakers.core.isOpen() && cmd.priority !== 'HIGH') {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'SERVICE_UNAVAILABLE', message: 'System maintenance mode.' }));
                return;
            }

            // 5. Queue Push
            const job = {
                reqId,
                chatId,
                module: cmd.module,
                action: cmd.action,
                args: cmd.args,
                priority: cmd.priority,
                receivedAt: Date.now(),
                retryCount: 0
            };

            const result = queueManager.push(job);

            if (result.status === 'dropped') {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'QUEUE_FULL_OR_DROPPED' }));
                return;
            }

            // 6. Async ACK
            Logger.info('Job Accepted', { ...meta, ...cmd, jobId: result.jobId });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'captured',
                jobId: result.jobId,
                reqId,
                acceptedAt: new Date().toISOString()
            }));

        } catch (e) {
            Logger.error('Handler Error', { ...meta, error: e.message });
            res.writeHead(500);
            res.end();
        }
    });
});

// --- [CONSUMER LOOP] ---
let isConsumerRunning = true;
const CONSUMER_OPTS = {
    BURST_LIMIT: 50,
    BURST_COOLDOWN_MS: 10,
    IDLE_DELAY_MS: 200,
    ERROR_DELAY_MS: 5000
};

function processJobCoreProxy(job) {
    return new Promise((resolve, reject) => {
        try {
            const url = new URL(CONFIG.CORE_API_URL);
            const options = {
                hostname: url.hostname,
                port: url.port || 80,
                path: '/job',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': job.reqId,
                    'X-Job-Priority': job.priority
                },
                timeout: 2000 // 2s timeout
            };

            const req = http.request(options, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                } else {
                    reject(new Error(`Core responded with ${res.statusCode}`));
                }
            });

            req.on('error', (e) => reject(e));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('E_TIMEOUT_CONNECT'));
            });

            req.write(JSON.stringify(job));
            req.end();
        } catch (e) {
            reject(e);
        }
    });
}

async function consumerLoop() {
    let processedInBurst = 0;

    const pump = async () => {
        if (!isConsumerRunning) return;

        // 1. Circuit Check
        if (breakers.core.isOpen()) {
            if (breakers.core.canAttempt()) {
                // HALF_OPEN: Proceed
            } else {
                setTimeout(pump, CONSUMER_OPTS.ERROR_DELAY_MS);
                return;
            }
        }

        // 2. Pop Job
        const job = queueManager.pop();
        if (!job) {
            setTimeout(pump, CONSUMER_OPTS.IDLE_DELAY_MS);
            return;
        }

        // 3. Process Job
        try {
            await processJobCoreProxy(job);
            breakers.core.recordSuccess();

            processedInBurst++;
            if (processedInBurst >= CONSUMER_OPTS.BURST_LIMIT) {
                processedInBurst = 0;
                setTimeout(pump, CONSUMER_OPTS.BURST_COOLDOWN_MS);
            } else {
                setImmediate(pump);
            }

        } catch (e) {
            breakers.core.recordFailure();
            Logger.error('[Consumer] Job Failed', { jobId: job.reqId, error: e.message });

            if (job.retryCount < 3) {
                job.retryCount++;
                job.priority = 'LOW';
                queueManager.push(job);
            } else {
                Logger.error('[Consumer] Job Dropped (Max Retry)', { jobId: job.reqId });
            }

            setTimeout(pump, 1000);
        }
    };

    pump();
}

// Start Consumer
consumerLoop();

// Start Server
if (require.main === module) {
    server.listen(CONFIG.PORT, () => {
        Logger.info(`UCONAI Gateway v2 (Industrial) started on port ${CONFIG.PORT}`, { mode: 'DISASTER_RESILIENT' });
    });
}

// Graceful Shutdown Hook
process.on('SIGTERM', () => {
    Logger.info('SIGTERM Received. Shutting down...');
    isConsumerRunning = false;

    server.close(() => {
        Logger.info(`Dumping remaining jobs: ${queueManager.totalSize}`);
        const dump = {
            MED: queueManager.queues.MED,
            LOW: queueManager.queues.LOW,
            HIGH: Array.from(queueManager.queues.HIGH.values())
        };
        fs.writeFileSync('emergency-dump.json', JSON.stringify(dump));
        process.exit(0);
    });
});

module.exports = server;

/**
 * UCONAI Telemetry Monitor v1.3 (Phase 4.1.2)
 * 
 * Enhancements:
 * - Event Loop Lag P99 (Critical for spike detection)
 * - DB Queue Depth & Oldest Job Age
 * - GC Baseline Tracking (HeapUsed_postGC drift focus)
 */
const { monitorEventLoopDelay } = require('perf_hooks');

class Telemetry {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.hmd = monitorEventLoopDelay({ resolution: 10 });
        this.hmd.enable();
        this.baseline = null;
    }

    start(intervalMs = 60000) {
        this.logger.info(`Telemetry V1.3 started [Interval: ${intervalMs}ms]`);
        this.timer = setInterval(() => this.collect(), intervalMs);
    }

    async collect() {
        const memory = process.memoryUsage();
        const cpu = process.cpuUsage();

        // [1] Lag Metrics (P99 is key)
        const p99Lag = this.hmd.percentile(99) / 1e6;
        const maxLag = this.hmd.max / 1e6;
        const meanLag = this.hmd.mean / 1e6;

        // [2] DB Queue Metrics
        const queueMetrics = await this._getQueueMetrics();

        if (!this.baseline) {
            this.baseline = {
                rss: memory.rss,
                heap: memory.heapUsed,
                timestamp: Date.now()
            };
        }

        const metrics = {
            rss: memory.rss,
            heapUsed: memory.heapUsed,
            heapTotal: memory.heapTotal,
            p99Lag: p99Lag.toFixed(2),
            maxLag: maxLag.toFixed(2),
            meanLag: meanLag.toFixed(2),
            queueDepth: queueMetrics.depth,
            oldestAge: queueMetrics.oldestAge,
            cpuUser: cpu.user,
            cpuSystem: cpu.system,
            timestamp: new Date().toISOString(),
            heapDrift: (memory.heapUsed - this.baseline.heap) / 1024 / 1024 // MB
        };

        this.hmd.reset();

        // Log to DB via trace
        this.logger.trace('SYSTEM', 'TELEMETRY', 'V1.3 Health Metrics', metrics);

        return metrics;
    }

    _getQueueMetrics() {
        return new Promise((resolve) => {
            this.db.get(`
                SELECT 
                    COUNT(*) as depth, 
                    COALESCE(CAST((julianday('now') - julianday(MIN(created_at))) * 86400 AS INTEGER), 0) as oldestAge
                FROM jobs 
                WHERE status = 'RECEIVED' OR status = 'EXECUTING'`, (err, row) => {
                if (err) resolve({ depth: 0, oldestAge: 0 });
                else resolve(row || { depth: 0, oldestAge: 0 });
            });
        });
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
        this.hmd.disable();
    }
}

module.exports = Telemetry;

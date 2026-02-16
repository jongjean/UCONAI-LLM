/**
 * UCONAI Health Guard v1.2 (Phase 4.1.3)
 * 
 * Enhancements:
 * - Percentage-based thresholds against baseline
 * - High-priority Concurrency Cap (M4-1.3)
 * - Starvation-proof Aging Logic
 */
class HealthGuard {
    constructor(monitor, logger) {
        this.monitor = monitor;
        this.logger = logger;
        this.status = 'HEALTHY';
        this.activeHighJobs = 0;
    }

    async assess(jobPriority = 'MEDIUM', created_at) {
        const metrics = await this.monitor.collect();
        if (!metrics || !this.monitor.baseline) return { action: 'PROCEED' };

        // [1] Aging Logic (Avoid Starvation)
        const jobAge = created_at ? Math.round((Date.now() - new Date(created_at).getTime()) / 1000) : 0;
        let effectivePriority = jobPriority;
        if (jobAge > 60 && jobPriority === 'LOW') effectivePriority = 'MEDIUM';
        if (jobAge > 120 && jobPriority === 'MEDIUM') effectivePriority = 'HIGH';

        // [2] Resource Thresholds (% against baseline)
        const heapDriftRatio = (metrics.heapUsed / this.monitor.baseline.heap) - 1;
        const lagP99 = parseFloat(metrics.p99Lag);

        // -- LEVEL 3: REFUSE (Critical: +30% Drift or P99 > 1000ms) --
        if (heapDriftRatio > 0.3 || lagP99 > 1000) {
            this.status = 'CRITICAL';
            if (effectivePriority !== 'HIGH') {
                return { action: 'REFUSE', code: 'E_OVERLOAD_REFUSED', reason: `Resource drift: ${Math.round(heapDriftRatio * 100)}%` };
            }
            return { action: 'DELAY', delayMs: 5000, reason: 'High-prio survival wait' };
        }

        // -- [3] High-Priority Concurrency Cap (Safety) --
        if (effectivePriority === 'HIGH' && this.activeHighJobs >= 3) {
            return { action: 'DELAY', delayMs: 2000, reason: 'High-priority concurrency cap' };
        }

        // -- LEVEL 2: THROTTLE (+15% Drift or P99 > 300ms) --
        if (heapDriftRatio > 0.15 || lagP99 > 300) {
            this.status = 'STRESSED';
            const delay = effectivePriority === 'LOW' ? 10000 : 3000;
            return { action: 'DELAY', delayMs: delay, reason: 'Backpressure active' };
        }

        this.status = 'HEALTHY';
        return { action: 'PROCEED' };
    }

    // Reference counters for concurrency cap
    onJobStart(priority) { if (priority === 'HIGH') this.activeHighJobs++; }
    onJobEnd(priority) { if (priority === 'HIGH') this.activeHighJobs--; }
}

module.exports = HealthGuard;

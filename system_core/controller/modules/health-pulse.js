/**
 * 💓 Governance Health Heartbeat (M7.3.2)
 * Detects if the governance layer is stalled or dead.
 */
class HealthHeartbeat {
    constructor() {
        this.CRITICAL_LATENCY_MS = 200; // P95 Threshold
        this.MAX_DB_FAILURES = 3;
        this.dbFailCount = 0;
        this.status = 'HEALTHY';
    }

    /**
     * Report a DB access result to track health
     */
    reportDB(success) {
        if (success) {
            this.dbFailCount = 0;
        } else {
            this.dbFailCount++;
        }
    }

    /**
     * Judge system health based on latency and DB failures
     */
    judge(lastLatencyMs) {
        if (this.dbFailCount >= this.MAX_DB_FAILURES) {
            this.status = 'DEAD_DB';
            return false;
        }
        if (lastLatencyMs > this.CRITICAL_LATENCY_MS) {
            this.status = 'DEAD_STALL';
            return false;
        }

        this.status = 'HEALTHY';
        return true;
    }

    getStatus() {
        return this.status;
    }
}

module.exports = new HealthHeartbeat();

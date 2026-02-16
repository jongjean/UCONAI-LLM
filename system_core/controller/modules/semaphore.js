/**
 * Semaphore: Concurrency Control Primitive
 * 
 * Used by LLM Client to limit concurrent requests per role.
 */
class Semaphore {
    constructor(max, name = 'unnamed') {
        this.max = max;
        this.current = 0;
        this.queue = [];
        this.name = name;
    }

    /**
     * Acquire a slot (with timeout)
     * @param {number} timeoutMs - Max wait time
     * @returns {Promise<Object>} - { acquired: boolean, waitMs: number }
     */
    async acquire(timeoutMs = 10000) {
        const startTime = Date.now();

        if (this.current < this.max) {
            this.current++;
            return { acquired: true, waitMs: 0 };
        }

        return new Promise((resolve) => {
            const timeoutHandle = setTimeout(() => {
                // Remove from queue if still waiting
                const index = this.queue.findIndex(item => item.resolve === resolve);
                if (index !== -1) {
                    this.queue.splice(index, 1);
                }
                resolve({ acquired: false, waitMs: Date.now() - startTime });
            }, timeoutMs);

            this.queue.push({
                resolve: (result) => {
                    clearTimeout(timeoutHandle);
                    resolve(result);
                },
                enqueuedAt: startTime
            });
        });
    }

    /**
     * Release a slot
     */
    release() {
        this.current--;

        if (this.queue.length > 0) {
            this.current++;
            const waiter = this.queue.shift();
            const waitMs = Date.now() - waiter.enqueuedAt;
            waiter.resolve({ acquired: true, waitMs });
        }
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            name: this.name,
            max: this.max,
            current: this.current,
            queued: this.queue.length
        };
    }
}

module.exports = Semaphore;

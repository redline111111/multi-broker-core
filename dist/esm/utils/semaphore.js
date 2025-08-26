export class Semaphore {
    max;
    queue = [];
    inUse = 0;
    constructor(max) {
        this.max = max;
        if (!Number.isFinite(max) || max <= 0) {
            throw new Error(`Semaphore max must be positive, got ${max}`);
        }
    }
    acquire() {
        if (this.inUse < this.max) {
            this.inUse++;
            return Promise.resolve();
        }
        return new Promise((resolve) => this.queue.push(() => {
            this.inUse++;
            resolve();
        }));
    }
    release() {
        if (this.inUse === 0)
            return;
        this.inUse--;
        const next = this.queue.shift();
        if (next)
            next();
    }
}
export class NoopSemaphore {
    acquire() { return Promise.resolve(); }
    release() { }
}

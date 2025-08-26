export class Semaphore {
  private queue: Array<() => void> = [];
  private inUse = 0;

  constructor(private readonly max: number) {
    if (!Number.isFinite(max) || max <= 0) {
      throw new Error(`Semaphore max must be positive, got ${max}`);
    }
  }

  acquire(): Promise<void> {
    if (this.inUse < this.max) {
      this.inUse++;
      return Promise.resolve();
    }
    return new Promise((resolve) => this.queue.push(() => {
      this.inUse++;
      resolve();
    }));
    }

  release(): void {
    if (this.inUse === 0) return;
    this.inUse--;
    const next = this.queue.shift();
    if (next) next();
  }
}

export class NoopSemaphore {
  acquire(): Promise<void> { return Promise.resolve(); }
  release(): void {}
}

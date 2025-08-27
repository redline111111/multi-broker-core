export type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  halfOpenMaxCalls?: number;
  openTimeoutMs?: number;
  onStateChange?: (prev: BreakerState, next: BreakerState) => void;
}

export class CircuitBreaker {
  private state: BreakerState = 'CLOSED';
  private failures = 0;
  private readonly opts: Required<CircuitBreakerOptions>;
  private halfOpenCalls = 0;
  private openSince = 0;

  constructor(opts?: CircuitBreakerOptions) {
    this.opts = {
      failureThreshold: opts?.failureThreshold ?? 5,
      halfOpenMaxCalls: opts?.halfOpenMaxCalls ?? 1,
      openTimeoutMs: opts?.openTimeoutMs ?? 10_000,
      onStateChange: opts?.onStateChange ?? (() => {}),
    };
  }

  public getState(): BreakerState {
    if (this.state === 'OPEN' && Date.now() - this.openSince >= this.opts.openTimeoutMs) {
      this.transition('HALF_OPEN');
    }
    return this.state;
  }

  public allow(): boolean {
    const s = this.getState();
    if (s === 'OPEN') return false;
    if (s === 'HALF_OPEN') {
      if (this.halfOpenCalls >= this.opts.halfOpenMaxCalls) return false;
      this.halfOpenCalls++;
      return true;
    }
    return true; // CLOSED
  }

  public recordSuccess(): void {
    const prev = this.getState();
    this.failures = 0;
    if (prev !== 'CLOSED') {
      this.transition('CLOSED');
    }
    if (prev === 'HALF_OPEN') {
      this.halfOpenCalls = 0;
    }
  }

  public recordFailure(): void {
    const s = this.getState();
    if (s === 'HALF_OPEN') {
      this.openNow();
      return;
    }
    this.failures++;
    if (this.failures >= this.opts.failureThreshold) {
      this.openNow();
    }
  }

  private openNow() {
    this.failures = 0;
    this.halfOpenCalls = 0;
    this.openSince = Date.now();
    this.transition('OPEN');
  }

  private transition(next: BreakerState) {
    const prev = this.state;
    if (prev !== next) {
      this.state = next;
      this.opts.onStateChange(prev, next);
    }
  }
}

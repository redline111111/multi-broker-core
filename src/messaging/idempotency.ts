import { createHash, randomUUID } from 'node:crypto';
import { IdempotencyOptions, IdempotencyStore, IdemRecord } from '../interfaces/idempotency-store';

export const IDEMPOTENCY_DEFAULTS: Required<Omit<IdempotencyOptions, 'keyExtractor'>> = {
  inProgressTtlMs: 60_000,
  succeededTtlMs: 24 * 60 * 60 * 1000,
  failedTtlMs: 60 * 60 * 1000,
  headerKey: 'x-idempotency-key',
  fallbackToBodyHash: true,
};

export class InMemoryIdempotencyStore implements IdempotencyStore {
 private map = new Map<string, { rec: IdemRecord; exp: number }>();

  private purgeIfExpired(key: string) {
    const e = this.map.get(key);
    if (!e) return;
    if (Date.now() > e.exp) this.map.delete(key);
  }

  async setInProgress(key: string, ttlMs: number): Promise<boolean> {
    this.purgeIfExpired(key);
    if (this.map.has(key)) return false;
    this.map.set(key, { rec: { state: 'in_progress', updatedAt: Date.now() }, exp: Date.now() + ttlMs });
    return true;
  }

  async setSucceeded(key: string, ttlMs: number, meta?: Record<string, unknown>): Promise<void> {
    this.map.set(key, { rec: { state: 'succeeded', updatedAt: Date.now(), meta }, exp: Date.now() + ttlMs });
  }

  async setFailed(key: string, ttlMs: number, meta?: Record<string, unknown>): Promise<void> {
    this.map.set(key, { rec: { state: 'failed', updatedAt: Date.now(), meta }, exp: Date.now() + ttlMs });
  }

  async get(key: string): Promise<IdemRecord | undefined> {
    this.purgeIfExpired(key);
    return this.map.get(key)?.rec;
  }

  async del(key: string): Promise<void> {
    this.map.delete(key);
  }
}

export function computeIdemKey(headers?: Record<string, unknown>, payload?: Buffer, opts?: IdempotencyOptions): string {
  const cfg = { ...IDEMPOTENCY_DEFAULTS, ...opts };
  const fromCustom = opts?.keyExtractor?.({ headers, payload });
  if (fromCustom) return String(fromCustom);
  const hv = headers?.[cfg.headerKey];
  if (hv != null) return String(hv);
  if (cfg.fallbackToBodyHash && payload) {
    const h = createHash('sha256').update(payload).digest('hex');
    return `body:${h}`;
  }
  return `uuid:${randomUUID()}`;
}

export class IdempotencyCoordinator {
    constructor(private readonly store: IdempotencyStore, private readonly options?: IdempotencyOptions) {}

    async begin(key: string): Promise<'new' | 'duplicate' | 'in_progress'> {
        const cfg = { ...IDEMPOTENCY_DEFAULTS, ...this.options };
        const existing = await this.store.get(key);
        if (existing?.state === 'succeeded') return 'duplicate';
        if (existing?.state === 'in_progress') return 'in_progress';
        const ok = await this.store.setInProgress(key, cfg.inProgressTtlMs);
        return ok ? 'new' : 'in_progress';
    }

    async complete(key: string, meta?: Record<string, unknown>) {
        const cfg = { ...IDEMPOTENCY_DEFAULTS, ...this.options };
        await this.store.setSucceeded(key, cfg.succeededTtlMs, meta);
    }

    async fail(key: string, meta?: Record<string, unknown>) {
        const cfg = { ...IDEMPOTENCY_DEFAULTS, ...this.options };
        await this.store.setFailed(key, cfg.failedTtlMs, meta);
    }
}

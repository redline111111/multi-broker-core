import type { IdempotencyStore } from '../interfaces/idempotency-store';

export class Inbox {
  constructor(private readonly store: IdempotencyStore, private readonly ttlMs = 24 * 60 * 60 * 1000) {}

  async isDuplicate(id: string): Promise<boolean> {
    const rec = await this.store.get(id);
    return rec?.state === 'succeeded';
  }

  async markProcessed(id: string, meta?: Record<string, unknown>) {
    await this.store.setSucceeded(id, this.ttlMs, meta);
  }
}

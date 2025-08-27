import { Metrics, NoopMetrics } from '../interfaces/metrics';
import type { OutboxRecord, OutboxStore } from './types';

export interface OutboxDispatcherOptions {
  batchSize?: number;        // default 100
  backoffBaseMs?: number;    // default 1000
  backoffFactor?: number;    // default 2
  backoffMaxMs?: number;     // default 60_000
  metrics?: Metrics;
}

/** Мини-оркестратор Outbox: один "тик" обработки партии. Вызывай из своего воркера/cron. */
export class OutboxDispatcher {
  constructor(
    private readonly store: OutboxStore,
    private readonly publish: (p: { exchange: string; routingKey: string; payload: Buffer; headers?: Record<string, unknown> }) => Promise<void>,
    private readonly opts?: OutboxDispatcherOptions
  ) {}

  async tick(): Promise<{ processed: number; sent: number; retried: number; failed: number }> {
    const batchSize = this.opts?.batchSize ?? 100;
    const metrics = this.opts?.metrics ?? new NoopMetrics();
    const now = Date.now();

    const batch = await this.store.fetchReadyBatch(batchSize);
    let sent = 0, retried = 0, failed = 0;

    for (const r of batch) {
      const labels = { exchange: r.exchange, routingKey: r.routingKey };
      try {
        metrics.inc('outbox_publish_attempt_total', labels);
        const t0 = Date.now();
        await this.publish({ exchange: r.exchange, routingKey: r.routingKey, payload: r.payload, headers: r.headers });
        metrics.observe('outbox_publish_duration_ms', Date.now() - t0, labels);

        await this.store.markSent(r.id);
        metrics.inc('outbox_publish_sent_total', labels);
        sent++;
      } catch (e) {
        const next = this.computeNext(now, r.attempts + 1);
        try {
          await this.store.reschedule(r.id, next, r.attempts + 1);
          metrics.inc('outbox_publish_retry_total', labels);
          retried++;
        } catch {
          await this.store.markFailed(r.id, (e as any)?.message);
          metrics.inc('outbox_publish_failed_total', labels);
          failed++;
        }
      }
    }

    return { processed: batch.length, sent, retried, failed };
  }

  private computeNext(now: number, attempt: number): number {
    const base = this.opts?.backoffBaseMs ?? 1000;
    const factor = this.opts?.backoffFactor ?? 2;
    const max = this.opts?.backoffMaxMs ?? 60_000;
    const raw = Math.min(max, Math.round(base * Math.pow(factor, attempt - 1)));
    const jitter = Math.floor(Math.random() * Math.min(500, raw * 0.1));
    return now + raw + jitter;
  }
}

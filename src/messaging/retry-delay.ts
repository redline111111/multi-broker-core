import { RETRY_DEFAULTS } from '../constants/retry';

export type BackoffKind = 'fixed' | 'exponential' | 'exponential-jitter';

export interface RetryDelayPolicy {
  /**
   * Повторная публикация в специальный delay-exchange/queue.
   * Ожидается, что delay-очередь настроена с DLX обратно в «боевой» exchange/route.
   * Мы ставим per-message TTL через `expiration` и апп-хедеры, после чего ack'аем оригинал.
   */
  strategy: 'republish-delay';

  /** Куда репаблишим «на подождать» */
  target: {
    exchange: string;
    routingKey: string;     // обычно что-то вроде 'events.retry'
    persistent?: boolean;   // default: true
  };

  /** Параметры бэкоффа */
  backoff?: {
    baseDelayMs?: number;   // default: 500
    factor?: number;        // default: 2
    maxDelayMs?: number;    // default: 60_000
    jitterMs?: number;      // default: 100
    kind?: BackoffKind;     // default: 'exponential-jitter'
    maxAttempts?: number;   // default: 5 (после — уходит в DLQ)
  };

  /** Настройка имён заголовков */
  headerKeys?: Partial<RetryHeaderKeys>;
}

export interface RetryHeaderKeys {
  attempt: string;          // номер попытки (с 1)
  nextAt: string;           // планируемое unix ms, когда сообщение снова попадёт в рабочую очередь
  originExchange: string;   // куда возвращать (информационно)
  originRoutingKey: string; // куда возвращать (информационно)
}

export const DEFAULT_RETRY_HEADER_KEYS: RetryHeaderKeys = {
  attempt: 'x-app-retry-attempt',
  nextAt: 'x-app-retry-next-at',
  originExchange: 'x-app-origin-exchange',
  originRoutingKey: 'x-app-origin-routing-key',
};

export interface RetryContext {
  attempt: number;
  origin: { exchange?: string; routingKey?: string };
}

/** Считать attempt из заголовков (если нет — 0) */
export function getRetryAttempt(
  headers: Record<string, unknown> | undefined,
  keys?: Partial<RetryHeaderKeys>
): number {
  const k = { ...DEFAULT_RETRY_HEADER_KEYS, ...(keys ?? {}) };
  const v = headers?.[k.attempt];
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function computeNextDelayMs(
  attemptNext: number,
  cfg?: RetryDelayPolicy['backoff']
): number {
  const base = cfg?.baseDelayMs ?? 500;
  const factor = cfg?.factor ?? 2;
  const max = cfg?.maxDelayMs ?? 60_000;
  const jitter = cfg?.jitterMs ?? 100;
  const kind = cfg?.kind ?? 'exponential-jitter';

  let raw =
    kind === 'fixed'
      ? base
      : base * Math.pow(factor, attemptNext - 1);

  if (kind === 'exponential-jitter') {
    raw = Math.round(raw * (0.5 + Math.random())); // 50–150%
  }
  raw += Math.random() * jitter;

  return Math.min(max, Math.max(0, Math.floor(raw)));
}

/** Максимум попыток? */
export function isAttemptsExhausted(
  attemptCurrent: number,
  cfg?: RetryDelayPolicy['backoff']
): boolean {
  const maxAtt = cfg?.maxAttempts ?? 5;
  return attemptCurrent >= maxAtt;
}

/** Построить заголовки для ретрая */
export function buildRetryHeaders(
  ctx: RetryContext,
  delayMs: number,
  keys?: Partial<RetryHeaderKeys>
): Record<string, unknown> {
  const k = { ...DEFAULT_RETRY_HEADER_KEYS, ...(keys ?? {}) };
  const nextAt = Date.now() + delayMs;
  return {
    [k.attempt]: ctx.attempt + 1,
    [k.nextAt]: nextAt,
    ...(ctx.origin.exchange ? { [k.originExchange]: ctx.origin.exchange } : {}),
    ...(ctx.origin.routingKey ? { [k.originRoutingKey]: ctx.origin.routingKey } : {}),
  };
}

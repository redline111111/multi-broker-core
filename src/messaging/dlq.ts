import type { ErrorContext } from '../errors';

export type DeadLetterStrategy = 'broker' | 'republish';

export interface DLQPolicy {
  /**
   * 'broker'  — обычный nack(requeue=false); сообщение уйдёт в DLX, если очередь сконфигурирована.
   * 'republish' — мы сами публикуем копию сообщения в заданный exchange/routingKey с нашими хедерами и ack'аем оригинал.
   */
  strategy: DeadLetterStrategy;
  target?: {
    exchange: string;
    routingKey: string;
    persistent?: boolean; // default: true
  };

  headerKeys?: Partial<DLQHeaderKeys>;
  headerBuilder?: (input: DLQHeaderInput) => Record<string, unknown>;
}

export interface DLQHeaderKeys {
  reason: string;   // человекочитаемая причина (коротко)
  code: string;     // машинный код
  type: string;     // имя класса ошибки
  message: string;  // текст ошибки
  ts: string;       // unix ms timestamp
  op?: string;      // операция (publish/consume/...)
  resource?: string;// очередь/обменник
}

export const DEFAULT_DLQ_HEADER_KEYS: DLQHeaderKeys = {
  reason: 'x-app-dlq-reason',
  code: 'x-app-error-code',
  type: 'x-app-error-type',
  message: 'x-app-error-message',
  ts: 'x-app-dlq-ts',
  op: 'x-app-error-op',
  resource: 'x-app-error-resource',
};

export interface DLQHeaderInput {
  error: unknown;
  ctx?: ErrorContext;
  attempt?: number;
  timestamp?: number;
}

export function buildDlqHeaders(
  input: DLQHeaderInput,
  policy?: DLQPolicy
): Record<string, unknown> {
  const keys = { ...DEFAULT_DLQ_HEADER_KEYS, ...(policy?.headerKeys ?? {}) };
  const err = input.error as any;
  const reason =
    err?.reason ??
    err?.code ??
    err?.message ??
    (typeof err === 'string' ? err : 'handler_failure');

  const base: Record<string, unknown> = {
    [keys.reason]: reason,
    [keys.code]: err?.code ?? 'UNHANDLED_EXCEPTION',
    [keys.type]: err?.name ?? (err?.constructor?.name ?? 'Error'),
    [keys.message]: String(err?.message ?? err),
    [keys.ts]: input.timestamp ?? Date.now(),
  };

  if (keys.op && input.ctx?.operation) base[keys.op] = input.ctx.operation;
  if (keys.resource && input.ctx?.resource) base[keys.resource] = input.ctx.resource;

  const extra = policy?.headerBuilder?.(input) ?? {};
  return { ...base, ...extra };
}

export function inspectDlqHeaders(headers: Record<string, unknown> | undefined) {
  const h = headers ?? {};
  const broker = {
    xDeath: h['x-death'] as unknown,
    xFirstDeathExchange: h['x-first-death-exchange'] as unknown,
    xFirstDeathQueue: h['x-first-death-queue'] as unknown,
    xFirstDeathReason: h['x-first-death-reason'] as unknown,
  };

  const app = {
    reason: h[DEFAULT_DLQ_HEADER_KEYS.reason],
    code: h[DEFAULT_DLQ_HEADER_KEYS.code],
    type: h[DEFAULT_DLQ_HEADER_KEYS.type],
    message: h[DEFAULT_DLQ_HEADER_KEYS.message],
    ts: h[DEFAULT_DLQ_HEADER_KEYS.ts],
    op: h[DEFAULT_DLQ_HEADER_KEYS.op!],
    resource: h[DEFAULT_DLQ_HEADER_KEYS.resource!],
  };

  return { app, broker, raw: h };
}

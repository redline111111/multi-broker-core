import { RetryPolicy } from "./retry-policy";
import { PerformanceOptions } from "./performance-options";
import { IdempotencyOptions, IdempotencyStore } from "../interfaces/idempotency-store";
import { IdemKeyInput } from "../messaging/payload-adapter";
import { HandlerResult } from "./handler-result";
import { MessageEnvelope } from "./message-envelope";

export type KeySelector = (input: IdemKeyInput | MessageEnvelope<any>) => string | undefined;

export enum IDEMPOTENCY_DUPLICATE_BEHAVIOR {
  ACK = 'ack',
  NACK_REQUEUE = 'nack_requeue',
  NACK_DLQ = 'nack_dlq',
  IGNORE = 'ignore',
}

export interface SubscribeIdempotencyConfig {
  store: IdempotencyStore;
  keySelector?: KeySelector;
  ttlMs?: number;                    // alias к succeededTtlMs
  onDuplicate?: IDEMPOTENCY_DUPLICATE_BEHAVIOR;
  options?: IdempotencyOptions;      // низкоуровневые опции ядра
}
export interface SubscribeOptions<T = unknown> {
  retryPolicy?: RetryPolicy;
  idempotency?: SubscribeIdempotencyConfig;
  performance?: PerformanceOptions;
classifyError?: (
    err: unknown,
    input: IdemKeyInput | MessageEnvelope<any>
  ) => HandlerResult | undefined;
}
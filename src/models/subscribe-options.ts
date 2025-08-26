import { RetryPolicy } from "./retry-policy";
import { MessageEnvelope } from "./message-envelope";
import { IdempotencyStore } from "../interfaces/idempotency-store";
import { IdempotencyDuplicateBehavior } from "../constants/idempotency";
import { PerformanceOptions } from "./performance-options";
import { ErrorClassifier } from "./error-classifier";

export interface IdempotencyOptions<T = unknown> {
  store: IdempotencyStore;
  keySelector?: (envelope: MessageEnvelope<T>) => string | undefined;
  ttlMs?: number;
  onDuplicate?: IdempotencyDuplicateBehavior;
}

export interface SubscribeOptions<T = unknown> {
  retryPolicy?: RetryPolicy;
  idempotency?: IdempotencyOptions<T>;
  performance?: PerformanceOptions;
  classifyError?: ErrorClassifier<T>;
}
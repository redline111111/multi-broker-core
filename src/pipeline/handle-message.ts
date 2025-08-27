import { MessageEnvelope } from "../models/message-envelope";
import { SubscribeOptions, IDEMPOTENCY_DUPLICATE_BEHAVIOR } from "../models/subscribe-options";
import { withRetry } from "../utils/retry";
import { HandlerResult } from "../models/handler-result";
import { ProcessStatus } from "../models/process-status";
import { toIdemInput } from "../messaging/payload-adapter";
import { claim } from "../messaging/idempotency-compat";
import { selectIdempotencyKey } from "../messaging/idempotency-key";

export async function handleWithIdempotencyAndRetry<T>(
  envelope: MessageEnvelope<T>,
  handler: (m: MessageEnvelope<T>) => Promise<HandlerResult>,
  options?: SubscribeOptions
): Promise<HandlerResult> {
  const retry = options?.retryPolicy;

  const execWithClassification = async (): Promise<HandlerResult> => {
    try {
      return await handler(envelope);
    } catch (err: any) {
      const classified =
        options?.classifyError?.(err, envelope) ??
        options?.classifyError?.(err, toIdemInput(envelope));
      if (classified) return classified;
      throw err;
    }
  };

  if (!options?.idempotency) {
    return withRetry(execWithClassification, retry);
  }

  const idemCfg = options.idempotency;

  const inProgressTtl =
    idemCfg.options?.inProgressTtlMs ?? 60_000;
  const succeededTtl =
    idemCfg.options?.succeededTtlMs ?? idemCfg.ttlMs ?? 24 * 60 * 60 * 1000;
  const failedTtl =
    idemCfg.options?.failedTtlMs ?? 60 * 60 * 1000;
  const onDuplicate =
    idemCfg.onDuplicate ?? IDEMPOTENCY_DUPLICATE_BEHAVIOR.ACK;

  const key =
    idemCfg.keySelector?.(envelope) ??
    selectIdempotencyKey(envelope, idemCfg.options) ??
    envelope.id;

  if (!key) {
    return withRetry(execWithClassification, retry);
  }

  const outcome = await claim(idemCfg.store, key, inProgressTtl);

  if (outcome !== "new") {
    switch (onDuplicate) {
      case IDEMPOTENCY_DUPLICATE_BEHAVIOR.NACK_REQUEUE:
        return {
          status: ProcessStatus.NACK,
          errorCode: "DUPLICATE",
          errorMessage: "Duplicate message (requeue)",
          details: { duplicate: true, requeue: true },
        };

      case IDEMPOTENCY_DUPLICATE_BEHAVIOR.NACK_DLQ:
        return {
          status: ProcessStatus.DLQ,
          errorCode: "DUPLICATE",
          errorMessage: "Duplicate message (DLQ)",
          dlqReason: "duplicate",
          details: { duplicate: true },
        };

      case IDEMPOTENCY_DUPLICATE_BEHAVIOR.IGNORE:
        return {
          status: ProcessStatus.ACK,
          details: { duplicate: true, ignored: true },
        };

      case IDEMPOTENCY_DUPLICATE_BEHAVIOR.ACK:
      default:
        return {
          status: ProcessStatus.ACK,
          details: { duplicate: true },
        };
    }
  }

  const result = await withRetry(execWithClassification, retry);

  if (result.status === ProcessStatus.ACK) {
    await idemCfg.store.setSucceeded(key, succeededTtl, { outcome: "ack" });
  } else {
    await idemCfg.store.setFailed(key, failedTtl, { outcome: result.status });
  }

  return result;
}

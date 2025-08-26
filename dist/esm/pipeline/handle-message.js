import { withRetry } from "../utils/retry";
import { IDEMPOTENCY_DUPLICATE_BEHAVIOR } from "../constants/idempotency";
import { ProcessStatus } from "../models/process-status";
export async function handleWithIdempotencyAndRetry(envelope, handler, options) {
    const retry = options?.retryPolicy;
    const execWithClassification = async () => {
        try {
            return await handler(envelope);
        }
        catch (err) {
            const classified = options?.classifyError?.(err, envelope);
            if (classified)
                return classified;
            throw err;
        }
    };
    if (!options?.idempotency) {
        return withRetry(execWithClassification, retry);
    }
    const { store, keySelector, ttlMs, onDuplicate = IDEMPOTENCY_DUPLICATE_BEHAVIOR.ACK } = options.idempotency;
    const key = (keySelector?.(envelope)) ?? envelope.idempotencyKey ?? envelope.id;
    if (!key) {
        return withRetry(execWithClassification, retry);
    }
    const claimed = await store.claim(key, ttlMs);
    if (!claimed) {
        if (onDuplicate === IDEMPOTENCY_DUPLICATE_BEHAVIOR.NACK) {
            return { status: ProcessStatus.NACK, errorCode: "DUPLICATE", errorMessage: "Duplicate message" };
        }
        return { status: ProcessStatus.ACK };
    }
    const result = await withRetry(execWithClassification, retry);
    if (result.status === ProcessStatus.ACK) {
        await store.markProcessed(key);
    }
    else if (store.markFailed) {
        await store.markFailed(key);
    }
    return result;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWithIdempotencyAndRetry = handleWithIdempotencyAndRetry;
const retry_1 = require("../utils/retry");
const idempotency_1 = require("../constants/idempotency");
const process_status_1 = require("../models/process-status");
async function handleWithIdempotencyAndRetry(envelope, handler, options) {
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
        return (0, retry_1.withRetry)(execWithClassification, retry);
    }
    const { store, keySelector, ttlMs, onDuplicate = idempotency_1.IDEMPOTENCY_DUPLICATE_BEHAVIOR.ACK } = options.idempotency;
    const key = (keySelector?.(envelope)) ?? envelope.idempotencyKey ?? envelope.id;
    if (!key) {
        return (0, retry_1.withRetry)(execWithClassification, retry);
    }
    const claimed = await store.claim(key, ttlMs);
    if (!claimed) {
        if (onDuplicate === idempotency_1.IDEMPOTENCY_DUPLICATE_BEHAVIOR.NACK) {
            return { status: process_status_1.ProcessStatus.NACK, errorCode: "DUPLICATE", errorMessage: "Duplicate message" };
        }
        return { status: process_status_1.ProcessStatus.ACK };
    }
    const result = await (0, retry_1.withRetry)(execWithClassification, retry);
    if (result.status === process_status_1.ProcessStatus.ACK) {
        await store.markProcessed(key);
    }
    else if (store.markFailed) {
        await store.markFailed(key);
    }
    return result;
}

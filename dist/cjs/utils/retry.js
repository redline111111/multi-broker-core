"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
const process_status_1 = require("../models/process-status");
const retry_1 = require("../constants/retry");
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
async function withRetry(handler, policy) {
    const maxAttempts = policy?.maxAttempts ?? retry_1.RETRY_DEFAULTS.MAX_ATTEMPTS;
    const baseDelayMs = policy?.baseDelayMs ?? retry_1.RETRY_DEFAULTS.BASE_DELAY_MS;
    const factor = policy?.factor ?? retry_1.RETRY_DEFAULTS.FACTOR;
    const jitterMs = policy?.jitterMs ?? retry_1.RETRY_DEFAULTS.JITTER_MS;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await handler();
            if (result.status === process_status_1.ProcessStatus.RETRY) {
                if (attempt === maxAttempts) {
                    return {
                        status: process_status_1.ProcessStatus.DLQ,
                        errorCode: result.errorCode ?? "RETRY_EXHAUSTED",
                        errorMessage: result.errorMessage ?? "Max attempts exhausted",
                        errorType: result.errorType ?? "RetryExhausted",
                        details: { ...result.details, attempt },
                        dlqReason: result.dlqReason ?? "max_attempts_exceeded",
                        headers: result.headers,
                    };
                }
                const nextDelay = Math.floor(baseDelayMs * Math.pow(factor, attempt - 1) + Math.random() * jitterMs);
                policy?.onRetryAttempt?.({ attempt, error: new Error("Handler requested RETRY"), nextDelayMs: nextDelay });
                await sleep(nextDelay);
                continue;
            }
            return result;
        }
        catch (error) {
            if (attempt === maxAttempts) {
                return {
                    status: process_status_1.ProcessStatus.DLQ,
                    errorCode: "UNHANDLED_EXCEPTION",
                    errorMessage: error?.message ?? "Unhandled exception in handler",
                    errorType: error?.name ?? "Error",
                    details: { attempt },
                    dlqReason: "exception_max_attempts",
                };
            }
            const nextDelay = Math.floor(baseDelayMs * Math.pow(factor, attempt - 1) + Math.random() * jitterMs);
            policy?.onRetryAttempt?.({ attempt, error, nextDelayMs: nextDelay });
            await sleep(nextDelay);
        }
    }
    return { status: process_status_1.ProcessStatus.DLQ, errorCode: "UNREACHABLE_STATE" };
}

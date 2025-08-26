"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeadLetterInfo = buildDeadLetterInfo;
exports.deadLetterHeaders = deadLetterHeaders;
const dlq_1 = require("../constants/dlq");
function buildDeadLetterInfo(originalTopic, envelope, reason, attempts) {
    return {
        originalTopic,
        reason,
        attempts,
        timestamp: Date.now(),
        source: envelope.source,
        messageId: envelope.id,
        correlationId: envelope.correlationId,
    };
}
function deadLetterHeaders(info, result) {
    return {
        [dlq_1.DLQ_HEADER_KEYS.ORIGINAL_TOPIC]: info.originalTopic,
        [dlq_1.DLQ_HEADER_KEYS.REASON]: result?.dlqReason ?? info.reason,
        [dlq_1.DLQ_HEADER_KEYS.ATTEMPTS]: info.attempts,
        [dlq_1.DLQ_HEADER_KEYS.TIMESTAMP]: info.timestamp,
        [dlq_1.DLQ_HEADER_KEYS.SOURCE]: info.source,
        [dlq_1.DLQ_HEADER_KEYS.MESSAGE_ID]: info.messageId,
        [dlq_1.DLQ_HEADER_KEYS.CORRELATION_ID]: info.correlationId ?? null,
        [dlq_1.DLQ_HEADER_KEYS.ERROR_CODE]: result?.errorCode ?? null,
        [dlq_1.DLQ_HEADER_KEYS.ERROR_TYPE]: result?.errorType ?? null,
        [dlq_1.DLQ_HEADER_KEYS.ERROR_MESSAGE]: result?.errorMessage ?? null,
        ...(result?.headers ?? {}),
    };
}

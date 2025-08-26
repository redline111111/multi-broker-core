"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLQ_HEADER_KEYS = void 0;
exports.DLQ_HEADER_KEYS = {
    ORIGINAL_TOPIC: "x-dlq-original-topic",
    REASON: "x-dlq-reason",
    ATTEMPTS: "x-dlq-attempts",
    TIMESTAMP: "x-dlq-timestamp",
    SOURCE: "x-dlq-source",
    MESSAGE_ID: "x-dlq-message-id",
    CORRELATION_ID: "x-dlq-correlation-id",
    ERROR_CODE: "x-dlq-error-code",
    ERROR_TYPE: "x-dlq-error-type",
    ERROR_MESSAGE: "x-dlq-error-message",
};

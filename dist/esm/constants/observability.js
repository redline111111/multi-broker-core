export const OBS_FEATURES_DEFAULT = {
    LOGGING: true,
    TRACING: true,
    METRICS: true,
};
export const METRIC_NAMES = {
    PUBLISH_TOTAL: "messaging_publish_total",
    PUBLISH_ERRORS_TOTAL: "messaging_publish_errors_total",
    PUBLISH_LATENCY_MS: "messaging_publish_latency_ms",
    CONSUME_TOTAL: "messaging_consume_total",
    CONSUME_ERRORS_TOTAL: "messaging_consume_errors_total",
    CONSUME_LATENCY_MS: "messaging_consume_latency_ms",
    ACK_TOTAL: "messaging_ack_total",
    NACK_TOTAL: "messaging_nack_total",
    RETRY_TOTAL: "messaging_retry_total",
    DLQ_TOTAL: "messaging_dlq_total",
};
export const TRACE_NAMES = {
    PUBLISH: "messaging.publish",
    CONSUME: "messaging.consume",
};
export const TRACE_ATTRS = {
    TOPIC: "messaging.topic",
    SOURCE: "messaging.source",
    CORRELATION_ID: "messaging.correlation_id",
    MESSAGE_ID: "messaging.message_id",
    TRANSPORT: "messaging.transport",
};

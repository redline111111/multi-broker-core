export declare const OBS_FEATURES_DEFAULT: {
    readonly LOGGING: true;
    readonly TRACING: true;
    readonly METRICS: true;
};
export declare const METRIC_NAMES: {
    readonly PUBLISH_TOTAL: "messaging_publish_total";
    readonly PUBLISH_ERRORS_TOTAL: "messaging_publish_errors_total";
    readonly PUBLISH_LATENCY_MS: "messaging_publish_latency_ms";
    readonly CONSUME_TOTAL: "messaging_consume_total";
    readonly CONSUME_ERRORS_TOTAL: "messaging_consume_errors_total";
    readonly CONSUME_LATENCY_MS: "messaging_consume_latency_ms";
    readonly ACK_TOTAL: "messaging_ack_total";
    readonly NACK_TOTAL: "messaging_nack_total";
    readonly RETRY_TOTAL: "messaging_retry_total";
    readonly DLQ_TOTAL: "messaging_dlq_total";
};
export declare const TRACE_NAMES: {
    readonly PUBLISH: "messaging.publish";
    readonly CONSUME: "messaging.consume";
};
export declare const TRACE_ATTRS: {
    readonly TOPIC: "messaging.topic";
    readonly SOURCE: "messaging.source";
    readonly CORRELATION_ID: "messaging.correlation_id";
    readonly MESSAGE_ID: "messaging.message_id";
    readonly TRANSPORT: "messaging.transport";
};

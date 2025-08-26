"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityShell = void 0;
const observability_1 = require("../constants/observability");
const time_1 = require("../utils/time");
const process_status_1 = require("../models/process-status");
class ObservabilityShell {
    d;
    constructor(d) {
        this.d = d;
    }
    async runPublish(topic, correlationId, messageId, source, executor, extra) {
        const labels = { topic, transport: this.d.transportName ?? "unknown" };
        const start = (0, time_1.nowMs)();
        const span = this.d.features.tracing
            ? this.d.tracer.startSpan(observability_1.TRACE_NAMES.PUBLISH, {
                [observability_1.TRACE_ATTRS.TOPIC]: topic,
                [observability_1.TRACE_ATTRS.SOURCE]: source,
                [observability_1.TRACE_ATTRS.CORRELATION_ID]: correlationId ?? null,
                [observability_1.TRACE_ATTRS.MESSAGE_ID]: messageId,
                [observability_1.TRACE_ATTRS.TRANSPORT]: this.d.transportName ?? "unknown",
            })
            : undefined;
        try {
            if (this.d.features.logging) {
                this.d.logger.info("publish:start", { topic, correlationId, messageId, delayMs: extra?.delayMs, transport: this.d.transportName });
            }
            const res = await executor();
            if (this.d.features.metrics) {
                this.d.metrics.incCounter(observability_1.METRIC_NAMES.PUBLISH_TOTAL, labels);
                this.d.metrics.observeHistogram(observability_1.METRIC_NAMES.PUBLISH_LATENCY_MS, (0, time_1.nowMs)() - start, labels);
            }
            if (this.d.features.logging) {
                this.d.logger.info("publish:success", { topic, correlationId, messageId, latencyMs: (0, time_1.nowMs)() - start });
            }
            return res;
        }
        catch (error) {
            if (this.d.features.metrics)
                this.d.metrics.incCounter(observability_1.METRIC_NAMES.PUBLISH_ERRORS_TOTAL, labels);
            if (this.d.features.logging)
                this.d.logger.error("publish:error", { topic, correlationId, messageId, error });
            span?.recordException?.(error);
            throw error;
        }
        finally {
            span?.end?.();
        }
    }
    async runConsume(topic, meta, executor, onResultMetric) {
        const labels = { topic, transport: this.d.transportName ?? "unknown", correlationId: meta.correlationId ?? "" };
        const start = (0, time_1.nowMs)();
        const span = this.d.features.tracing
            ? this.d.tracer.startSpan(observability_1.TRACE_NAMES.CONSUME, {
                [observability_1.TRACE_ATTRS.TOPIC]: topic,
                [observability_1.TRACE_ATTRS.SOURCE]: meta.source,
                [observability_1.TRACE_ATTRS.CORRELATION_ID]: meta.correlationId ?? null,
                [observability_1.TRACE_ATTRS.MESSAGE_ID]: meta.messageId,
                [observability_1.TRACE_ATTRS.TRANSPORT]: this.d.transportName ?? "unknown",
            })
            : undefined;
        try {
            if (this.d.features.logging) {
                this.d.logger.debug("consume:start", { topic, correlationId: meta.correlationId, messageId: meta.messageId });
            }
            const result = await executor();
            if (this.d.features.metrics) {
                this.d.metrics.incCounter(observability_1.METRIC_NAMES.CONSUME_TOTAL, labels);
                this.d.metrics.observeHistogram(observability_1.METRIC_NAMES.CONSUME_LATENCY_MS, (0, time_1.nowMs)() - start, labels);
                onResultMetric?.(result);
            }
            if (this.d.features.logging) {
                this.d.logger.debug("consume:finish", { topic, correlationId: meta.correlationId, messageId: meta.messageId, latencyMs: (0, time_1.nowMs)() - start });
            }
            return result;
        }
        catch (error) {
            if (this.d.features.metrics)
                this.d.metrics.incCounter(observability_1.METRIC_NAMES.CONSUME_ERRORS_TOTAL, labels);
            if (this.d.features.logging)
                this.d.logger.error("consume:error", { topic, correlationId: meta.correlationId, messageId: meta.messageId, error });
            span?.recordException?.(error);
            throw error;
        }
        finally {
            span?.end?.();
        }
    }
    updateConsumeResultMetrics(result, labels) {
        if (!this.d.features.metrics)
            return;
        const fullLabels = { ...labels, transport: this.d.transportName ?? "unknown" };
        switch (result.status) {
            case process_status_1.ProcessStatus.ACK:
                this.d.metrics.incCounter(observability_1.METRIC_NAMES.ACK_TOTAL, fullLabels);
                break;
            case process_status_1.ProcessStatus.NACK:
                this.d.metrics.incCounter(observability_1.METRIC_NAMES.NACK_TOTAL, fullLabels);
                break;
            case process_status_1.ProcessStatus.RETRY:
                this.d.metrics.incCounter(observability_1.METRIC_NAMES.RETRY_TOTAL, fullLabels);
                break;
            case process_status_1.ProcessStatus.DLQ:
                this.d.metrics.incCounter(observability_1.METRIC_NAMES.DLQ_TOTAL, fullLabels);
                break;
        }
    }
}
exports.ObservabilityShell = ObservabilityShell;

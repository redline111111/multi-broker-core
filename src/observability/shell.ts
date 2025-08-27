import { Logger } from "../interfaces/logger";
import { Tracer } from "../interfaces/tracer";
import { Metrics } from "../interfaces/metrics";
import { METRIC_NAMES, TRACE_ATTRS, TRACE_NAMES } from "../constants/observability";
import { nowMs } from "../utils/time";
import { AckStatus } from "../models/ack-status";
import { HandlerResult } from "../models/handler-result";
import { ProcessStatus } from "../models/process-status";

export interface ShellDeps {
  logger: Logger;
  tracer: Tracer;
  metrics: Metrics;
  features: { logging: boolean; tracing: boolean; metrics: boolean };
  transportName?: string;
}

export class ObservabilityShell {
  constructor(private readonly d: ShellDeps) {}

  async runPublish<T>(
    topic: string,
    correlationId: string | undefined,
    messageId: string,
    source: string,
    executor: () => Promise<T>,
    extra?: { delayMs?: number }
  ): Promise<T> {
    const labels = { topic, transport: this.d.transportName ?? "unknown" };
    const start = nowMs();

    const span = this.d.features.tracing
      ? this.d.tracer.startSpan(TRACE_NAMES.PUBLISH, {
          [TRACE_ATTRS.TOPIC]: topic,
          [TRACE_ATTRS.SOURCE]: source,
          [TRACE_ATTRS.CORRELATION_ID]: correlationId ?? null,
          [TRACE_ATTRS.MESSAGE_ID]: messageId,
          [TRACE_ATTRS.TRANSPORT]: this.d.transportName ?? "unknown",
        })
      : undefined;

    try {
      if (this.d.features.logging) {
        this.d.logger.info("publish:start", { topic, correlationId, messageId, delayMs: extra?.delayMs, transport: this.d.transportName });
      }

      const res = await executor();

      if (this.d.features.metrics) {
        this.d.metrics.inc(METRIC_NAMES.PUBLISH_TOTAL, labels);
        this.d.metrics.observe(METRIC_NAMES.PUBLISH_LATENCY_MS, nowMs() - start, labels);
      }
      if (this.d.features.logging) {
        this.d.logger.info("publish:success", { topic, correlationId, messageId, latencyMs: nowMs() - start });
      }

      return res;
    } catch (error) {
      if (this.d.features.metrics) this.d.metrics.inc(METRIC_NAMES.PUBLISH_ERRORS_TOTAL, labels);
      if (this.d.features.logging) this.d.logger.error("publish:error", { topic, correlationId, messageId, error });
      span?.recordException?.(error);
      throw error;
    } finally {
      span?.end?.();
    }
  }

  async runConsume<R>(
    topic: string,
    meta: { correlationId?: string; messageId: string; source: string },
    executor: () => Promise<R>,
    onResultMetric?: (result: R) => void
  ): Promise<R> {
    const labels = { topic, transport: this.d.transportName ?? "unknown", correlationId: meta.correlationId ?? "" };
    const start = nowMs();

    const span = this.d.features.tracing
      ? this.d.tracer.startSpan(TRACE_NAMES.CONSUME, {
          [TRACE_ATTRS.TOPIC]: topic,
          [TRACE_ATTRS.SOURCE]: meta.source,
          [TRACE_ATTRS.CORRELATION_ID]: meta.correlationId ?? null,
          [TRACE_ATTRS.MESSAGE_ID]: meta.messageId,
          [TRACE_ATTRS.TRANSPORT]: this.d.transportName ?? "unknown",
        })
      : undefined;

    try {
      if (this.d.features.logging) {
        this.d.logger.debug("consume:start", { topic, correlationId: meta.correlationId, messageId: meta.messageId });
      }

      const result = await executor();

      if (this.d.features.metrics) {
        this.d.metrics.inc(METRIC_NAMES.CONSUME_TOTAL, labels);
        this.d.metrics.observe(METRIC_NAMES.CONSUME_LATENCY_MS, nowMs() - start, labels);
        onResultMetric?.(result);
      }
      if (this.d.features.logging) {
        this.d.logger.debug("consume:finish", { topic, correlationId: meta.correlationId, messageId: meta.messageId, latencyMs: nowMs() - start });
      }

      return result;
    } catch (error) {
      if (this.d.features.metrics) this.d.metrics.inc(METRIC_NAMES.CONSUME_ERRORS_TOTAL, labels);
      if (this.d.features.logging) this.d.logger.error("consume:error", { topic, correlationId: meta.correlationId, messageId: meta.messageId, error });
      span?.recordException?.(error);
      throw error;
    } finally {
      span?.end?.();
    }
  }

  updateConsumeResultMetrics(result: HandlerResult, labels: Record<string, string>) {
    if (!this.d.features.metrics) return;
    const fullLabels = { ...labels, transport: this.d.transportName ?? "unknown" };

    switch (result.status) {
      case ProcessStatus.ACK:   this.d.metrics.inc(METRIC_NAMES.ACK_TOTAL, fullLabels); break;
      case ProcessStatus.NACK:  this.d.metrics.inc(METRIC_NAMES.NACK_TOTAL, fullLabels); break;
      case ProcessStatus.RETRY: this.d.metrics.inc(METRIC_NAMES.RETRY_TOTAL, fullLabels); break;
      case ProcessStatus.DLQ:   this.d.metrics.inc(METRIC_NAMES.DLQ_TOTAL, fullLabels); break;
    }
  }
}

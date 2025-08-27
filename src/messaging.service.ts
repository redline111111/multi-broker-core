import { MessageTransport } from "./interfaces/message-transport";
import { MessageEnvelope } from "./models/message-envelope";
import { AckStatus } from "./models/ack-status";
import { ERROR_MESSAGES } from "./constants/errors";
import { PublishOptions } from "./models/publish-options";
import { RetryPolicy } from "./models/retry-policy";
import { SubscribeOptions } from "./models/subscribe-options";

import { ObservabilityOptions } from "./models/observability-options";
import { NoopLogger } from "./interfaces/logger";
import { NoopTracer } from "./interfaces/tracer";
import { NoopMetrics } from "./interfaces/metrics";
import { OBS_FEATURES_DEFAULT } from "./constants/observability";

import { ObservabilityShell } from "./observability/shell";
import { handleWithIdempotencyAndRetry } from "./pipeline/handle-message";
import { SchemaValidator } from "./interfaces/schema-validator";
import { Semaphore, NoopSemaphore } from "./utils/semaphore";
import { PERF_DEFAULTS } from "./models/performance-options";
import { HandlerResult } from "./models/handler-result";
import { HealthReport, HealthStatus } from "./models/health";
import { HEALTH_DETAIL_KEYS, HEALTH_REASONS } from "./constants/health";

export class MessagingService {
  private transport?: MessageTransport;
  private shell: ObservabilityShell;
  private readonly defaultRetry?: RetryPolicy;

  constructor(
    private readonly resolveTransport: () =>
      | Promise<MessageTransport>
      | MessageTransport,
    defaultRetryPolicy?: RetryPolicy,
    observability?: ObservabilityOptions
  ) {
    this.defaultRetry = defaultRetryPolicy;

    const logger = observability?.logger ?? new NoopLogger();
    const tracer = observability?.tracer ?? new NoopTracer();
    const metrics = observability?.metrics ?? new NoopMetrics();
    const features = {
      logging: observability?.features?.logging ?? OBS_FEATURES_DEFAULT.LOGGING,
      tracing: observability?.features?.tracing ?? OBS_FEATURES_DEFAULT.TRACING,
      metrics: observability?.features?.metrics ?? OBS_FEATURES_DEFAULT.METRICS,
    };

    this.shell = new ObservabilityShell({
      logger,
      tracer,
      metrics,
      features,
      transportName: observability?.transportName,
    });
  }

  async start() {
    this.transport = await this.resolveTransport();
    await this.transport.connect();
  }

  async stop() {
    await this.transport?.disconnect();
  }

  async publish<T>(
    topic: string,
    payload: T,
    source: string,
    correlationId?: string,
    options?: PublishOptions
  ) {
    if (!this.transport) throw new Error(ERROR_MESSAGES.NOT_CONNECTED);

    const envelope: MessageEnvelope<T> = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      source,
      correlationId,
      payload,
      idempotencyKey: options?.idempotencyKey,
    };

    await this.shell.runPublish(
      topic,
      correlationId,
      envelope.id,
      source,
      async () => {
        await this.transport!.publish(topic, envelope, options);
      },
      { delayMs: options?.delayMs }
    );
  }

  async publishBatch<T>(
    topic: string,
    items: Array<{ payload: T; options?: PublishOptions }>,
    source: string,
    correlationId?: string,
    commonOptions?: PublishOptions
  ) {
    if (!this.transport) throw new Error(ERROR_MESSAGES.NOT_CONNECTED);
    const envelopes: Array<MessageEnvelope<T>> = items.map(
      ({ payload, options }) => ({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        source,
        correlationId,
        payload,
        idempotencyKey:
          options?.idempotencyKey ?? commonOptions?.idempotencyKey,
      })
    );

    if (typeof this.transport.publishBatch === "function") {
      await this.shell.runPublish(
        topic,
        correlationId,
        `batch:${crypto.randomUUID()}`,
        source,
        async () => {
          await this.transport!.publishBatch!(topic, envelopes, commonOptions);
        },
        { delayMs: commonOptions?.delayMs }
      );
      return;
    }

    for (let i = 0; i < envelopes.length; i++) {
      await this.shell.runPublish(
        topic,
        correlationId,
        envelopes[i].id,
        source,
        async () => {
          await this.transport!.publish(
            topic,
            envelopes[i],
            items[i].options ?? commonOptions
          );
        },
        { delayMs: (items[i].options ?? commonOptions)?.delayMs }
      );
    }
  }

  async subscribe<T>(
    topic: string,
    handler: (message: MessageEnvelope<T>) => Promise<HandlerResult>,
    options?: SubscribeOptions<T>,
    validator?: SchemaValidator<MessageEnvelope<T>>
  ) {
    if (!this.transport) throw new Error(ERROR_MESSAGES.NOT_CONNECTED);

    const effective: SubscribeOptions<T> = {
      ...options,
      retryPolicy: options?.retryPolicy ?? this.defaultRetry,
    };

    const prefetch = effective.performance?.prefetch;
    if (prefetch && typeof this.transport.setPrefetch === "function") {
      await this.transport.setPrefetch(topic, prefetch);
    }

    const limit = effective.performance?.concurrency ?? undefined;
    const sem =
      typeof limit === "number" && limit > 0
        ? new Semaphore(limit)
        : new NoopSemaphore();

    await this.transport.subscribe<T>(topic, async (msg) => {
      await sem.acquire();
      try {
        const validated = validator ? validator.validate(msg) : msg;

        return this.shell.runConsume(
          topic,
          {
            correlationId: validated.correlationId,
            messageId: validated.id,
            source: validated.source,
          },
          () => handleWithIdempotencyAndRetry(validated, handler, effective),
          (result) => this.shell.updateConsumeResultMetrics(result, { topic })
        );
      } finally {
        sem.release();
      }
    });
  }

  async healthCheck(): Promise<HealthReport> {
    const timestamp = Date.now();
    if (!this.transport) {
      return {
        status: HealthStatus.UNHEALTHY,
        timestamp,
        details: {
          [HEALTH_DETAIL_KEYS.REASON]: HEALTH_REASONS.TRANSPORT_NOT_INITIALIZED,
        },
      };
    }

    try {
      const healthy = (await this.transport.isHealthy?.()) ?? null;
      const info = (await this.transport.info?.()) ?? undefined;

      if (healthy === true) {
        return { status: HealthStatus.HEALTHY, timestamp, details: info };
      }
      if (healthy === false) {
        return {
          status: HealthStatus.UNHEALTHY,
          timestamp,
          details: info ?? {
            [HEALTH_DETAIL_KEYS.REASON]:
              HEALTH_REASONS.TRANSPORT_REPORTED_UNHEALTHY,
          },
        };
      }
      return {
        status: HealthStatus.DEGRADED,
        timestamp,
        details: {
          ...(info ?? {}),
          [HEALTH_DETAIL_KEYS.NOTE]: HEALTH_REASONS.TRANSPORT_NO_ISHEALTHY,
        },
      };
    } catch (error: any) {
      return {
        status: HealthStatus.UNHEALTHY,
        timestamp,
        details: {
          [HEALTH_DETAIL_KEYS.ERROR]:
            error?.message ?? HEALTH_REASONS.HEALTH_CHECK_FAILED,
        },  
      };
    }
  }
}

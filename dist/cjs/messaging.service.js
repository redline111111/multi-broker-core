"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const errors_1 = require("./constants/errors");
const logger_1 = require("./interfaces/logger");
const tracer_1 = require("./interfaces/tracer");
const metrics_1 = require("./interfaces/metrics");
const observability_1 = require("./constants/observability");
const shell_1 = require("./observability/shell");
const handle_message_1 = require("./pipeline/handle-message");
const semaphore_1 = require("./utils/semaphore");
const health_1 = require("./models/health");
const health_2 = require("./constants/health");
class MessagingService {
    resolveTransport;
    transport;
    shell;
    defaultRetry;
    constructor(resolveTransport, defaultRetryPolicy, observability) {
        this.resolveTransport = resolveTransport;
        this.defaultRetry = defaultRetryPolicy;
        const logger = observability?.logger ?? new logger_1.NoopLogger();
        const tracer = observability?.tracer ?? new tracer_1.NoopTracer();
        const metrics = observability?.metrics ?? new metrics_1.NoopMetrics();
        const features = {
            logging: observability?.features?.logging ?? observability_1.OBS_FEATURES_DEFAULT.LOGGING,
            tracing: observability?.features?.tracing ?? observability_1.OBS_FEATURES_DEFAULT.TRACING,
            metrics: observability?.features?.metrics ?? observability_1.OBS_FEATURES_DEFAULT.METRICS,
        };
        this.shell = new shell_1.ObservabilityShell({
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
    async publish(topic, payload, source, correlationId, options) {
        if (!this.transport)
            throw new Error(errors_1.ERROR_MESSAGES.NOT_CONNECTED);
        const envelope = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            source,
            correlationId,
            payload,
            idempotencyKey: options?.idempotencyKey,
        };
        await this.shell.runPublish(topic, correlationId, envelope.id, source, async () => {
            await this.transport.publish(topic, envelope, options);
        }, { delayMs: options?.delayMs });
    }
    /**
     * Batch publish:
     * - Если транспорт поддерживает publishBatch — используем его.
     * - Иначе — публикуем поштучно, сохраняя наблюдаемость.
     */
    async publishBatch(topic, items, source, correlationId, commonOptions) {
        if (!this.transport)
            throw new Error(errors_1.ERROR_MESSAGES.NOT_CONNECTED);
        const envelopes = items.map(({ payload, options }) => ({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            source,
            correlationId,
            payload,
            idempotencyKey: options?.idempotencyKey ?? commonOptions?.idempotencyKey,
        }));
        if (typeof this.transport.publishBatch === "function") {
            await this.shell.runPublish(topic, correlationId, `batch:${crypto.randomUUID()}`, source, async () => {
                await this.transport.publishBatch(topic, envelopes, commonOptions);
            }, { delayMs: commonOptions?.delayMs });
            return;
        }
        for (let i = 0; i < envelopes.length; i++) {
            await this.shell.runPublish(topic, correlationId, envelopes[i].id, source, async () => {
                await this.transport.publish(topic, envelopes[i], items[i].options ?? commonOptions);
            }, { delayMs: (items[i].options ?? commonOptions)?.delayMs });
        }
    }
    async subscribe(topic, handler, options, validator) {
        if (!this.transport)
            throw new Error(errors_1.ERROR_MESSAGES.NOT_CONNECTED);
        const effective = {
            ...options,
            retryPolicy: options?.retryPolicy ?? this.defaultRetry,
        };
        const prefetch = effective.performance?.prefetch;
        if (prefetch && typeof this.transport.setPrefetch === "function") {
            await this.transport.setPrefetch(topic, prefetch);
        }
        const limit = effective.performance?.concurrency ?? undefined;
        const sem = typeof limit === "number" && limit > 0 ? new semaphore_1.Semaphore(limit) : new semaphore_1.NoopSemaphore();
        await this.transport.subscribe(topic, async (msg) => {
            await sem.acquire();
            try {
                const validated = validator ? validator.validate(msg) : msg;
                return this.shell.runConsume(topic, { correlationId: validated.correlationId, messageId: validated.id, source: validated.source }, () => (0, handle_message_1.handleWithIdempotencyAndRetry)(validated, handler, effective), (result) => this.shell.updateConsumeResultMetrics(result, { topic }));
            }
            finally {
                sem.release();
            }
        });
    }
    async healthCheck() {
        const timestamp = Date.now();
        if (!this.transport) {
            return {
                status: health_1.HealthStatus.UNHEALTHY,
                timestamp,
                details: { [health_2.HEALTH_DETAIL_KEYS.REASON]: health_2.HEALTH_REASONS.TRANSPORT_NOT_INITIALIZED }
            };
        }
        try {
            const healthy = (await this.transport.isHealthy?.()) ?? null;
            const info = (await this.transport.info?.()) ?? undefined;
            if (healthy === true) {
                return { status: health_1.HealthStatus.HEALTHY, timestamp, details: info };
            }
            if (healthy === false) {
                return {
                    status: health_1.HealthStatus.UNHEALTHY,
                    timestamp,
                    details: info ?? { [health_2.HEALTH_DETAIL_KEYS.REASON]: health_2.HEALTH_REASONS.TRANSPORT_REPORTED_UNHEALTHY },
                };
            }
            return {
                status: health_1.HealthStatus.DEGRADED,
                timestamp,
                details: { ...(info ?? {}), [health_2.HEALTH_DETAIL_KEYS.NOTE]: health_2.HEALTH_REASONS.TRANSPORT_NO_ISHEALTHY },
            };
        }
        catch (error) {
            return {
                status: health_1.HealthStatus.UNHEALTHY,
                timestamp,
                details: { [health_2.HEALTH_DETAIL_KEYS.ERROR]: error?.message ?? health_2.HEALTH_REASONS.HEALTH_CHECK_FAILED },
            };
        }
    }
}
exports.MessagingService = MessagingService;

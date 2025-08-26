import { MessageTransport } from "./interfaces/message-transport";
import { MessageEnvelope } from "./models/message-envelope";
import { PublishOptions } from "./models/publish-options";
import { RetryPolicy } from "./models/retry-policy";
import { SubscribeOptions } from "./models/subscribe-options";
import { ObservabilityOptions } from "./models/observability-options";
import { SchemaValidator } from "./interfaces/schema-validator";
import { HandlerResult } from "./models/handler-result";
import { HealthReport } from "./models/health";
export declare class MessagingService {
    private readonly resolveTransport;
    private transport?;
    private shell;
    private readonly defaultRetry?;
    constructor(resolveTransport: () => Promise<MessageTransport> | MessageTransport, defaultRetryPolicy?: RetryPolicy, observability?: ObservabilityOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
    publish<T>(topic: string, payload: T, source: string, correlationId?: string, options?: PublishOptions): Promise<void>;
    /**
     * Batch publish:
     * - Если транспорт поддерживает publishBatch — используем его.
     * - Иначе — публикуем поштучно, сохраняя наблюдаемость.
     */
    publishBatch<T>(topic: string, items: Array<{
        payload: T;
        options?: PublishOptions;
    }>, source: string, correlationId?: string, commonOptions?: PublishOptions): Promise<void>;
    subscribe<T>(topic: string, handler: (message: MessageEnvelope<T>) => Promise<HandlerResult>, options?: SubscribeOptions<T>, validator?: SchemaValidator<MessageEnvelope<T>>): Promise<void>;
    healthCheck(): Promise<HealthReport>;
}

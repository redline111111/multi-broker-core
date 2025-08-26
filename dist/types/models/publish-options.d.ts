import { ContentType } from "./content-type";
export interface PublishOptions {
    delayMs?: number;
    idempotencyKey?: string;
    headers?: Record<string, string>;
    contentType?: ContentType;
    partitionKey?: string;
    /**
     * AMQP routingKey / Kafka partitionKey — универсальные поля маршрутизации.
     * Транспорт может проигнорировать, если не поддерживается.
     */
    routingKey?: string;
    /**
     * Дополнительные опции конкретного транспорта (тонкая настройка).
     */
    transportOptions?: unknown;
    ttlMs?: number;
    expiresAtMs?: number;
    priority?: number;
}

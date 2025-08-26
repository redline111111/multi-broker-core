export interface MessageEnvelope<T = unknown> {
    id: string;
    timestamp: number;
    correlationId?: string;
    source: string;
    idempotencyKey?: string;
    payload: T;
    headers?: Record<string, unknown>;
}

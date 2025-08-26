export interface Span {
    setAttribute(key: string, value: unknown): void;
    recordException?(error: unknown): void;
    end(): void;
}
export interface Tracer {
    startSpan(name: string, attributes?: Record<string, unknown>): Span;
}
export declare class NoopTracer implements Tracer {
    startSpan(): Span;
}
/**
 * Опциональный адаптер под OpenTelemetry без жёсткой зависимости.
 * Передайте сюда tracer из @opentelemetry/api: tracer = otel.trace.getTracer('name')
 */
export declare class OtelTracerAdapter implements Tracer {
    private readonly otelTracer;
    constructor(otelTracer: any);
    startSpan(name: string, attributes?: Record<string, unknown>): Span;
}

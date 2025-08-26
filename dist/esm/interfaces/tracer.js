export class NoopTracer {
    startSpan() {
        return { setAttribute() { }, end() { } };
    }
}
/**
 * Опциональный адаптер под OpenTelemetry без жёсткой зависимости.
 * Передайте сюда tracer из @opentelemetry/api: tracer = otel.trace.getTracer('name')
 */
export class OtelTracerAdapter {
    otelTracer;
    constructor(otelTracer) {
        this.otelTracer = otelTracer;
    }
    startSpan(name, attributes) {
        const span = this.otelTracer.startSpan(name, { attributes });
        return {
            setAttribute: (k, v) => span.setAttribute?.(k, v),
            recordException: (e) => span.recordException?.(e),
            end: () => span.end(),
        };
    }
}

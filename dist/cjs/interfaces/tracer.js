"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtelTracerAdapter = exports.NoopTracer = void 0;
class NoopTracer {
    startSpan() {
        return { setAttribute() { }, end() { } };
    }
}
exports.NoopTracer = NoopTracer;
/**
 * Опциональный адаптер под OpenTelemetry без жёсткой зависимости.
 * Передайте сюда tracer из @opentelemetry/api: tracer = otel.trace.getTracer('name')
 */
class OtelTracerAdapter {
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
exports.OtelTracerAdapter = OtelTracerAdapter;

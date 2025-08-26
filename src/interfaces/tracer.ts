export interface Span {
  setAttribute(key: string, value: unknown): void;
  recordException?(error: unknown): void;
  end(): void;
}

export interface Tracer {
  startSpan(name: string, attributes?: Record<string, unknown>): Span;
}

export class NoopTracer implements Tracer {
  startSpan(): Span {
    return { setAttribute() {}, end() {} };
  }
}

/**
 * Опциональный адаптер под OpenTelemetry без жёсткой зависимости.
 * Передайте сюда tracer из @opentelemetry/api: tracer = otel.trace.getTracer('name')
 */
export class OtelTracerAdapter implements Tracer {
  constructor(private readonly otelTracer: any) {}
  startSpan(name: string, attributes?: Record<string, unknown>): Span {
    const span = this.otelTracer.startSpan(name, { attributes });
    return {
      setAttribute: (k, v) => span.setAttribute?.(k, v as any),
      recordException: (e) => span.recordException?.(e as any),
      end: () => span.end(),
    };
  }
}

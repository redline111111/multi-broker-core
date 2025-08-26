import { Span, Tracer } from "../interfaces/tracer";

class ConsoleSpan implements Span {
  constructor(private name: string, private attrs?: Record<string, unknown>) {
    console.log("▶️ span:start", name, attrs ?? {});
  }
  setAttribute(key: string, value: unknown): void {
    console.log("  ↳ attr:", key, "=", value);
  }
  recordException(error: unknown): void {
    console.log("  ⚠️ exception:", error);
  }
  end(): void {
    console.log("⏹ span:end", this.name);
  }
}

export class ConsoleTracer implements Tracer {
  startSpan(name: string, attributes?: Record<string, unknown>): Span {
    return new ConsoleSpan(name, attributes);
  }
}
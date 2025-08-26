import { Span, Tracer } from "../interfaces/tracer";
export declare class ConsoleTracer implements Tracer {
    startSpan(name: string, attributes?: Record<string, unknown>): Span;
}

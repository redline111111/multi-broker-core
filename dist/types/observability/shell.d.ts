import { Logger } from "../interfaces/logger";
import { Tracer } from "../interfaces/tracer";
import { Metrics } from "../interfaces/metrics";
import { HandlerResult } from "../models/handler-result";
export interface ShellDeps {
    logger: Logger;
    tracer: Tracer;
    metrics: Metrics;
    features: {
        logging: boolean;
        tracing: boolean;
        metrics: boolean;
    };
    transportName?: string;
}
export declare class ObservabilityShell {
    private readonly d;
    constructor(d: ShellDeps);
    runPublish<T>(topic: string, correlationId: string | undefined, messageId: string, source: string, executor: () => Promise<T>, extra?: {
        delayMs?: number;
    }): Promise<T>;
    runConsume<R>(topic: string, meta: {
        correlationId?: string;
        messageId: string;
        source: string;
    }, executor: () => Promise<R>, onResultMetric?: (result: R) => void): Promise<R>;
    updateConsumeResultMetrics(result: HandlerResult, labels: Record<string, string>): void;
}

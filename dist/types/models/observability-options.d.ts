import { Logger } from "../interfaces/logger";
import { Tracer } from "../interfaces/tracer";
import { Metrics } from "../interfaces/metrics";
export interface ObservabilityFeatures {
    logging?: boolean;
    tracing?: boolean;
    metrics?: boolean;
}
export interface ObservabilityOptions {
    logger?: Logger;
    tracer?: Tracer;
    metrics?: Metrics;
    features?: ObservabilityFeatures;
    /** Имя транспорта для логов/трейсов (например, 'rabbitmq'). */
    transportName?: string;
}

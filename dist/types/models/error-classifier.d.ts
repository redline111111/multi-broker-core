import { HandlerResult } from "./handler-result";
import { MessageEnvelope } from "./message-envelope";
export declare enum ErrorOutcome {
    RETRY = "retry",
    DLQ = "dlq",
    NACK = "nack",
    ACK = "ack"
}
/**
 * Верните один из исходов, чтобы немедленно задать политику обработки.
 * Верните undefined — чтобы применялась стандартная retry-политика.
 */
export type ErrorClassifier<T = unknown> = (error: unknown, envelope: MessageEnvelope<T>) => HandlerResult | undefined;

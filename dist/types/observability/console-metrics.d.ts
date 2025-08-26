import { Metrics } from "../interfaces/metrics";
export declare class ConsoleMetrics implements Metrics {
    incCounter(name: string, labels?: Record<string, string>): void;
    observeHistogram(name: string, valueMs: number, labels?: Record<string, string>): void;
}

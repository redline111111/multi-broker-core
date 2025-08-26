export interface Metrics {
    incCounter(name: string, labels?: Record<string, string | number | boolean>): void;
    observeHistogram(name: string, value: number, labels?: Record<string, string | number | boolean>): void;
}
export declare class NoopMetrics implements Metrics {
    incCounter(): void;
    observeHistogram(): void;
}
export declare class ConsoleMetrics implements Metrics {
    incCounter(name: string, labels?: Record<string, string | number | boolean>): void;
    observeHistogram(name: string, value: number, labels?: Record<string, string | number | boolean>): void;
}

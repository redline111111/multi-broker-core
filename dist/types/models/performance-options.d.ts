export interface PerformanceOptions {
    /** Лимит параллельных обработок в subscribe (backpressure на уровне core). */
    concurrency?: number;
    /** Предпочтительный prefetch размера буфера у брокера (исполняет транспорт, если умеет). */
    prefetch?: number;
}
export declare const PERF_DEFAULTS: PerformanceOptions;

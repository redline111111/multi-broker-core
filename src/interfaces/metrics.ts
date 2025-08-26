export interface Metrics {
  incCounter(name: string, labels?: Record<string, string | number | boolean>): void;
  observeHistogram(name: string, value: number, labels?: Record<string, string | number | boolean>): void;
}

export class NoopMetrics implements Metrics {
  incCounter(): void {}
  observeHistogram(): void {}
}

export class ConsoleMetrics implements Metrics {
  incCounter(name: string, labels?: Record<string, string | number | boolean>) {
    console.log(`[metric] ${name} +1`, labels ?? "");
  }
  observeHistogram(name: string, value: number, labels?: Record<string, string | number | boolean>) {
    console.log(`[metric] ${name} observe=${value}`, labels ?? "");
  }
}

export interface Metrics {
  inc(name: string, labels?: Record<string, string | number | boolean>, value?: number): void;
  observe(name: string, value: number, labels?: Record<string, string | number | boolean>): void;
}

export class NoopMetrics implements Metrics {
  inc(): void {}
  observe(): void {}
}

export class ConsoleMetrics implements Metrics {
  inc(name: string, labels?: Record<string, string | number | boolean>) {
    console.log(`[metric] ${name} +1`, labels ?? "");
  }
  observe(name: string, value: number, labels?: Record<string, string | number | boolean>) {
    console.log(`[metric] ${name} observe=${value}`, labels ?? "");
  }
}

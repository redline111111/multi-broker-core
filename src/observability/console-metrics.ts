import { Metrics } from "../interfaces/metrics";

export class ConsoleMetrics implements Metrics {
 incCounter(name: string, labels?: Record<string, string>): void {
    console.log(`📈 counter/inc ${name}`, labels ?? {});
  }
  observeHistogram(name: string, valueMs: number, labels?: Record<string, string>): void {
    console.log(`⏱ histogram ${name}: ${valueMs}ms`, labels ?? {});
  }
}
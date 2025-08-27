import { Metrics } from "../interfaces/metrics";

export class ConsoleMetrics implements Metrics {
 inc(name: string, labels?: Record<string, string>): void {
    console.log(`📈 counter/inc ${name}`, labels ?? {});
  }
  observe(name: string, valueMs: number, labels?: Record<string, string>): void {
    console.log(`⏱ histogram ${name}: ${valueMs}ms`, labels ?? {});
  }
}
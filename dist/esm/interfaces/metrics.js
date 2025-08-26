export class NoopMetrics {
    incCounter() { }
    observeHistogram() { }
}
export class ConsoleMetrics {
    incCounter(name, labels) {
        console.log(`[metric] ${name} +1`, labels ?? "");
    }
    observeHistogram(name, value, labels) {
        console.log(`[metric] ${name} observe=${value}`, labels ?? "");
    }
}

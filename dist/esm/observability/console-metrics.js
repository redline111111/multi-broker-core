export class ConsoleMetrics {
    incCounter(name, labels) {
        console.log(`📈 counter/inc ${name}`, labels ?? {});
    }
    observeHistogram(name, valueMs, labels) {
        console.log(`⏱ histogram ${name}: ${valueMs}ms`, labels ?? {});
    }
}

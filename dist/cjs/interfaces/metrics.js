"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleMetrics = exports.NoopMetrics = void 0;
class NoopMetrics {
    incCounter() { }
    observeHistogram() { }
}
exports.NoopMetrics = NoopMetrics;
class ConsoleMetrics {
    incCounter(name, labels) {
        console.log(`[metric] ${name} +1`, labels ?? "");
    }
    observeHistogram(name, value, labels) {
        console.log(`[metric] ${name} observe=${value}`, labels ?? "");
    }
}
exports.ConsoleMetrics = ConsoleMetrics;

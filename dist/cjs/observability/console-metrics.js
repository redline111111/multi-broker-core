"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleMetrics = void 0;
class ConsoleMetrics {
    incCounter(name, labels) {
        console.log(`📈 counter/inc ${name}`, labels ?? {});
    }
    observeHistogram(name, valueMs, labels) {
        console.log(`⏱ histogram ${name}: ${valueMs}ms`, labels ?? {});
    }
}
exports.ConsoleMetrics = ConsoleMetrics;

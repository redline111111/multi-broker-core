"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleTracer = void 0;
class ConsoleSpan {
    name;
    attrs;
    constructor(name, attrs) {
        this.name = name;
        this.attrs = attrs;
        console.log("▶️ span:start", name, attrs ?? {});
    }
    setAttribute(key, value) {
        console.log("  ↳ attr:", key, "=", value);
    }
    recordException(error) {
        console.log("  ⚠️ exception:", error);
    }
    end() {
        console.log("⏹ span:end", this.name);
    }
}
class ConsoleTracer {
    startSpan(name, attributes) {
        return new ConsoleSpan(name, attributes);
    }
}
exports.ConsoleTracer = ConsoleTracer;

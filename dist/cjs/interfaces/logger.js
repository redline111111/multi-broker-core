"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogger = exports.NoopLogger = void 0;
class NoopLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
}
exports.NoopLogger = NoopLogger;
class ConsoleLogger {
    debug(message, meta) { console.debug(message, meta ?? ""); }
    info(message, meta) { console.info(message, meta ?? ""); }
    warn(message, meta) { console.warn(message, meta ?? ""); }
    error(message, meta) { console.error(message, meta ?? ""); }
}
exports.ConsoleLogger = ConsoleLogger;

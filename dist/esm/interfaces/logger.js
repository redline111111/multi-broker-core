export class NoopLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
}
export class ConsoleLogger {
    debug(message, meta) { console.debug(message, meta ?? ""); }
    info(message, meta) { console.info(message, meta ?? ""); }
    warn(message, meta) { console.warn(message, meta ?? ""); }
    error(message, meta) { console.error(message, meta ?? ""); }
}

export class ConsoleLogger {
    debug(message, meta) {
        const ts = new Date().toISOString();
        console.debug(`[${ts}] [DEBUG] ${message}`, meta ?? "");
    }
    info(message, meta) {
        const ts = new Date().toISOString();
        console.info(`[${ts}] [INFO ] ${message}`, meta ?? "");
    }
    warn(message, meta) {
        const ts = new Date().toISOString();
        console.warn(`[${ts}] [WARN ] ${message}`, meta ?? "");
    }
    error(message, meta) {
        const ts = new Date().toISOString();
        console.error(`[${ts}] [ERROR] ${message}`, meta ?? "");
    }
}

import { Logger } from "../interfaces/logger";

export class ConsoleLogger implements Logger {
  debug(message: string, meta?: Record<string, unknown>): void {
    const ts = new Date().toISOString();
    console.debug(`[${ts}] [DEBUG] ${message}`, meta ?? "");
  }
  info(message: string, meta?: Record<string, unknown>): void {
    const ts = new Date().toISOString();
    console.info(`[${ts}] [INFO ] ${message}`, meta ?? "");
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    const ts = new Date().toISOString();
    console.warn(`[${ts}] [WARN ] ${message}`, meta ?? "");
  }
  error(message: string, meta?: Record<string, unknown>): void {
    const ts = new Date().toISOString();
    console.error(`[${ts}] [ERROR] ${message}`, meta ?? "");
  }
}
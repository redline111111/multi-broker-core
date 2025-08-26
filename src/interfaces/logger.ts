export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export class NoopLogger implements Logger {
  debug(): void {} 
  info(): void {} 
  warn(): void {} 
  error(): void {}
}

export class ConsoleLogger implements Logger {
  debug(message: string, meta?: Record<string, unknown>) { console.debug(message, meta ?? ""); }
  info(message: string, meta?: Record<string, unknown>)  { console.info(message, meta ?? ""); }
  warn(message: string, meta?: Record<string, unknown>)  { console.warn(message, meta ?? ""); }
  error(message: string, meta?: Record<string, unknown>) { console.error(message, meta ?? ""); }
}

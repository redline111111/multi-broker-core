export type BrokerErrorCode =
  | 'NOT_CONNECTED'
  | 'CONNECTION'
  | 'CHANNEL'
  | 'PUBLISH'
  | 'CONSUME'
  | 'ACK'
  | 'NACK'
  | 'TIMEOUT'
  | 'VALIDATION'
  | 'CONFIG';

export interface ErrorContext {
  transport?: 'rabbitmq' | 'kafka' | 'nats' | string;
  operation?: 'connect' | 'createChannel' | 'publish' | 'consume' | 'ack' | 'nack';
  resource?: string; // queue/exchange/topic
  meta?: Record<string, unknown>;
}

export class BrokerError extends Error {
  public readonly code: BrokerErrorCode;
  public readonly retryable: boolean;
  public readonly transient: boolean;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: unknown;
  public readonly ctx?: ErrorContext;

  constructor(
    message: string,
    opts: {
      code: BrokerErrorCode;
      retryable?: boolean;
      transient?: boolean;
      details?: Record<string, unknown>;
      cause?: unknown;
      ctx?: ErrorContext;
    }
  ) {
    super(message);
    this.name = 'BrokerError';
    this.code = opts.code;
    this.retryable = Boolean(opts.retryable);
    this.transient = Boolean(opts.transient);
    this.details = opts.details;
    this.cause = opts.cause;
    this.ctx = opts.ctx;
  }
}

export class NotConnectedError extends BrokerError {
  constructor(ctx?: ErrorContext) {
    super('Broker is not connected', { code: 'NOT_CONNECTED', retryable: true, transient: true, ctx });
    this.name = 'NotConnectedError';
  }
}

export class ConnectionError extends BrokerError {
  constructor(message: string, cause?: unknown, ctx?: ErrorContext) {
    super(message, { code: 'CONNECTION', retryable: true, transient: true, cause, ctx });
    this.name = 'ConnectionError';
  }
}

export class ChannelError extends BrokerError {
  constructor(message: string, cause?: unknown, ctx?: ErrorContext) {
    super(message, { code: 'CHANNEL', retryable: true, transient: true, cause, ctx });
    this.name = 'ChannelError';
  }
}

export class PublishError extends BrokerError {
  constructor(message: string, cause?: unknown, ctx?: ErrorContext) {
    super(message, { code: 'PUBLISH', retryable: true, transient: true, cause, ctx });
    this.name = 'PublishError';
  }
}

export class ConsumeError extends BrokerError {
  constructor(message: string, cause?: unknown, ctx?: ErrorContext) {
    super(message, { code: 'CONSUME', retryable: true, transient: true, cause, ctx });
    this.name = 'ConsumeError';
  }
}

export class TimeoutError extends BrokerError {
  constructor(message = 'Operation timed out', ctx?: ErrorContext) {
    super(message, { code: 'TIMEOUT', retryable: true, transient: true, ctx });
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends BrokerError {
  constructor(message: string, details?: Record<string, unknown>, ctx?: ErrorContext) {
    super(message, { code: 'VALIDATION', retryable: false, transient: false, details, ctx });
    this.name = 'ValidationError';
  }
}

export class ConfigError extends BrokerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { code: 'CONFIG', retryable: false, transient: false, details });
    this.name = 'ConfigError';
  }
}
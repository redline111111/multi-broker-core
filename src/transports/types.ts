export type TransportName = 'rabbitmq' | 'kafka' | 'nats' | string;

export type TransportEvent =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'message';

export interface TransportErrorEvent {
  transport: TransportName;
  operation?: 'connect' | 'createChannel' | 'publish' | 'consume' | 'ack' | 'nack';
  resource?: string;
  error: unknown;
}

export interface TransportMessageEvent<TMsg = unknown> {
  transport: TransportName;
  resource: string;
  payload: TMsg;
  raw?: unknown;
}

export interface TransportEvents<TMsg = unknown> {
  connected: () => void;
  disconnected: () => void;
  error: (e: TransportErrorEvent) => void;
  message: (e: TransportMessageEvent<TMsg>) => void;
}

export interface TransportOptionsBase {
  transportName: TransportName;
}

export interface IBrokerTransport<TMsg = unknown> {
  readonly name: TransportName;

  connect(): Promise<void>;

  publish(target: { exchange?: string; routingKey?: string; topic?: string }, payload: Buffer, opts?: unknown): Promise<void>;

  consume(queueOrTopic: string, handler: (msg: TMsg) => Promise<void>, opts?: unknown): Promise<void>;

  ack?(raw: unknown): Promise<void>;
  nack?(raw: unknown, requeue?: boolean): Promise<void>;

  close(): Promise<void>;

  isConnected(): boolean;

  on<K extends keyof TransportEvents<TMsg>>(event: K, handler: TransportEvents<TMsg>[K]): void;
  off<K extends keyof TransportEvents<TMsg>>(event: K, handler: TransportEvents<TMsg>[K]): void;
}
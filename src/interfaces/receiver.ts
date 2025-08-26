import { MessageEnvelope } from "../models/message-envelope";
import { AckStatus } from "../models/ack-status";
import { SubscribeOptions } from "../models/subscribe-options";
import { SchemaValidator } from "./schema-validator";
import { SubscribeHandlerContext } from "../models/handler-context";
import { HandlerResult } from "../models/handler-result";

export type ReceiverHandler<T> = (
  message: MessageEnvelope<T>,
  ctx: SubscribeHandlerContext
) => Promise<HandlerResult>;

export interface ReceiverSubscription<T = unknown> {
  topic: string;
  handler: ReceiverHandler<T>;
  options?: SubscribeOptions<T>;
  validator?: SchemaValidator<MessageEnvelope<T>>;
}

export interface Receiver {
  addSubscription<T>(sub: ReceiverSubscription<T>): void;

  start(): Promise<void>;

  /**
   * Остановить приёмщик.
   * drain=true — дождаться завершения текущих обработок (или timeoutMs).
   * drain=false — отправить abort() всем активным обработкам и закрыть транспорт.
   */
  stop(opts?: { drain?: boolean; timeoutMs?: number }): Promise<void>;

  isRunning(): boolean;
  
  /** Сколько сообщений обрабатывается прямо сейчас. */
  inFlight(): number;
}

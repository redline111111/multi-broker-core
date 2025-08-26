import { MessageEnvelope } from "../models/message-envelope";
import { AckStatus } from "../models/ack-status";
import { PublishOptions } from "../models/publish-options";
import { HandlerResult } from "../models/handler-result";

export interface MessageTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  publish<T>(topic: string, message: MessageEnvelope<T>, options?: PublishOptions): Promise<void>;
  publishBatch?<T>(topic: string, messages: Array<MessageEnvelope<T>>, options?: PublishOptions): Promise<void>;

  subscribe<T>(
    topic: string,
    handler: (message: MessageEnvelope<T>) => Promise<HandlerResult>
  ): Promise<void>;

  subscribeBatch?<T>(
    topic: string,
    handler: (batch: Array<MessageEnvelope<T>>) => Promise<Array<HandlerResult>>,
    options?: { maxBatchSize?: number; maxWaitMs?: number }
  ): Promise<void>;

  setPrefetch?(topic: string, prefetch: number): Promise<void>;
  pause?(topic: string): Promise<void>;
  resume?(topic: string): Promise<void>;
  drain?(topic?: string): Promise<void>;
  isHealthy?(): Promise<boolean>;
  info?(): Promise<Record<string, unknown>>;
}
import { MessageTransport } from "../interfaces/message-transport";
import { MessageEnvelope } from "../models/message-envelope";
import { PublishOptions } from "../models/publish-options";
import { HandlerResult } from "../models/handler-result";
export declare class InMemoryTransport implements MessageTransport {
    private queues;
    private consumers;
    private paused;
    private connected;
    private timer?;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publish<T>(topic: string, message: MessageEnvelope<T>, options?: PublishOptions): Promise<void>;
    publishBatch<T>(topic: string, messages: Array<MessageEnvelope<T>>, options?: PublishOptions): Promise<void>;
    subscribe<T>(topic: string, handler: (message: MessageEnvelope<T>) => Promise<HandlerResult>): Promise<void>;
    setPrefetch(_topic: string, _prefetch: number): Promise<void>;
    pause(topic: string): Promise<void>;
    resume(topic: string): Promise<void>;
    drain(_topic?: string): Promise<void>;
    isHealthy(): Promise<boolean>;
    info(): Promise<Record<string, unknown>>;
    private ensureQueue;
    private ensurePump;
    private pumpOnce;
}

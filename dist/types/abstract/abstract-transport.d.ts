import { MessageTransport } from "../interfaces/message-transport";
import { MessageEnvelope } from "../models/message-envelope";
import { PublishOptions } from "../models/publish-options";
import { HandlerResult } from "../models/handler-result";
export declare abstract class AbstractTransport implements MessageTransport {
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract publish<T>(topic: string, message: MessageEnvelope<T>, options?: PublishOptions): Promise<void>;
    abstract subscribe<T>(topic: string, handler: (message: MessageEnvelope<T>) => Promise<HandlerResult>): Promise<void>;
    abstract subscribeBatch?<T>(topic: string, handler: (batch: Array<MessageEnvelope<T>>) => Promise<Array<HandlerResult>>, options?: {
        maxBatchSize?: number;
        maxWaitMs?: number;
    }): Promise<void>;
    protected wrapMessage<T>(payload: T, source: string, correlationId?: string): MessageEnvelope<T>;
}

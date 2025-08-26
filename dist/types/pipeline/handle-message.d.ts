import { MessageEnvelope } from "../models/message-envelope";
import { SubscribeOptions } from "../models/subscribe-options";
import { HandlerResult } from "../models/handler-result";
export declare function handleWithIdempotencyAndRetry<T>(envelope: MessageEnvelope<T>, handler: (m: MessageEnvelope<T>) => Promise<HandlerResult>, options?: SubscribeOptions<T>): Promise<HandlerResult>;

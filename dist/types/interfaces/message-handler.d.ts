import { MessageEnvelope } from "../models/message-envelope";
import { HandlerResult } from "../models/handler-result";
export interface MessageHandler<T = any> {
    handle(message: MessageEnvelope<T>): Promise<HandlerResult>;
}

import { MessageEnvelope } from "../models/message-envelope";
import { DeadLetterInfo } from "../models/dead-letter";
import { HandlerResult } from "../models/handler-result";
export declare function buildDeadLetterInfo<T>(originalTopic: string, envelope: MessageEnvelope<T>, reason: string, attempts: number): DeadLetterInfo;
export declare function deadLetterHeaders(info: DeadLetterInfo, result?: HandlerResult): Record<string, unknown>;

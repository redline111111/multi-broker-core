import { MessageEnvelope } from "../models/message-envelope";
import { DLQ_HEADER_KEYS } from "../constants/dlq";
import { DeadLetterInfo } from "../models/dead-letter";
import { HandlerResult } from "../models/handler-result";

export function buildDeadLetterInfo<T>(
  originalTopic: string,
  envelope: MessageEnvelope<T>,
  reason: string,
  attempts: number
): DeadLetterInfo {
  return {
    originalTopic,
    reason,
    attempts,
    timestamp: Date.now(),
    source: envelope.source,
    messageId: envelope.id,
    correlationId: envelope.correlationId,
  };
}

export function deadLetterHeaders(info: DeadLetterInfo, result?: HandlerResult): Record<string, unknown> {
 return {
    [DLQ_HEADER_KEYS.ORIGINAL_TOPIC]: info.originalTopic,
    [DLQ_HEADER_KEYS.REASON]: result?.dlqReason ?? info.reason,
    [DLQ_HEADER_KEYS.ATTEMPTS]: info.attempts,
    [DLQ_HEADER_KEYS.TIMESTAMP]: info.timestamp,
    [DLQ_HEADER_KEYS.SOURCE]: info.source,
    [DLQ_HEADER_KEYS.MESSAGE_ID]: info.messageId,
    [DLQ_HEADER_KEYS.CORRELATION_ID]: info.correlationId ?? null,
    [DLQ_HEADER_KEYS.ERROR_CODE]: result?.errorCode ?? null,
    [DLQ_HEADER_KEYS.ERROR_TYPE]: result?.errorType ?? null,
    [DLQ_HEADER_KEYS.ERROR_MESSAGE]: result?.errorMessage ?? null,

    ...(result?.headers ?? {}),
  };
}

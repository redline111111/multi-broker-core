import { RetryPolicy } from "../models/retry-policy";
import { ProcessStatus } from "../models/process-status";
import { HandlerResult } from "../models/handler-result";
import { RETRY_DEFAULTS } from "../constants/retry";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function withRetry(
  handler: () => Promise<HandlerResult>,
  policy?: RetryPolicy
): Promise<HandlerResult> {
  const maxAttempts = policy?.maxAttempts ?? RETRY_DEFAULTS.MAX_ATTEMPTS;
  const baseDelayMs = policy?.baseDelayMs ?? RETRY_DEFAULTS.BASE_DELAY_MS;
  const factor = policy?.factor ?? RETRY_DEFAULTS.FACTOR;
  const jitterMs = policy?.jitterMs ?? RETRY_DEFAULTS.JITTER_MS;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await handler();

      if (result.status === ProcessStatus.RETRY) {
        if (attempt === maxAttempts) {
          return {
            status: ProcessStatus.DLQ,
            errorCode: result.errorCode ?? "RETRY_EXHAUSTED",
            errorMessage: result.errorMessage ?? "Max attempts exhausted",
            errorType: result.errorType ?? "RetryExhausted",
            details: { ...result.details, attempt },
            dlqReason: result.dlqReason ?? "max_attempts_exceeded",
            headers: result.headers,
          };
        }
        const nextDelay = Math.floor(baseDelayMs * Math.pow(factor, attempt - 1) + Math.random() * jitterMs);
        policy?.onRetryAttempt?.({ attempt, error: new Error("Handler requested RETRY"), nextDelayMs: nextDelay });
        await sleep(nextDelay);
        continue;
      }

      return result;
    } catch (error: any) {
      if (attempt === maxAttempts) {
        return {
          status: ProcessStatus.DLQ,
          errorCode: "UNHANDLED_EXCEPTION",
          errorMessage: error?.message ?? "Unhandled exception in handler",
          errorType: error?.name ?? "Error",
          details: { attempt },
          dlqReason: "exception_max_attempts",
        };
      }
      const nextDelay = Math.floor(baseDelayMs * Math.pow(factor, attempt - 1) + Math.random() * jitterMs);
      policy?.onRetryAttempt?.({ attempt, error, nextDelayMs: nextDelay });
      await sleep(nextDelay);
    }
  }

  return { status: ProcessStatus.DLQ, errorCode: "UNREACHABLE_STATE" };
}

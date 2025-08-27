import { RetryPolicy } from "../models/retry-policy";
import { ProcessStatus } from "../models/process-status";
import { HandlerResult } from "../models/handler-result";
import { RETRY_DEFAULTS } from "../constants/retry";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));


function effective(policy?: RetryPolicy) {
  return {
    maxAttempts: policy?.maxAttempts ?? RETRY_DEFAULTS.MAX_ATTEMPTS,
    baseDelayMs: policy?.baseDelayMs ?? RETRY_DEFAULTS.BASE_DELAY_MS,
    factor: policy?.factor ?? RETRY_DEFAULTS.FACTOR,
    jitterMs: policy?.jitterMs ?? RETRY_DEFAULTS.JITTER_MS,
    maxDelayMs: policy?.maxDelayMs ?? RETRY_DEFAULTS.MAX_DELAY_MS,
    backoff: policy?.backoff ?? RETRY_DEFAULTS.BACKOFF,
    timeoutMs: policy?.timeoutMs ?? RETRY_DEFAULTS.TIMEOUT_MS,
    retryOn: policy?.retryOn,
    onRetryAttempt: policy?.onRetryAttempt,
  } as const;
}

export async function withRetry(
  handler: () => Promise<HandlerResult>,
  policy?: RetryPolicy
): Promise<HandlerResult> {
  const cfg = effective(policy);
  const started = Date.now();

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      const result = await handler();

      if (result.status === ProcessStatus.RETRY) {
        if (attempt === cfg.maxAttempts || (Date.now() - started) > cfg.timeoutMs) {
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
        const delay = nextDelay(attempt, cfg);
        cfg.onRetryAttempt?.({ attempt, error: new Error("Handler requested RETRY"), nextDelayMs: delay });
        await sleep(delay);
        continue;
      }

      return result;
    } catch (error: any) {
      if (
        attempt === cfg.maxAttempts ||
        (Date.now() - started) > cfg.timeoutMs ||
        (cfg.retryOn && !cfg.retryOn(error))
      ) {
        return {
          status: ProcessStatus.DLQ,
          errorCode: "UNHANDLED_EXCEPTION",
          errorMessage: error?.message ?? "Unhandled exception in handler",
          errorType: error?.name ?? "Error",
          details: { attempt },
          dlqReason: "exception_max_attempts",
        };
      }
      const delay = nextDelay(attempt, cfg);
      cfg.onRetryAttempt?.({ attempt, error, nextDelayMs: delay });
      await sleep(delay);
    }
  }

  return { status: ProcessStatus.DLQ, errorCode: "UNREACHABLE_STATE" };
}

function nextDelay(
  attempt: number,
  { baseDelayMs, factor, jitterMs, maxDelayMs, backoff }: Required<Pick<RetryPolicy,
    'baseDelayMs'|'factor'|'jitterMs'|'maxDelayMs'|'backoff'
  >>
) {
  const idx = attempt - 1;
  let base =
    backoff === 'fixed'
      ? baseDelayMs
      : backoff === 'exponential'
      ? baseDelayMs * Math.pow(factor, idx)
      : Math.round(
          baseDelayMs * Math.pow(factor, idx) * (0.5 + Math.random())
        );
  base += Math.random() * jitterMs;
  return Math.min(maxDelayMs, base);
}

export async function withRetryPromise<T>(
  fn: () => Promise<T>,
  policy?: RetryPolicy
): Promise<T> {
  const cfg = effective(policy);
  const started = Date.now();

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const timeExceeded = (Date.now() - started) > cfg.timeoutMs;
      const allowedByFilter = cfg.retryOn ? cfg.retryOn(error) : true;

      if (attempt === cfg.maxAttempts || timeExceeded || !allowedByFilter) {
        throw error;
      }

      const delay = nextDelay(attempt, cfg);
      cfg.onRetryAttempt?.({ attempt, error, nextDelayMs: delay });
      await sleep(delay);
    }
  }

  throw new Error('withRetryPromise: unreachable');
}
export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  factor: number;
  jitterMs: number;

  maxDelayMs?: number;
  backoff?: 'exponential' | 'fixed' | 'exponential-jitter';
  timeoutMs?: number;
  retryOn?: (error: unknown) => boolean;
  onRetryAttempt?: (info: { attempt: number; error: unknown; nextDelayMs: number }) => void;
}
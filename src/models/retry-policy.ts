export interface RetryPolicy {
  maxAttempts?: number;
  baseDelayMs?: number;
  factor?: number;
  jitterMs?: number;
  /**
   * Хуки для логирования/трассировки:
   * attempt — номер попытки, error — ошибка хендлера.
   */
  onRetryAttempt?: (info: { attempt: number; error: unknown; nextDelayMs: number }) => void;
}
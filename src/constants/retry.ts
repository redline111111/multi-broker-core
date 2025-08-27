export const RETRY_DEFAULTS = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 250,
  FACTOR: 2,
  JITTER_MS: 100,
  MAX_DELAY_MS: 5000,
  BACKOFF: 'exponential-jitter' as const,
  TIMEOUT_MS: 30000,
};
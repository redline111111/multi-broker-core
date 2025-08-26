export const RETRY_DEFAULTS = {
  MAX_ATTEMPTS: 3,     // включая первую попытку
  BASE_DELAY_MS: 200,  // базовая задержка
  FACTOR: 2,           // множитель экспоненты
  JITTER_MS: 100,      // добавочный джиттер [0..JITTER_MS]
} as const;
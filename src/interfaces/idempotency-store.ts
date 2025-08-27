export type IdemState = 'in_progress' | 'succeeded' | 'failed';

export interface IdemRecord {
  state: IdemState;
  updatedAt: number;
  meta?: Record<string, unknown>;
}

export interface IdempotencyStore {
  setInProgress(key: string, ttlMs: number): Promise<boolean>;
  setSucceeded(key: string, ttlMs: number, meta?: Record<string, unknown>): Promise<void>;
  setFailed(key: string, ttlMs: number, meta?: Record<string, unknown>): Promise<void>;
  get(key: string): Promise<IdemRecord | undefined>;
  del?(key: string): Promise<void>;
}

export interface IdempotencyOptions {
  inProgressTtlMs?: number;
  succeededTtlMs?: number;
  failedTtlMs?: number;
  headerKey?: string;
  fallbackToBodyHash?: boolean;
  keyExtractor?: (input: { headers?: Record<string, unknown>; payload?: Buffer }) => string | undefined;
}
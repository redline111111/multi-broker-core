import type { IdempotencyStore } from '../interfaces/idempotency-store';

export type ClaimOutcome = 'new' | 'duplicate' | 'in_progress';

export async function claim(
  store: IdempotencyStore,
  key: string,
  inProgressTtlMs: number
): Promise<ClaimOutcome> {
  const existing = await store.get(key);
  if (existing?.state === 'succeeded') return 'duplicate';
  if (existing?.state === 'in_progress') return 'in_progress';

  const ok = await store.setInProgress(key, inProgressTtlMs);
  return ok ? 'new' : 'in_progress';
}

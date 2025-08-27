import { createHash } from 'node:crypto';
import type { MessageEnvelope } from '../models/message-envelope';
import type { IdempotencyOptions } from '../interfaces/idempotency-store';

export function selectIdempotencyKey<T>(
  env: MessageEnvelope<T>,
  opts?: IdempotencyOptions
): string | undefined {
  if (env.idempotencyKey) return String(env.idempotencyKey);

  const headerKey = opts?.headerKey ?? 'x-idempotency-key';
  const hv = env.headers?.[headerKey];
  if (hv != null) return String(hv);

  const allowHash = opts?.fallbackToBodyHash ?? true;
  if (allowHash && Buffer.isBuffer(env.payload as any)) {
    const h = createHash('sha256').update(env.payload as any as Buffer).digest('hex');
    return `body:${h}`;
  }

  return undefined;
}

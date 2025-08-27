import type { MessageEnvelope } from '../models/message-envelope';

export interface IdemKeyInput {
  headers?: Record<string, unknown>;
  payload?: Buffer;
}

export function toIdemInput<T>(env: MessageEnvelope<T>): IdemKeyInput {
  const p = env.payload as unknown;
  return {
    headers: env.headers,
    payload: Buffer.isBuffer(p) ? (p as Buffer) : undefined,
  };
}
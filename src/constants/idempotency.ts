export const IDEMPOTENCY_DUPLICATE_BEHAVIOR = {
  ACK: "ack",
  NACK: "nack",
  IGNORE: "ignore",
} as const;

export type IdempotencyDuplicateBehavior =
  (typeof IDEMPOTENCY_DUPLICATE_BEHAVIOR)[keyof typeof IDEMPOTENCY_DUPLICATE_BEHAVIOR];
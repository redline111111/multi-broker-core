export declare const IDEMPOTENCY_DUPLICATE_BEHAVIOR: {
    readonly ACK: "ack";
    readonly NACK: "nack";
    readonly IGNORE: "ignore";
};
export type IdempotencyDuplicateBehavior = (typeof IDEMPOTENCY_DUPLICATE_BEHAVIOR)[keyof typeof IDEMPOTENCY_DUPLICATE_BEHAVIOR];

export declare class Semaphore {
    private readonly max;
    private queue;
    private inUse;
    constructor(max: number);
    acquire(): Promise<void>;
    release(): void;
}
export declare class NoopSemaphore {
    acquire(): Promise<void>;
    release(): void;
}

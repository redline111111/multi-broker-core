export interface IdempotencyStore {
    /**
     * true — можно обрабатывать, false — уже в обработке/обработано.
     * ttlMs — (опц.) предотвратить вечную блокировку при крэше воркера.
     */
    claim(key: string, ttlMs?: number): Promise<boolean>;
    markProcessed(key: string): Promise<void>;
    markFailed?(key: string): Promise<void>;
}

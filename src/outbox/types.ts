export interface OutboxRecord {
  id: string;
  exchange: string;
  routingKey: string;
  payload: Buffer;
  headers?: Record<string, unknown>;
  attempts: number;
  nextAttemptAt: number; // unix ms
  createdAt: number;     // unix ms
  updatedAt: number;     // unix ms
}

export interface OutboxStore {
  /** Добавить записи (желательно в транзакции вместе с бизнес-операцией). */
  enqueue(records: OutboxRecord[]): Promise<void>;

  /** Взять партию, готовую к отправке (nextAttemptAt <= now). */
  fetchReadyBatch(limit: number): Promise<OutboxRecord[]>;

  /** Пометить отправленной (успешно подтверждённой брокером). */
  markSent(id: string): Promise<void>;

  /** Перепланировать с бэкоффом. */
  reschedule(id: string, nextAttemptAt: number, attempts: number): Promise<void>;

  /** Зафиксировать фатальный фейл. */
  markFailed(id: string, reason?: string): Promise<void>;
}

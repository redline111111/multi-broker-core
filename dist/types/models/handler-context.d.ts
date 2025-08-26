export interface SubscribeHandlerContext {
    /** Сигнал мягкой отмены. Если Receiver останавливается без drain — будет вызван abort(). */
    abortSignal: AbortSignal;
    topic: string;
    startedAt: number;
}

import { ProcessStatus } from "./process-status";
export interface HandlerResult {
    status: ProcessStatus;
    /** Короткий машинно-читаемый код ошибки/причины (например, VALIDATION_FAILED). */
    errorCode?: string;
    errorMessage?: string;
    /** Тип/класс ошибки (например, TimeoutError, ExternalServiceError). */
    errorType?: string;
    details?: Record<string, unknown>;
    /** Явная причина для DLQ, если нужно переопределить. */
    dlqReason?: string;
    /** Дополнительные заголовки, которые транспорт может приложить к DLQ/репаблишу. */
    headers?: Record<string, string>;
}

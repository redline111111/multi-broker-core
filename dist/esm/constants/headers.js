export const HEADER_KEYS = {
    CONTENT_TYPE: "content-type", // общий content-type полезной нагрузки
    SCHEMA_ID: "x-schema-id", // идентификатор схемы из Registry
    SCHEMA_SUBJECT: "x-schema-subject", // имя/subject в Registry (если используется)
    SCHEMA_VERSION: "x-schema-version", // версия схемы (если доступна)
    TRACE_ID: "x-trace-id", // пример сквозного трейс-заголовка
};

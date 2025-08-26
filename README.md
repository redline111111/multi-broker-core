# 📨 multi-broker-core

Универсальное ядро для обмена сообщениями в Node.js / Nest.js.  
Предоставляет единый контракт для работы с различными брокерами: RabbitMQ, Kafka, Redis Streams, HTTP callbacks.  
Подходит для продакшн-сервисов и для тестовых окружений (через in-memory transport).

---

## 🚀 Установка
```bash
npm install multi-broker-core
```

## ✨ Возможности

- **Единый интерфейс** `MessageTransport` для всех брокеров.
- **Стандартизированная обёртка** `MessageEnvelope` с метаданными:
  - `id`
  - `timestamp`
  - `correlationId`
  - `source`
  - `idempotencyKey`
  - `headers`
- **Управление подтверждениями**: `ack`, `nack`, `retry`, `dlq`.
- **Политики повторных попыток**: экспоненциальная задержка, максимальное число попыток.
- **Отложенная доставка сообщений** (`delay API`).
- **Идемпотентность** с ключом и хранилищем.
- **Наблюдаемость**: логирование, трассировка (OpenTelemetry), метрики.
- **Производительность**:
  - batch-публикация,
  - prefetch,
  - backpressure.
- **HealthCheck API** для проверки состояния транспорта.
- **Расширенные опции публикации**:
  - `routingKey`
  - `partitionKey`
  - `ttl`
  - `priority`
  - `headers`
  - `contentType`

---

## 🔍 Наблюдаемость

- **Логирование**: публикация, потребление, ошибки, `correlationId`.
- **Трассировка**: обёртка `publish/consume` в OpenTelemetry spans.
- **Метрики**: `ack` / `nack` / `retry` / `dlq`, latency обработчиков.
- Возможность **включать и выключать** логи, трейсинг и метрики через опции.

---

## 🧩 Сериализация и схемы

- **Формат по умолчанию**: JSON.  
- **Дополнительные плагины**: Avro, Protobuf.  
- **Валидация схем**: через адаптеры (например, Zod или TypeBox).  
- **Интеграция с Schema Registry**:
  - регистрация и проверка схем,
  - стандартные заголовки: `content-type`, `x-schema-id`, `x-schema-version`.  
- **Преимущества**:
  - компактные бинарные форматы,
  - строгая эволюция контрактов,
  - межъязыковая совместимость.

---

## ⚡ Производительность

- **Batch-публикация** (оптимизация для Kafka, fallback в core).
- **Backpressure**: ограничение параллельной обработки.
- **Prefetch и flow-control**: поддержка на уровне транспорта.
- Возможность **паузы и возобновления** подписок.

---

## 🛠️ Error Handling

- **ErrorClassifier** для гибкой классификации ошибок.  
- **HandlerResult** содержит:  
  - `status`  
  - `errorCode`  
  - `errorMessage`  
  - `errorType`  
  - `details`  
  - `dlqReason`  
  - `headers`  
- Подходит для бизнес-ошибок:  
  - `4xx → nack/ack`  
  - `5xx/timeout → retry`.  
- DLQ и наблюдаемость используют эти поля для понятной диагностики.

---

## ❤️ HealthCheck API

- Метод `MessagingService.healthCheck()` возвращает статус:  
  - `healthy`  
  - `degraded`  
  - `unhealthy`  
- Транспорты реализуют:
  - **`isHealthy()`** — индикатор готовности (соединение, лаг, буферы).  
  - **`info()`** — детали (версия брокера, задержка в партициях, очередь, узел).  

---

## 🛣️ Roadmap

- **NestJS-модуль**: конфигурация через `forRoot`, interceptors, health checks.  
- **Дополнительные транспорты**: RabbitMQ, Kafka, Redis, HTTP.

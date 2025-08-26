"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messaging_service_1 = require("../messaging.service");
const inmemory_transport_1 = require("../transports/inmemory-transport");
const process_status_1 = require("../models/process-status");
const content_type_1 = require("../models/content-type");
const console_logger_1 = require("../observability/console-logger");
const console_metrics_1 = require("../observability/console-metrics");
const console_tracer_ts_1 = require("../observability/console-tracer.ts");
async function main() {
    const transport = new inmemory_transport_1.InMemoryTransport();
    const svc = new messaging_service_1.MessagingService(() => transport, { maxAttempts: 2, baseDelayMs: 100 }, {
        transportName: "in-memory",
        logger: new console_logger_1.ConsoleLogger(),
        tracer: new console_tracer_ts_1.ConsoleTracer(),
        metrics: new console_metrics_1.ConsoleMetrics(),
        features: {
            logging: true,
            tracing: true,
            metrics: true,
        },
    });
    await svc.start();
    await svc.subscribe("test-topic", async (msg) => {
        console.log("📩 received:", msg.payload, "headers:", msg.headers);
        if (msg.payload.hello === "fail") {
            return {
                status: process_status_1.ProcessStatus.RETRY,
                errorCode: "DEMO_FAIL",
                errorMessage: "искусственная ошибка",
                errorType: "DemoError",
                details: { attempt: "ask_core_to_retry" },
            };
        }
        return { status: process_status_1.ProcessStatus.ACK };
    });
    await svc.publish("test-topic", { hello: "world" }, "demo-service", "corr-1", {
        headers: { "x-trace-id": "trace-123" },
        contentType: content_type_1.ContentType.JSON,
        priority: 5,
        ttlMs: 30_000,
    });
    await svc.publish("test-topic", { hello: "fail" }, "demo-service", "corr-2", { contentType: content_type_1.ContentType.JSON });
    const health = await svc.healthCheck();
    console.log("❤️ health:", health);
    setTimeout(async () => {
        await svc.stop();
        console.log("🛑 stopped");
        process.exit(0);
    }, 1500);
}
main().catch(err => {
    console.error("demo error:", err);
    process.exit(1);
});

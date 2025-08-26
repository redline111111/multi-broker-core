import { MessagingService } from "../messaging.service";
import { InMemoryTransport } from "../transports/inmemory-transport";
import { HandlerResult } from "../models/handler-result";
import { ProcessStatus } from "../models/process-status";
import { ContentType } from "../models/content-type";
import { ConsoleLogger } from "../observability/console-logger";
import { ConsoleMetrics } from "../observability/console-metrics";
import { ConsoleTracer } from "../observability/console-tracer.ts";

async function main() {
  const transport = new InMemoryTransport();

  const svc = new MessagingService(
    () => transport,
    { maxAttempts: 2, baseDelayMs: 100 },
    {
      transportName: "in-memory",
      logger: new ConsoleLogger(),
      tracer: new ConsoleTracer(),
      metrics: new ConsoleMetrics(),
      features: {
        logging: true,
        tracing: true,
        metrics: true,
      },
    }
  );

  await svc.start();

  await svc.subscribe<{ hello: string }>(
    "test-topic",
    async (msg): Promise<HandlerResult> => {
      console.log("📩 received:", msg.payload, "headers:", msg.headers);

      if (msg.payload.hello === "fail") {
        return {
          status: ProcessStatus.RETRY,
          errorCode: "DEMO_FAIL",
          errorMessage: "искусственная ошибка",
          errorType: "DemoError",
          details: { attempt: "ask_core_to_retry" },
        };
      }

      return { status: ProcessStatus.ACK };
    }
  );

  await svc.publish(
    "test-topic",
    { hello: "world" },
    "demo-service",
    "corr-1",
    {
      headers: { "x-trace-id": "trace-123" },
      contentType: ContentType.JSON,
      priority: 5,
      ttlMs: 30_000,
    }
  );

  await svc.publish(
    "test-topic",
    { hello: "fail" },
    "demo-service",
    "corr-2",
    { contentType: ContentType.JSON }
  );

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

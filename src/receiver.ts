import { MessagingService } from "./messaging.service";
import { MessageEnvelope } from "./models/message-envelope";
import { Receiver, ReceiverSubscription } from "./interfaces/receiver";
import { SubscribeHandlerContext } from "./models/handler-context";

export class DefaultReceiver implements Receiver {
  private readonly subs: ReceiverSubscription<any>[] = [];
  private running = false;
  private inFlightCount = 0;
  private readonly inflightControllers = new Set<AbortController>();

  constructor(private readonly svc: MessagingService) {}

  addSubscription<T>(sub: ReceiverSubscription<T>): void {
    this.subs.push(sub);
    if (this.running) {
      this.attach(sub);
    }
  }

  async start(): Promise<void> {
    if (this.running) return;
    await this.svc.start();
    await Promise.all(this.subs.map((s) => this.attach(s)));
    this.running = true;
  }

  async stop(opts?: { drain?: boolean; timeoutMs?: number }): Promise<void> {
    if (!this.running) return;
    const drain = opts?.drain ?? true;
    const timeoutMs = opts?.timeoutMs ?? 30_000;

    if (drain) {
      const deadline = Date.now() + timeoutMs;
      while (this.inFlightCount > 0 && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50));
      }
      await this.svc.stop();
    } else {
      for (const c of this.inflightControllers) c.abort();
      await this.svc.stop();
    }

    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  inFlight(): number {
    return this.inFlightCount;
  }

  private async attach<T>(sub: ReceiverSubscription<T>): Promise<void> {
    await this.svc.subscribe<T>(
      sub.topic,
      async (msg: MessageEnvelope<T>) => {
        const controller = new AbortController();
        const ctx: SubscribeHandlerContext = {
          abortSignal: controller.signal,
          topic: sub.topic,
          startedAt: Date.now(),
        };

        this.inflightControllers.add(controller);
        this.inFlightCount++;

        try {
          return await sub.handler(msg, ctx);
        } finally {
          this.inFlightCount--;
          this.inflightControllers.delete(controller);
        }
      },
      sub.options,
      sub.validator
    );
  }
}

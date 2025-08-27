import { MessagingService } from "./messaging.service";
import { MessageEnvelope } from "./models/message-envelope";
import { Receiver, ReceiverSubscription } from "./interfaces/receiver";
import { SubscribeHandlerContext } from "./models/handler-context";
import { HandlerResult } from "./models/handler-result";

export type ReceiverEvent =
  | { type: "started" }
  | { type: "stopped"; drained: boolean }
  | { type: "attached"; topic: string }
  | { type: "message:start"; topic: string; startedAt: number }
  | { type: "message:done"; topic: string; startedAt: number; durationMs: number }
  | { type: "message:timeout"; topic: string; timeoutMs: number }
  | { type: "message:error"; topic: string; error: unknown };

export type ReceiverLogger = {
  info?: (msg: string, extra?: Record<string, unknown>) => void;
  warn?: (msg: string, extra?: Record<string, unknown>) => void;
  error?: (msg: string, extra?: Record<string, unknown>) => void;
  debug?: (msg: string, extra?: Record<string, unknown>) => void;
};

export type ReceiverOptions = {
  maxInFlight?: number;
  defaultTimeoutMs?: number;
  logger?: ReceiverLogger;
  onEvent?: (evt: ReceiverEvent) => void;
};

export class DefaultReceiver implements Receiver {
  private readonly subs: ReceiverSubscription<any>[] = [];
  private running = false;
  private inFlightCount = 0;
  private readonly inflightControllers = new Set<AbortController>();

  private readonly maxInFlight?: number;
  private readonly defaultTimeoutMs?: number;
  private readonly log: ReceiverLogger;
  private readonly onEvent?: ReceiverOptions["onEvent"];

  constructor(private readonly svc: MessagingService, opts?: ReceiverOptions) {
    this.maxInFlight = opts?.maxInFlight;
    this.defaultTimeoutMs = opts?.defaultTimeoutMs;
    this.log = opts?.logger ?? {};
    this.onEvent = opts?.onEvent;
  }

  addSubscription<T>(sub: ReceiverSubscription<T>): void {
    this.subs.push(sub);
    if (this.running) {
      void this.attach(sub);
    }
  }

  async start(): Promise<void> {
    if (this.running) return;
    await this.svc.start();
    await Promise.all(this.subs.map((s) => this.attach(s)));
    this.running = true;
    this.emit({ type: "started" });
  }

  async stop(opts?: { drain?: boolean; timeoutMs?: number }): Promise<void> {
    if (!this.running) return;
    const drain = opts?.drain ?? true;
    const timeoutMs = opts?.timeoutMs ?? 30_000;

    let drained = true;
    if (drain) {
      const deadline = Date.now() + timeoutMs;
      while (this.inFlightCount > 0 && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (this.inFlightCount > 0) {
        for (const c of this.inflightControllers) c.abort();
        drained = false;
      }
    } else {
      for (const c of this.inflightControllers) c.abort();
      drained = false;
    }

    await this.svc.stop();
    this.running = false;
    this.emit({ type: "stopped", drained });
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
      async (msg: MessageEnvelope<T>): Promise<HandlerResult> => {
        if (this.maxInFlight !== undefined && this.inFlightCount >= this.maxInFlight) {
          await this.waitSlot();
        }

        const controller = new AbortController();
        const startedAt = Date.now();
        const ctx: SubscribeHandlerContext = {
          abortSignal: controller.signal,
          topic: sub.topic,
          startedAt,
        };

        this.inflightControllers.add(controller);
        this.inFlightCount++;
        this.emit({ type: "message:start", topic: sub.topic, startedAt });

        let timeoutTimer: NodeJS.Timeout | undefined;
        try {
          const p = sub.handler(msg, ctx);
          const result =
            this.defaultTimeoutMs && this.defaultTimeoutMs > 0
              ? await Promise.race([
                  p,
                  new Promise<never>((_, rej) => {
                    timeoutTimer = setTimeout(() => {
                      controller.abort();
                      this.emit({
                        type: "message:timeout",
                        topic: sub.topic,
                        timeoutMs: this.defaultTimeoutMs as number,
                      });
                      rej(new Error(`handler timeout after ${this.defaultTimeoutMs}ms`));
                    }, this.defaultTimeoutMs);
                  }),
                ])
              : await p;

          const durationMs = Date.now() - startedAt;
          this.emit({ type: "message:done", topic: sub.topic, startedAt, durationMs });
          return result;
        } catch (err) {
          this.emit({ type: "message:error", topic: sub.topic, error: err });
          this.log.error?.("handler error", { topic: sub.topic, error: serializeError(err) });
          throw err;
        } finally {
          if (timeoutTimer) clearTimeout(timeoutTimer);
          this.inFlightCount--;
          this.inflightControllers.delete(controller);
        }
      },
      sub.options,
      sub.validator
    );
    this.emit({ type: "attached", topic: sub.topic });
  }

  private waitSlot(): Promise<void> {
    if (this.maxInFlight === undefined) return Promise.resolve();
    if (this.inFlightCount < this.maxInFlight) return Promise.resolve();
    return new Promise((resolve) => {
      const check = () => {
        if (this.inFlightCount < (this.maxInFlight as number)) {
          resolve();
        } else {
          setTimeout(check, 5);
        }
      };
      setTimeout(check, 0);
    });
  }

  private emit(evt: ReceiverEvent) {
    try {
      this.onEvent?.(evt);
      switch (evt.type) {
        case "started":
          this.log.info?.("receiver started");
          break;
        case "stopped":
          this.log.info?.("receiver stopped", { drained: evt.drained });
          break;
        case "attached":
          this.log.debug?.("attached", { topic: evt.topic });
          break;
        case "message:start":
          this.log.debug?.("msg start", { topic: evt.topic });
          break;
        case "message:done":
          this.log.debug?.("msg done", { topic: evt.topic, durationMs: evt.durationMs });
          break;
        case "message:timeout":
          this.log.warn?.("msg timeout", { topic: evt.topic, timeoutMs: evt.timeoutMs });
          break;
        case "message:error":
          this.log.error?.("msg error", { topic: evt.topic, error: serializeError(evt.error) });
          break;
      }
    } catch {}
  }
}

function serializeError(err: unknown) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  try {
    return JSON.parse(JSON.stringify(err));
  } catch {
    return { value: String(err) };
  }
}

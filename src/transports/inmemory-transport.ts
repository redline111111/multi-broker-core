import { MessageTransport } from "../interfaces/message-transport";
import { MessageEnvelope } from "../models/message-envelope";
import { PublishOptions } from "../models/publish-options";
import { HandlerResult } from "../models/handler-result";
import { ProcessStatus } from "../models/process-status";
import { HEADER_KEYS } from "../constants/headers";

type AnyHandler = (msg: any) => Promise<HandlerResult>;

interface QueueItem<T> {
  envelope: MessageEnvelope<T>;
  deliverAt: number;
  expiresAt?: number;
  priority?: number;
}

export class InMemoryTransport implements MessageTransport {
  private queues = new Map<string, Array<QueueItem<any>>>();
  private consumers = new Map<string, AnyHandler>();
  private paused = new Set<string>();
  private connected = false;
  private timer?: NodeJS.Timeout;

  async connect(): Promise<void> {
    if (this.connected) return;
    this.connected = true;
    this.ensurePump();
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  async publish<T>(topic: string, message: MessageEnvelope<T>, options?: PublishOptions): Promise<void> {
    const q = this.ensureQueue<T>(topic);
    const now = Date.now();

    const deliverAt = now + (options?.delayMs ?? 0);
    const expiresAt = options?.expiresAtMs ?? (options?.ttlMs ? now + options.ttlMs : undefined);

    message.headers = {
      ...(message.headers ?? {}),
      ...(options?.headers ?? {}),
      [HEADER_KEYS.CONTENT_TYPE]: options?.contentType ?? "application/json",
    };

    q.push({
      envelope: message,
      deliverAt,
      expiresAt,
      priority: options?.priority,
    });

    q.sort((a, b) => {
      const pa = a.priority ?? 0;
      const pb = b.priority ?? 0;
      if (pa !== pb) return pb - pa;
      return a.deliverAt - b.deliverAt;
    });
  }

  async publishBatch<T>(topic: string, messages: Array<MessageEnvelope<T>>, options?: PublishOptions): Promise<void> {
    for (const m of messages) {
      await this.publish(topic, m, options);
    }
  }

  async subscribe<T>(topic: string, handler: (message: MessageEnvelope<T>) => Promise<HandlerResult>): Promise<void> {
    this.consumers.set(topic, handler as AnyHandler);
    this.ensureQueue<T>(topic);
  }

  async setPrefetch(_topic: string, _prefetch: number): Promise<void> { }

  async pause(topic: string): Promise<void> {
    this.paused.add(topic);
  }

  async resume(topic: string): Promise<void> {
    this.paused.delete(topic);
  }

  async drain(_topic?: string): Promise<void> {
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      const hasItems = Array.from(this.queues.values()).some(q => q.length > 0);
      if (!hasItems) return;
      await new Promise(r => setTimeout(r, 20));
    }
  }

  async isHealthy(): Promise<boolean> {
    return this.connected;
  }

  async info(): Promise<Record<string, unknown>> {
    const topics = Array.from(this.queues.keys());
    const sizes = Object.fromEntries(topics.map(t => [t, this.queues.get(t)?.length ?? 0]));
    return { topics, sizes, connected: this.connected };
  }

  private ensureQueue<T>(topic: string): Array<QueueItem<T>> {
    if (!this.queues.has(topic)) this.queues.set(topic, []);
    return this.queues.get(topic)! as Array<QueueItem<T>>;
  }

  private ensurePump() {
    if (this.timer) return;
    this.timer = setInterval(() => this.pumpOnce(), 10);
  }

  private async pumpOnce() {
    if (!this.connected) return;

    const now = Date.now();

    for (const [topic, q] of this.queues) {
      if (this.paused.has(topic)) continue;

      const handler = this.consumers.get(topic);
      if (!handler) continue;
      if (q.length === 0) continue;

      const idx = q.findIndex(item => item.deliverAt <= now);
      if (idx === -1) continue;

      const item = q.splice(idx, 1)[0];

      if (item.expiresAt && item.expiresAt <= now) {
        continue;
      }

      try {
        const res = await handler(item.envelope);

        if (res.status === ProcessStatus.RETRY) {
          const backoff = 100;
          item.deliverAt = Date.now() + backoff;
          q.push(item);
          q.sort((a, b) => {
            const pa = a.priority ?? 0, pb = b.priority ?? 0;
            if (pa !== pb) return pb - pa;
            return a.deliverAt - b.deliverAt;
          });
        }
      } catch { }
    }
  }
}

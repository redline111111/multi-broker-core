"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryTransport = void 0;
const process_status_1 = require("../models/process-status");
const headers_1 = require("../constants/headers");
class InMemoryTransport {
    queues = new Map();
    consumers = new Map();
    paused = new Set();
    connected = false;
    timer;
    async connect() {
        if (this.connected)
            return;
        this.connected = true;
        this.ensurePump();
    }
    async disconnect() {
        this.connected = false;
        if (this.timer)
            clearInterval(this.timer);
        this.timer = undefined;
    }
    async publish(topic, message, options) {
        const q = this.ensureQueue(topic);
        const now = Date.now();
        const deliverAt = now + (options?.delayMs ?? 0);
        const expiresAt = options?.expiresAtMs ?? (options?.ttlMs ? now + options.ttlMs : undefined);
        message.headers = {
            ...(message.headers ?? {}),
            ...(options?.headers ?? {}),
            [headers_1.HEADER_KEYS.CONTENT_TYPE]: options?.contentType ?? "application/json",
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
            if (pa !== pb)
                return pb - pa;
            return a.deliverAt - b.deliverAt;
        });
    }
    async publishBatch(topic, messages, options) {
        for (const m of messages) {
            await this.publish(topic, m, options);
        }
    }
    async subscribe(topic, handler) {
        this.consumers.set(topic, handler);
        this.ensureQueue(topic);
    }
    async setPrefetch(_topic, _prefetch) { }
    async pause(topic) {
        this.paused.add(topic);
    }
    async resume(topic) {
        this.paused.delete(topic);
    }
    async drain(_topic) {
        const deadline = Date.now() + 2000;
        while (Date.now() < deadline) {
            const hasItems = Array.from(this.queues.values()).some(q => q.length > 0);
            if (!hasItems)
                return;
            await new Promise(r => setTimeout(r, 20));
        }
    }
    async isHealthy() {
        return this.connected;
    }
    async info() {
        const topics = Array.from(this.queues.keys());
        const sizes = Object.fromEntries(topics.map(t => [t, this.queues.get(t)?.length ?? 0]));
        return { topics, sizes, connected: this.connected };
    }
    ensureQueue(topic) {
        if (!this.queues.has(topic))
            this.queues.set(topic, []);
        return this.queues.get(topic);
    }
    ensurePump() {
        if (this.timer)
            return;
        this.timer = setInterval(() => this.pumpOnce(), 10);
    }
    async pumpOnce() {
        if (!this.connected)
            return;
        const now = Date.now();
        for (const [topic, q] of this.queues) {
            if (this.paused.has(topic))
                continue;
            const handler = this.consumers.get(topic);
            if (!handler)
                continue;
            if (q.length === 0)
                continue;
            const idx = q.findIndex(item => item.deliverAt <= now);
            if (idx === -1)
                continue;
            const item = q.splice(idx, 1)[0];
            if (item.expiresAt && item.expiresAt <= now) {
                continue;
            }
            try {
                const res = await handler(item.envelope);
                if (res.status === process_status_1.ProcessStatus.RETRY) {
                    const backoff = 100;
                    item.deliverAt = Date.now() + backoff;
                    q.push(item);
                    q.sort((a, b) => {
                        const pa = a.priority ?? 0, pb = b.priority ?? 0;
                        if (pa !== pb)
                            return pb - pa;
                        return a.deliverAt - b.deliverAt;
                    });
                }
            }
            catch { }
        }
    }
}
exports.InMemoryTransport = InMemoryTransport;

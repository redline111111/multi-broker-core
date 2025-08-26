export class DefaultReceiver {
    svc;
    subs = [];
    running = false;
    inFlightCount = 0;
    inflightControllers = new Set();
    constructor(svc) {
        this.svc = svc;
    }
    addSubscription(sub) {
        this.subs.push(sub);
        if (this.running) {
            this.attach(sub);
        }
    }
    async start() {
        if (this.running)
            return;
        await this.svc.start();
        await Promise.all(this.subs.map((s) => this.attach(s)));
        this.running = true;
    }
    async stop(opts) {
        if (!this.running)
            return;
        const drain = opts?.drain ?? true;
        const timeoutMs = opts?.timeoutMs ?? 30_000;
        if (drain) {
            const deadline = Date.now() + timeoutMs;
            while (this.inFlightCount > 0 && Date.now() < deadline) {
                await new Promise((r) => setTimeout(r, 50));
            }
            await this.svc.stop();
        }
        else {
            for (const c of this.inflightControllers)
                c.abort();
            await this.svc.stop();
        }
        this.running = false;
    }
    isRunning() {
        return this.running;
    }
    inFlight() {
        return this.inFlightCount;
    }
    async attach(sub) {
        await this.svc.subscribe(sub.topic, async (msg) => {
            const controller = new AbortController();
            const ctx = {
                abortSignal: controller.signal,
                topic: sub.topic,
                startedAt: Date.now(),
            };
            this.inflightControllers.add(controller);
            this.inFlightCount++;
            try {
                return await sub.handler(msg, ctx);
            }
            finally {
                this.inFlightCount--;
                this.inflightControllers.delete(controller);
            }
        }, sub.options, sub.validator);
    }
}

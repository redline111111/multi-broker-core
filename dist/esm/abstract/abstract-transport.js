import { randomUUID } from "node:crypto";
export class AbstractTransport {
    wrapMessage(payload, source, correlationId) {
        return {
            id: randomUUID(),
            timestamp: Date.now(),
            correlationId,
            source,
            payload,
        };
    }
}

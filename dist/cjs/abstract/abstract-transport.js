"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractTransport = void 0;
const node_crypto_1 = require("node:crypto");
class AbstractTransport {
    wrapMessage(payload, source, correlationId) {
        return {
            id: (0, node_crypto_1.randomUUID)(),
            timestamp: Date.now(),
            correlationId,
            source,
            payload,
        };
    }
}
exports.AbstractTransport = AbstractTransport;

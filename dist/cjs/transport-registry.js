"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportRegistry = void 0;
class TransportRegistry {
    map = new Map();
    register(key, factory) {
        this.map.set(key, factory);
    }
    getFactory(key) {
        return this.map.get(key);
    }
}
exports.TransportRegistry = TransportRegistry;

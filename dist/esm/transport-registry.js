export class TransportRegistry {
    map = new Map();
    register(key, factory) {
        this.map.set(key, factory);
    }
    getFactory(key) {
        return this.map.get(key);
    }
}

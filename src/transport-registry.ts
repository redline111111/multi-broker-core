import { MessageTransport } from "./interfaces/message-transport";

export type TransportFactory = () =>
  | Promise<MessageTransport>
  | MessageTransport;

export class TransportRegistry {
  private readonly map = new Map<string, TransportFactory>();

  register(key: string, factory: TransportFactory) {
    this.map.set(key, factory);
  }

  getFactory(key: string): TransportFactory | undefined {
    return this.map.get(key);
  }
}

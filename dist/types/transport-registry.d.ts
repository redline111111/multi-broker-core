import { MessageTransport } from "./interfaces/message-transport";
export type TransportFactory = () => Promise<MessageTransport> | MessageTransport;
export declare class TransportRegistry {
    private readonly map;
    register(key: string, factory: TransportFactory): void;
    getFactory(key: string): TransportFactory | undefined;
}

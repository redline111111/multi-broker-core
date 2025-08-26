import { TransportKey } from "./constants/transports";
import { TransportFactory } from "./transport-registry";
export interface DynamicFactoryOptions {
    options?: unknown;
    overrides?: {
        packageName?: string;
        exportName?: string;
    };
}
export declare function dynamicFactoryByKey(key: TransportKey, cfg?: DynamicFactoryOptions): TransportFactory;

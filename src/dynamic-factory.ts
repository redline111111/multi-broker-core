import {
  DEFAULT_TRANSPORT_EXPORT_BY_KEY,
  DEFAULT_TRANSPORT_PACKAGE_BY_KEY,
  TransportKey,
} from "./constants/transports";
import { ERROR_MESSAGES } from "./constants/errors";
import { MessageTransport } from "./interfaces/message-transport";
import { TransportFactory } from "./transport-registry";

export interface DynamicFactoryOptions {
  options?: unknown;
  overrides?: {
    packageName?: string;
    exportName?: string;
  };
}

export function dynamicFactoryByKey(
  key: TransportKey,
  cfg: DynamicFactoryOptions = {},
): TransportFactory {
  const pkg =
    cfg.overrides?.packageName ?? DEFAULT_TRANSPORT_PACKAGE_BY_KEY[key];
  const exportName =
    cfg.overrides?.exportName ?? DEFAULT_TRANSPORT_EXPORT_BY_KEY[key];

  return async () => {
    let mod: any;
    try {
      mod = await import(pkg);
    } catch {
      throw new Error(ERROR_MESSAGES.DYNAMIC_IMPORT_FAIL(pkg));
    }

    const TransportCtor = mod?.[exportName];
    if (!TransportCtor) {
      throw new Error(ERROR_MESSAGES.DYNAMIC_EXPORT_MISSING(pkg, exportName));
    }

    const transport: MessageTransport = new TransportCtor(cfg.options);
    return transport;
  };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicFactoryByKey = dynamicFactoryByKey;
const transports_1 = require("./constants/transports");
const errors_1 = require("./constants/errors");
function dynamicFactoryByKey(key, cfg = {}) {
    const pkg = cfg.overrides?.packageName ?? transports_1.DEFAULT_TRANSPORT_PACKAGE_BY_KEY[key];
    const exportName = cfg.overrides?.exportName ?? transports_1.DEFAULT_TRANSPORT_EXPORT_BY_KEY[key];
    return async () => {
        let mod;
        try {
            mod = await Promise.resolve(`${pkg}`).then(s => require(s));
        }
        catch {
            throw new Error(errors_1.ERROR_MESSAGES.DYNAMIC_IMPORT_FAIL(pkg));
        }
        const TransportCtor = mod?.[exportName];
        if (!TransportCtor) {
            throw new Error(errors_1.ERROR_MESSAGES.DYNAMIC_EXPORT_MISSING(pkg, exportName));
        }
        const transport = new TransportCtor(cfg.options);
        return transport;
    };
}

export declare const ERROR_MESSAGES: {
    readonly TRANSPORT_NOT_REGISTERED: (key: string) => string;
    readonly NOT_CONNECTED: "Transport is not connected";
    readonly HANDLER_FAILED: "Message handler failed";
    readonly DYNAMIC_IMPORT_FAIL: (pkg: string) => string;
    readonly DYNAMIC_EXPORT_MISSING: (pkg: string, exportName: string) => string;
    readonly UNKNOWN_TRANSPORT_KEY: (key: string) => string;
};

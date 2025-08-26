export const ERROR_MESSAGES = {
    TRANSPORT_NOT_REGISTERED: (key) => `Transport not registered for key: ${key}`,
    NOT_CONNECTED: "Transport is not connected",
    HANDLER_FAILED: "Message handler failed",
    DYNAMIC_IMPORT_FAIL: (pkg) => `Failed to dynamically import transport package "${pkg}". Is it installed?`,
    DYNAMIC_EXPORT_MISSING: (pkg, exportName) => `Transport package "${pkg}" does not export "${exportName}".`,
    UNKNOWN_TRANSPORT_KEY: (key) => `Unknown transport key: ${key}`,
};

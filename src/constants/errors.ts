export const ERROR_MESSAGES = {
  TRANSPORT_NOT_REGISTERED: (key: string) => `Transport not registered for key: ${key}`,
  NOT_CONNECTED: "Transport is not connected",
  HANDLER_FAILED: "Message handler failed",

  DYNAMIC_IMPORT_FAIL: (pkg: string) =>
    `Failed to dynamically import transport package "${pkg}". Is it installed?`,
  DYNAMIC_EXPORT_MISSING: (pkg: string, exportName: string) =>
    `Transport package "${pkg}" does not export "${exportName}".`,
  UNKNOWN_TRANSPORT_KEY: (key: string) => `Unknown transport key: ${key}`,
} as const;
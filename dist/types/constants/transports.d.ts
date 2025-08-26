export declare enum TransportKey {
    RABBITMQ = "rabbitmq",
    KAFKA = "kafka",
    REDIS = "redis",
    HTTP = "http"
}
export declare const DEFAULT_TRANSPORT_PACKAGE_BY_KEY: Record<TransportKey, string>;
export declare const DEFAULT_TRANSPORT_EXPORT_BY_KEY: Record<TransportKey, string>;

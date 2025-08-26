export enum TransportKey {
  RABBITMQ = "rabbitmq",
  KAFKA = "kafka",
  REDIS = "redis",
  HTTP = "http",
}

export const DEFAULT_TRANSPORT_PACKAGE_BY_KEY: Record<TransportKey, string> = {
  [TransportKey.RABBITMQ]: "multi-broker-transport-rabbitmq",
  [TransportKey.KAFKA]: "multi-broker-transport-kafka",
  [TransportKey.REDIS]: "multi-broker-transport-redis",
  [TransportKey.HTTP]: "multi-broker-transport-http",
};

export const DEFAULT_TRANSPORT_EXPORT_BY_KEY: Record<TransportKey, string> = {
  [TransportKey.RABBITMQ]: "RabbitMQTransport",
  [TransportKey.KAFKA]: "KafkaTransport",
  [TransportKey.REDIS]: "RedisTransport",
  [TransportKey.HTTP]: "HttpCallbackTransport",
};
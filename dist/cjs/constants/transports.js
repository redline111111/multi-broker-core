"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TRANSPORT_EXPORT_BY_KEY = exports.DEFAULT_TRANSPORT_PACKAGE_BY_KEY = exports.TransportKey = void 0;
var TransportKey;
(function (TransportKey) {
    TransportKey["RABBITMQ"] = "rabbitmq";
    TransportKey["KAFKA"] = "kafka";
    TransportKey["REDIS"] = "redis";
    TransportKey["HTTP"] = "http";
})(TransportKey || (exports.TransportKey = TransportKey = {}));
exports.DEFAULT_TRANSPORT_PACKAGE_BY_KEY = {
    [TransportKey.RABBITMQ]: "multi-broker-transport-rabbitmq",
    [TransportKey.KAFKA]: "multi-broker-transport-kafka",
    [TransportKey.REDIS]: "multi-broker-transport-redis",
    [TransportKey.HTTP]: "multi-broker-transport-http",
};
exports.DEFAULT_TRANSPORT_EXPORT_BY_KEY = {
    [TransportKey.RABBITMQ]: "RabbitMQTransport",
    [TransportKey.KAFKA]: "KafkaTransport",
    [TransportKey.REDIS]: "RedisTransport",
    [TransportKey.HTTP]: "HttpCallbackTransport",
};

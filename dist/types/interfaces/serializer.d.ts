export interface Serializer {
    readonly contentType: string;
    serialize<T>(value: T): Buffer;
    deserialize<T>(bytes: Buffer): T;
}

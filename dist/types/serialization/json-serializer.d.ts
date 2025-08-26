import { Serializer } from "../interfaces/serializer";
export declare class JsonSerializer implements Serializer {
    contentType: string;
    serialize<T>(data: T): Buffer;
    deserialize<T>(raw: Buffer | string): T;
}

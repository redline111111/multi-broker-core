import { Serializer } from "../interfaces/serializer";

export class JsonSerializer implements Serializer {
  contentType = "application/json";

  serialize<T>(data: T): Buffer {
    return Buffer.from(JSON.stringify(data));
  }

  deserialize<T>(raw: Buffer | string): T {
    const str = typeof raw === "string" ? raw : raw.toString();
    return JSON.parse(str);
  }
}

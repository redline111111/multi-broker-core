export class JsonSerializer {
    contentType = "application/json";
    serialize(data) {
        return Buffer.from(JSON.stringify(data));
    }
    deserialize(raw) {
        const str = typeof raw === "string" ? raw : raw.toString();
        return JSON.parse(str);
    }
}

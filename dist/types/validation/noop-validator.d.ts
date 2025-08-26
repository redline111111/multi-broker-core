import { SchemaValidator } from "../interfaces/schema-validator";
export declare class NoopSchemaValidator<T> implements SchemaValidator<T> {
    validate(input: unknown): T;
}

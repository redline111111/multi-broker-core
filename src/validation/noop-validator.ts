import { SchemaValidator } from "../interfaces/schema-validator";
export class NoopSchemaValidator<T> implements SchemaValidator<T> {
  validate(input: unknown): T { return input as T; }
}
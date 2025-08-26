export interface SchemaValidator<T = unknown> {
  validate(input: unknown): T;
}
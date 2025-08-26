export interface SchemaDescriptor {
  id: number | string;
  subject?: string;
  version?: number;
  contentType: string;
}

export interface SchemaRegistryClient {
  register(subject: string, schema: string, contentType: string): Promise<SchemaDescriptor>;

  getById(id: number | string): Promise<{ schema: string; contentType: string }>;

  getLatest(subject: string): Promise<SchemaDescriptor & { schema: string }>;

  isCompatible?(subject: string, schema: string, contentType: string): Promise<boolean>;
}
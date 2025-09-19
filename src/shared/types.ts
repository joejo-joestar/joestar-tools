export enum SchemaType {
  STRING = "string",
  NUMBER = "number",
  INTEGER = "integer",
  BOOLEAN = "boolean",
  OBJECT = "object",
  ARRAY = "array",
  NULL = "null",
}

export interface SchemaField {
  title?: string;
  id: string;
  key: string;
  type: SchemaType;
  description: string;
  required: boolean;
  properties?: SchemaField[];
  items?: SchemaField;
}

export interface FeedFinderResponse {
  feedUrl: string | null;
  error: string | null;
}

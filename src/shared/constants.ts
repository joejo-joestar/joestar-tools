import { SchemaType } from './types';

export const SCHEMA_TYPE_DEFINITIONS: { name: SchemaType; url: string }[] = [
  { name: SchemaType.STRING, url: 'https://json-schema.org/understanding-json-schema/reference/string' },
  { name: SchemaType.NUMBER, url: 'https://json-schema.org/understanding-json-schema/reference/numeric' },
  { name: SchemaType.INTEGER, url: 'https://json-schema.org/understanding-json-schema/reference/numeric' },
  { name: SchemaType.BOOLEAN, url: 'https://json-schema.org/understanding-json-schema/reference/boolean' },
  { name: SchemaType.OBJECT, url: 'https://json-schema.org/understanding-json-schema/reference/object' },
  { name: SchemaType.ARRAY, url: 'https://json-schema.org/understanding-json-schema/reference/array' },
  { name: SchemaType.NULL, url: 'https://json-schema.org/understanding-json-schema/reference/null' },
];

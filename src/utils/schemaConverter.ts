import type { SchemaField } from "@shared/types";
import { SchemaType } from "@shared/types";

function toSchemaType(type: any): SchemaType {
  switch (type) {
    case "string":
      return SchemaType.STRING;
    case "number":
      return SchemaType.NUMBER;
    case "integer":
      return SchemaType.INTEGER;
    case "boolean":
      return SchemaType.BOOLEAN;
    case "object":
      return SchemaType.OBJECT;
    case "array":
      return SchemaType.ARRAY;
    case "null":
      return SchemaType.NULL;
    default:
      return SchemaType.STRING;
  }
}

function convertProperty(
  key: string,
  def: any,
  requiredKeys: string[] | undefined
): SchemaField {
  const id = crypto.randomUUID();
  const type = toSchemaType(def.type);

  const base: SchemaField = {
    id,
    key,
    type,
    description: def.description || "",
    required: !!(requiredKeys && requiredKeys.includes(key)),
    pattern: def.pattern,
  } as SchemaField;

  if (type === SchemaType.OBJECT) {
    const props = def.properties || {};
    const req = def.required || [];
    base.properties = Object.keys(props).map((k) =>
      convertProperty(k, props[k], req)
    );
  }

  if (type === SchemaType.ARRAY) {
    const items = def.items || {};
    // For simplicity, represent items as a single virtual field with key 'items'
    base.items = convertProperty("items", items, items.required || []);
  }

  return base;
}

export function schemaToFields(schema: any): SchemaField[] {
  if (!schema || typeof schema !== "object") return [];
  const props = schema.properties || {};
  const required = schema.required || [];
  return Object.keys(props).map((k) => convertProperty(k, props[k], required));
}

export default schemaToFields;

import React, { useState, useCallback, useMemo } from "react";
import * as monaco from "monaco-editor";
import { type SchemaField, SchemaType } from "@shared/types";
import SplitView from "@components/SchemaMakerComps/SplitView";
import { schemaToFields } from "@utils/schemaConverter";
import useMediaQuery from "@hooks/useMediaQuery";
import SchemaBuilder from "@components/SchemaMakerComps/SchemaBuilder";
import CodeViewer from "@components/SchemaMakerComps/CodeViewer";
import Toast from "@components/Toast";
import type { ToastVariant } from "@components/Toast";

const SchemaMaker: React.FC = () => {
  const [mobileShowSchema, setMobileShowSchema] = useState(false);
  const [schemaTitle, setSchemaTitle] = useState<string>("Generated Schema");

  function MobileSchemaToggle({
    generatedSchema,
  }: {
    generatedSchema: object;
  }) {
    return (
      <div className="w-full bg-ctp-green-900/20 border border-ctp-green/50 p-3">
        <button
          onClick={() => setMobileShowSchema((s) => !s)}
          className="w-full bg-ctp-mauve-700 hover:bg-ctp-mauve-600 text-ctp-mauve-50 py-2 px-3"
        >
          {mobileShowSchema ? "Hide Generated Schema" : "View Generated Schema"}
        </button>

        {mobileShowSchema && (
          <div className="mt-3">
            <CodeViewer schema={generatedSchema} />
          </div>
        )}
      </div>
    );
  }

  // MARK: Main Tool State and Handlers
  const [fields, setFields] = useState<SchemaField[]>([
    {
      id: crypto.randomUUID(),
      key: "obj",
      type: SchemaType.OBJECT,
      description: "",
      required: true,
      properties: [
        {
          id: crypto.randomUUID(),
          key: "str",
          type: SchemaType.STRING,
          description: "",
          required: true,
        },
      ],
    },
  ]);

  const [validationToast, setValidationToast] = useState<{
    message: string;
    variant?: ToastVariant;
  } | null>(null);

  const recursivelyUpdate = useCallback(
    <T extends keyof SchemaField>(
      currentFields: SchemaField[],
      id: string,
      property: T,
      value: SchemaField[T]
    ): SchemaField[] => {
      return currentFields.map((field) => {
        if (field.id === id) {
          return { ...field, [property]: value };
        }
        if (field.properties) {
          return {
            ...field,
            properties: recursivelyUpdate(
              field.properties,
              id,
              property,
              value
            ),
          };
        }
        if (field.items) {
          const itemAsArray = field.items ? [field.items] : [];
          const updatedItems = recursivelyUpdate(
            itemAsArray,
            id,
            property,
            value
          );
          return { ...field, items: updatedItems[0] };
        }
        return field;
      });
    },
    []
  );

  // Helper: find the properties array that contains the field with `id`.
  // Returns the array reference (so callers can check siblings) or null.
  const findParentPropertiesList = (
    currentFields: SchemaField[],
    id: string
  ): SchemaField[] | null => {
    for (const field of currentFields) {
      if (field.id === id) return currentFields;
      if (field.properties) {
        const found = findParentPropertiesList(field.properties, id);
        if (found) return found;
      }
      if (field.items) {
        // items are represented as a single field; treat them as their own list
        if (field.items.id === id) return [field.items];
        const found = findParentPropertiesList([field.items], id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleFieldUpdate = useCallback(
    <T extends keyof SchemaField>(
      id: string,
      property: T,
      value: SchemaField[T]
    ) => {
      setFields((currentFields) => {
        // If updating the 'key' property, ensure there is no sibling with the same key
        if (property === "key") {
          const parentList =
            findParentPropertiesList(currentFields, id) || currentFields;
          const candidate = value as unknown as string;
          if (
            candidate &&
            parentList.some((f) => f.key === candidate && f.id !== id)
          ) {
            setValidationToast({
              message: `Duplicate key "${candidate}" detected in the same object scope`,
              variant: "error",
            });
            return currentFields;
          }
        }

        return recursivelyUpdate(currentFields, id, property, value);
      });
    },
    [recursivelyUpdate]
  );

  const handleAddField = useCallback((parentId: string | null) => {
    const newField: SchemaField = {
      id: crypto.randomUUID(),
      key: "",
      type: SchemaType.STRING,
      description: "",
      required: false,
    };

    if (parentId === null) {
      setFields((current) => [...current, newField]);
      return;
    }

    const addRecursively = (currentFields: SchemaField[]): SchemaField[] => {
      return currentFields.map((field) => {
        if (field.id === parentId) {
          if (field.type === SchemaType.OBJECT) {
            const newProperties = [...(field.properties || []), newField];
            return { ...field, properties: newProperties };
          }
          if (field.type === SchemaType.ARRAY && !field.items) {
            return { ...field, items: { ...newField, key: "items" } };
          }
        }
        if (field.properties) {
          return { ...field, properties: addRecursively(field.properties) };
        }
        if (field.items) {
          const itemAsArray = field.items ? [field.items] : [];
          const updatedItems = addRecursively(itemAsArray);
          return { ...field, items: updatedItems[0] };
        }
        return field;
      });
    };

    setFields((current) => addRecursively(current));
  }, []);

  const handleDeleteField = useCallback((id: string) => {
    const deleteRecursively = (currentFields: SchemaField[]): SchemaField[] => {
      const result: SchemaField[] = [];
      for (const field of currentFields) {
        // If this field is the one to delete, skip it
        if (field.id === id) continue;

        let updatedField = field;

        // Recurse into properties if present
        if (field.properties) {
          const newProperties = deleteRecursively(field.properties);
          if (newProperties.length !== field.properties.length) {
            // Only create a shallow copy if something changed
            updatedField = { ...updatedField, properties: newProperties };
          } else if (newProperties !== field.properties) {
            updatedField = { ...updatedField, properties: newProperties };
          }
        }

        // Handle items (array item schema)
        if (field.items) {
          if (field.items.id === id) {
            // remove the items property
            const copy: any = { ...updatedField };
            delete copy.items;
            updatedField = copy;
          } else {
            const updatedItems = deleteRecursively([field.items]);
            const newItem = updatedItems[0];
            if (newItem !== field.items) {
              updatedField = { ...updatedField, items: newItem };
            }
          }
        }

        result.push(updatedField);
      }
      return result;
    };

    setFields((current) => deleteRecursively(current));
  }, []);

  const generatedSchema = useMemo(() => {
    const buildProperties = (fieldList: SchemaField[]) => {
      // Title is provided by top-level state `schemaTitle`
      const title = schemaTitle || "Generated Schema";
      const properties: { [key: string]: any } = {};
      const required: string[] = [];

      fieldList.forEach((field) => {
        if (!field.key) return;

        const definition: any = {
          type: field.type,
          description: field.description || undefined,
        };

        // Include pattern for string types when provided
        if (field.type === SchemaType.STRING && field.pattern) {
          definition.pattern = field.pattern;
        }

        if (field.type === SchemaType.OBJECT) {
          const nested = buildProperties(field.properties || []);
          definition.properties = nested.properties;
          if (nested.required.length > 0) {
            definition.required = nested.required;
          }
        }

        if (field.type === SchemaType.ARRAY && field.items) {
          const itemSchema = buildProperties([field.items]);
          // We extract the single property from the 'items' virtual field
          const itemDefinition = Object.values(itemSchema.properties)[0];
          definition.items = itemDefinition || {};
        }

        properties[field.key] = definition;
        if (field.required) {
          required.push(field.key);
        }
      });

      return { title, properties, required };
    };

    const root = buildProperties(fields);

    return {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: root.title,
      type: "object",
      properties: root.properties,
      required: root.required.length > 0 ? root.required : undefined,
    };
  }, [fields, schemaTitle]);

  // Import handler: replace left-side fields from a JSON Schema object
  // Accept optional Monaco markers from the editor and reject imports if
  // there are any markers with severity >= Warning.
  const handleImportSchema = (
    schemaObj: object,
    markers?: { message: string; severity: number }[]
  ) => {
    // If the editor reported markers, refuse import when any are warnings/errors.
    if (markers && markers.length > 0) {
      const hasWarningOrError = markers.some(
        (m) => m.severity >= (monaco as any).MarkerSeverity.Warning
      );
      if (hasWarningOrError) {
        // Throw an error so the caller (CodeViewer) can show a toast.
        throw new Error(
          "Import blocked: editor contains warnings or errors. Fix them before importing."
        );
      }
    }

    // Convert and validate the incoming schema (duplicate-key validation).
    const converted = schemaToFields(schemaObj);
    if (!converted || converted.length === 0) return;

    const findDuplicates = (list: SchemaField[], path = "root"): string[] => {
      const errors: string[] = [];
      const seen = new Map<string, number>();
      for (const field of list) {
        const k = field.key || "";
        if (!k) continue; // skip empty keys
        seen.set(k, (seen.get(k) || 0) + 1);
      }
      for (const [k, count] of seen.entries()) {
        if (count > 1) errors.push(`Duplicate key \"${k}\" at ${path}`);
      }

      // Recurse into nested properties and items
      for (const field of list) {
        if (field.properties && field.properties.length > 0) {
          errors.push(
            ...findDuplicates(
              field.properties,
              `${path}/${field.key || "object"}`
            )
          );
        }
        if (field.items) {
          errors.push(
            ...findDuplicates([field.items], `${path}/${field.key || "items"}`)
          );
        }
      }
      return errors;
    };

    const dupErrors = findDuplicates(converted, "root");
    if (dupErrors.length > 0) {
      // Combine into one message and throw so the caller's try/catch shows a toast.
      throw new Error(dupErrors.join("; "));
    }

    setFields(converted as SchemaField[]);
  };

  return (
    <section className="flex flex-col w-10/12 min-h-screen bg-ctp-base text-ctp-rosewater my-64">
      {/* MARK: Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-ctp-green mb-2">
          <img
            className="inline-block w-12 h-12 mr-2"
            src="https://raw.githubusercontent.com/joejo-joestar/joestar-tools/refs/heads/main/src/assets/pixcodingcar.png"
            alt="o7"
          />
          schema maker.
        </h1>
        <p className="text-ctp-blue-950 text-lg">
          start creating a{" "}
          <a
            className="text-ctp-blue-300 hover:underline"
            href="https://json-schema.org/overview/what-is-jsonschema"
            target="_blank"
            rel="noopener noreferrer"
          >
            json schema
          </a>
          .
        </p>
      </header>

      {/* MARK: Body */}
      {/* Render SplitView on md+ screens. On small screens show the editor and a toggle to view the generated schema. */}
      {useMediaQuery("(min-width: 768px)") ? (
        <SplitView
          fields={fields}
          onFieldUpdate={handleFieldUpdate}
          onAddField={handleAddField}
          onDeleteField={handleDeleteField}
          schemaTitle={schemaTitle}
          onSchemaTitleChange={setSchemaTitle}
          generatedSchema={generatedSchema}
          onImportSchema={handleImportSchema}
        />
      ) : (
        <div className="w-full flex flex-col gap-4">
          <div className="w-full bg-ctp-sapphire-900/20 border border-ctp-sapphire/50 p-3 sm:p-4 lg:p-6 overflow-y-auto overflow-x-auto">
            <SchemaBuilder
              fields={fields}
              onFieldUpdate={handleFieldUpdate}
              onAddField={handleAddField}
              onDeleteField={handleDeleteField}
              schemaTitle={schemaTitle}
              onSchemaTitleChange={setSchemaTitle}
            />
          </div>
          <MobileSchemaToggle generatedSchema={generatedSchema} />
        </div>
      )}
      {validationToast && (
        <Toast
          message={validationToast.message}
          variant={validationToast.variant}
          onClose={() => setValidationToast(null)}
        />
      )}
    </section>
  );
};

export default SchemaMaker;

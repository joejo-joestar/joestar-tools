/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo } from "react";
import { type SchemaField, SchemaType } from "@shared/types";
import SplitView from "@components/SchemaMakerComps/SplitView";
import useMediaQuery from "@hooks/useMediaQuery";
import SchemaBuilder from "@components/SchemaMakerComps/SchemaBuilder";
import CodeViewer from "@components/SchemaMakerComps/CodeViewer";

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
      key: "",
      type: SchemaType.OBJECT,
      description: "",
      required: true,
      properties: [
        {
          id: crypto.randomUUID(),
          key: "",
          type: SchemaType.STRING,
          description: "",
          required: true,
        },
      ],
    },
  ]);

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

  const handleFieldUpdate = useCallback(
    <T extends keyof SchemaField>(
      id: string,
      property: T,
      value: SchemaField[T]
    ) => {
      setFields((currentFields) =>
        recursivelyUpdate(currentFields, id, property, value)
      );
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

  return (
    <section className="flex flex-col w-10/12 min-h-screen bg-ctp-base text-ctp-rosewater my-64">
      {/* MARK: Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-ctp-mauve mb-2">
          JSON Schema Generator
        </h1>
        <p className="text-ctp-blue-950 text-lg">
          Start Creating a{" "}
          <a
            className="text-ctp-blue-300 hover:underline"
            href="https://json-schema.org/overview/what-is-jsonschema"
            target="_blank"
            rel="noopener noreferrer"
          >
            JSON Schema
          </a>
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
    </section>
  );
};

export default SchemaMaker;

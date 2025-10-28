import React from "react";
import { type SchemaField, SchemaType } from "@shared/types";
import { SCHEMA_TYPE_DEFINITIONS } from "@shared/constants";
import SchemaBuilder from "./SchemaBuilder";
import { PlusCircleIcon, TrashIcon, ExternalLinkIcon } from "@/assets/Icons";

interface SchemaFieldEditorProps {
  field: SchemaField;
  onFieldUpdate: <T extends keyof SchemaField>(
    id: string,
    property: T,
    value: SchemaField[T]
  ) => void;
  onAddField: (parentId: string | null) => void;
  onDeleteField: (id: string) => void;
  isItem?: boolean;
}

const SchemaFieldEditor: React.FC<SchemaFieldEditorProps> = ({
  field,
  onFieldUpdate,
  onAddField,
  onDeleteField,
  isItem = false,
}) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as SchemaType;
    onFieldUpdate(field.id, "type", newType);

    // Reset properties/items when changing type away from object/array
    if (newType !== SchemaType.OBJECT) {
      onFieldUpdate(field.id, "properties", undefined);
    }
    if (newType !== SchemaType.ARRAY) {
      onFieldUpdate(field.id, "items", undefined);
    }
  };

  const currentTypeDefinition = SCHEMA_TYPE_DEFINITIONS.find(
    (def) => def.name === field.type
  );

  return (
    <div className="bg-ctp-sapphire-800/20 border border-ctp-sapphire-700/50 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Input */}
        {!isItem && (
          <div className="col-span-1">
            <label
              htmlFor={`key-${field.id}`}
              className="block text-sm font-medium mb-1"
            >
              Field Name
            </label>
            <input
              type="text"
              id={`key-${field.id}`}
              value={field.key}
              onChange={(e) => onFieldUpdate(field.id, "key", e.target.value)}
              placeholder="property"
              className="w-full bg-ctp-sapphire-800/20 border border-ctp-sapphire-700/50 px-3 py-2 text-ctp-rosewater placeholder-ctp-sapphire-500/25 focus:ring-1 focus:ring-ctp-blue-400 focus:outline-none transition duration-200"
            />
          </div>
        )}

        {/* Type Select */}
        <div className={isItem ? "md:col-span-2" : "col-span-1"}>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor={`type-${field.id}`}
              className="block text-sm font-medium"
            >
              Type
            </label>
            {currentTypeDefinition && (
              <a
                href={currentTypeDefinition.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-ctp-overlay2 hover:text-ctp-blue fill-ctp-overlay2 hover:fill-ctp-blue transition-colors"
                aria-label={`Learn more about the ${field.type} type in the JSON Schema documentation`}
              >
                <ExternalLinkIcon className="w-3 h-3" />
                Docs
              </a>
            )}
          </div>
          <select
            id={`type-${field.id}`}
            value={field.type}
            onChange={handleTypeChange}
            className="w-full bg-ctp-sapphire-800/20 border border-ctp-sapphire-700/50 px-3 py-2 text-ctp-rosewater focus:ring-1 focus:ring-ctp-blue-400 focus:outline-none transition duration-200 appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.5em 1.5em",
            }}
          >
            {SCHEMA_TYPE_DEFINITIONS.map((typeDef) => (
              <option key={typeDef.name} value={typeDef.name}>
                {typeDef.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description Input */}
        <div className="md:col-span-2">
          <label
            htmlFor={`description-${field.id}`}
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <input
            type="text"
            id={`description-${field.id}`}
            value={field.description}
            onChange={(e) =>
              onFieldUpdate(field.id, "description", e.target.value)
            }
            placeholder="A short description of the field"
            className="w-full bg-ctp-sapphire-800/20 border border-ctp-sapphire-700/50 px-3 py-2 text-ctp-rosewater placeholder-ctp-sapphire-500/25 focus:ring-1 focus:ring-ctp-blue-400 focus:outline-none transition duration-200"
          />
        </div>
        {/* Pattern Input (only for string type) */}
        {field.type === SchemaType.STRING && (
          <div className="md:col-span-2">
            <label
              htmlFor={`pattern-${field.id}`}
              className="block text-sm font-medium mb-1"
            >
              Pattern (regex)
            </label>
            <input
              type="text"
              id={`pattern-${field.id}`}
              value={field.pattern ?? ""}
              onChange={(e) =>
                onFieldUpdate(field.id, "pattern", e.target.value)
              }
              placeholder="e.g. ^[A-Za-z0-9_-]+$"
              className="w-full bg-ctp-sapphire-800/20 border border-ctp-sapphire-700/50 px-3 py-2 text-ctp-rosewater placeholder-ctp-sapphire-500/25 focus:ring-1 focus:ring-ctp-blue-400 focus:outline-none transition duration-200"
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {/* Required Checkbox */}
        {!isItem && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required}
              onChange={(e) =>
                onFieldUpdate(field.id, "required", e.target.checked)
              }
              className="h-4 w-4 bg-ctp-sapphire-800/20 border border-ctp-sapphire-700/50 text-ctp-mauve-500 focus:ring-ctp-mauve-600"
            />
            <label htmlFor={`required-${field.id}`} className="text-sm">
              Required
            </label>
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={() => onDeleteField(field.id)}
          className="ml-auto flex items-center gap-1.5 bg-ctp-red-700 hover:bg-ctp-red-600 text-ctp-red-50 cursor-pointer transition-colors duration-200 text-sm p-1.5"
          aria-label={`Delete ${field.key || "field"}`}
        >
          <TrashIcon className="fill-ctp-red-50 w-4 h-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      {/* Nested Properties for 'object' type */}
      {field.type === SchemaType.OBJECT && (
        <div className="mt-4 pl-6 border-l-2 border-ctp-sapphire-700/50 space-y-4">
          <h4 className="text-sm font-semibold text-ctp-sapphire">
            Properties:
          </h4>
          <SchemaBuilder
            fields={field.properties || []}
            onFieldUpdate={onFieldUpdate}
            onAddField={onAddField}
            onDeleteField={onDeleteField}
            parentId={field.id}
            isRoot={false}
          />
          <button
            onClick={() => onAddField(field.id)}
            className="flex items-center gap-2 bg-ctp-blue-700 hover:bg-ctp-blue-600 text-ctp-blue-50 cursor-pointer transition-colors duration-200 px-3 py-2 text-sm"
            aria-label="Add Property"
          >
            <PlusCircleIcon className="fill-ctp-blue-50 w-5 h-5" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Property</span>
          </button>
        </div>
      )}

      {/* Nested Item for 'array' type */}
      {field.type === SchemaType.ARRAY && (
        <div className="mt-4 pl-6 border-l-2 border-ctp-sapphire-700/50 space-y-4">
          <h4 className="text-sm font-semibold">Array Items:</h4>
          {field.items ? (
            <SchemaFieldEditor
              key={field.items.id}
              field={field.items}
              onFieldUpdate={onFieldUpdate}
              onAddField={onAddField}
              onDeleteField={onDeleteField}
              isItem={true}
            />
          ) : (
            <button
              onClick={() => onAddField(field.id)}
              className="flex items-center gap-2 bg-ctp-blue-700 hover:bg-ctp-blue-600 text-ctp-blue-50 cursor-pointer transition-colors duration-200 px-3 py-2 text-sm"
              aria-label="Define Item Type"
            >
              <PlusCircleIcon className="fill-ctp-blue-50 w-5 h-5" />
              <span className="sm:hidden">Define Item</span>
              <span className="hidden sm:inline">Define Item Type</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SchemaFieldEditor;

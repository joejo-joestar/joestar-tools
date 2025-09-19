import React from "react";
import { type SchemaField } from "@shared/types";
import SchemaFieldEditor from "./SchemaFieldEditor";
import { PlusCircleIcon } from "@/assets/Icons";

interface SchemaBuilderProps {
  fields: SchemaField[];
  onFieldUpdate: <T extends keyof SchemaField>(
    id: string,
    property: T,
    value: SchemaField[T]
  ) => void;
  onAddField: (parentId: string | null) => void;
  onDeleteField: (id: string) => void;
  parentId?: string | null;
  isRoot?: boolean;
  schemaTitle?: string;
  onSchemaTitleChange?: (value: string) => void;
}

const SchemaBuilder: React.FC<SchemaBuilderProps> = ({
  fields,
  onFieldUpdate,
  onAddField,
  onDeleteField,
  parentId = null,
  isRoot = true,
  schemaTitle = "",
  onSchemaTitleChange,
}) => {
  // schemaTitle is controlled via props (from parent state)
  return (
    <div className="space-y-4">
      {isRoot && (
        <div>
          <label
            htmlFor={`schema-title`}
            className="block text-sm font-medium mb-1"
          >
            Schema Title
          </label>
          <input
            type="text"
            id={`schema-title`}
            value={schemaTitle}
            onChange={(e) => {
              if (onSchemaTitleChange) {
                onSchemaTitleChange(e.target.value);
              } else {
                // backward-compat: if parent doesn't control title, store it
                // on the first root field
                onFieldUpdate(fields[0].id, "title", e.target.value);
              }
            }}
            placeholder="title"
            className="w-full bg-ctp-sapphire-800/20 border border-ctp-sapphire-700/50 px-3 py-2 text-ctp-rosewater placeholder-ctp-sapphire-500/25 focus:ring-1 focus:ring-ctp-blue-400 focus:outline-none transition duration-200"
          />
        </div>
      )}
      {fields.map((field, _index) => (
        <SchemaFieldEditor
          key={field.id}
          field={field}
          onFieldUpdate={onFieldUpdate}
          onAddField={onAddField}
          onDeleteField={onDeleteField}
        />
      ))}
      {isRoot && (
        <button
          onClick={() => onAddField(parentId)}
          className="mt-4 flex items-center gap-2 bg-ctp-blue-700 hover:bg-ctp-blue-600 text-ctp-blue-50 cursor-pointer transition-colors duration-200 px-3 py-2"
          aria-label="Add Root Property"
        >
          <PlusCircleIcon className="w-5 h-5 fill-ctp-blue-50" />
          <span className="sm:hidden">Add Root</span>
          <span className="hidden sm:inline">Add Root Property</span>
        </button>
      )}
    </div>
  );
};

export default SchemaBuilder;

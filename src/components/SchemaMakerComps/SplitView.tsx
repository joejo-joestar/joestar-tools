import React from "react";
import SchemaBuilder from "./SchemaBuilder";
import CodeViewer from "./CodeViewer";
import { type SchemaField } from "@shared/types";

interface SplitViewProps {
  fields: SchemaField[];
  onFieldUpdate: <T extends keyof SchemaField>(
    id: string,
    property: T,
    value: SchemaField[T]
  ) => void;
  onAddField: (parentId: string | null) => void;
  onDeleteField: (id: string) => void;
  schemaTitle?: string;
  onSchemaTitleChange?: (value: string) => void;
  generatedSchema: object;
}

const SplitView: React.FC<SplitViewProps> = ({
  fields,
  onFieldUpdate,
  onAddField,
  onDeleteField,
  schemaTitle,
  onSchemaTitleChange,
  generatedSchema,
}) => {
  return (
    <div className="flex flex-row md:flex-row w-full min-h-screen gap-2 mb-10">
      <div className="w-full bg-ctp-sapphire-900/20 border border-ctp-sapphire/50 p-3 sm:p-4 lg:p-6 overflow-y-auto overflow-x-auto">
        <SchemaBuilder
          fields={fields}
          onFieldUpdate={onFieldUpdate}
          onAddField={onAddField}
          onDeleteField={onDeleteField}
          schemaTitle={schemaTitle}
          onSchemaTitleChange={onSchemaTitleChange}
        />
      </div>
      <div className="w-full bg-ctp-green-900/20 border border-ctp-green/50 flex flex-col">
        <CodeViewer schema={generatedSchema} />
      </div>
    </div>
  );
};

export default SplitView;

import React, { useState, useEffect, useMemo } from "react";
import { ClipboardIcon, CheckIcon } from "@/assets/Icons";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import "@catppuccin/highlightjs/css/catppuccin-mocha.css";

// Register JSON language once
hljs.registerLanguage("json", json);

interface CodeViewerProps {
  schema: object;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ schema }) => {
  const [copied, setCopied] = useState(false);
  const schemaString = JSON.stringify(schema, null, 2);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Compute highlighted HTML for the schema string so we can render it directly.
  const highlightedHtml = useMemo(() => {
    try {
      // hljs.highlight returns an object with a `value` property that contains HTML
      return hljs.highlight(schemaString, {
        language: "json",
        ignoreIllegals: true,
      }).value;
    } catch (_err) {
      // Fallback: escape the raw string so it renders as plain text
      return schemaString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }, [schemaString]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(schemaString);
      setCopied(true);
    } catch (_err) {
      // ignore copy errors in the UI
    }
  };

  return (
    <div className="h-full flex flex-col relative p-6">
      <div className="flex justify-between items-center flex-col sm:flex-row">
        <h3 className="text-lg font-semibold text-ctp-green-50">
          Generated Schema
        </h3>
        <button
          onClick={handleCopy}
          className={`${!copied ? "bg-ctp-mauve-700 hover:bg-ctp-mauve-600 text-ctp-mauve-50" : "bg-ctp-green-700 hover:bg-ctp-green-600 text-ctp-green-50"} flex-shrink-0 cursor-pointer w-full sm:w-auto font-medium py-2 px-4 transition duration-200 flex items-center justify-center gap-2`}
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 fill-ctp-green-50" /> Copied!
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4 fill-ctp-mauve-50" /> Copy
            </>
          )}
        </button>
      </div>

      <div className="h-[2px] bg-ctp-green/50 my-2" />

      <div className="p-4 overflow-auto border-ctp-base bg-ctp-base">
        <pre className="text-sm whitespace-pre-wrap">
          <code
            className="language-json text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;

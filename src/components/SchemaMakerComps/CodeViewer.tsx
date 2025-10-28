import React, { useEffect, useRef, useState } from "react";
import { ClipboardIcon, CheckIcon } from "@/assets/Icons";
import * as monaco from "monaco-editor";
// Import Monaco web workers using Vite's `?worker` import so the bundler
// produces separate worker bundles and resolves their paths correctly.
// These imports produce worker constructors that can be instantiated with
// `new EditorWorker()` / `new JsonWorker()`.
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import { createHighlighter } from "shiki";
import { shikiToMonaco } from "@shikijs/monaco";
import "@catppuccin/highlightjs/css/catppuccin-mocha.css";
import SNIPPETS from "../../utils/snippets";

interface CodeViewerProps {
  schema: object;
  onImportSchema?: (schemaObj: object) => void;
}

// Ensure Monaco can load its web workers in the Vite environment
(self as unknown as { MonacoEnvironment?: unknown }).MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === "json") {
      return new JsonWorker();
    }
    return new EditorWorker();
  },
};

const CodeViewer: React.FC<CodeViewerProps> = ({ schema, onImportSchema }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const modelRef = useRef<monaco.editor.ITextModel | null>(null);
  const [copied, setCopied] = useState(false);
  // Suppress change events that originate from programmatic model updates
  const suppressChangeRef = useRef(false);
  // Debounce timer for parsing editor content
  // Track whether the editor content has unsaved changes
  const contentDirtyRef = useRef(false);
  // Store disposable for content change listener so we can dispose on cleanup
  const contentListenerRef = useRef<monaco.IDisposable | null>(null);
  const completionProviderRef = useRef<monaco.IDisposable | null>(null);
  const keydownListenerRef = useRef<monaco.IDisposable | null>(null);

  // Initialize the editor once
  useEffect(() => {
    if (!containerRef.current) return;

    const initial = JSON.stringify(schema ?? {}, null, 2);
    modelRef.current = monaco.editor.createModel(initial, "json");

    editorRef.current = monaco.editor.create(containerRef.current, {
      model: modelRef.current,
      language: "json",
      automaticLayout: true,
      minimap: { enabled: true },
      folding: true,
      glyphMargin: false,
      wordWrap: "off",
      theme: "vs-dark",
      readOnly: false,
      lineNumbers: "on",
    });

    // Listen for user edits and attempt to parse the JSON after a short debounce.
    if (modelRef.current) {
      // Mark the content as dirty on user edits. Actual import will occur on Ctrl/Cmd+S.
      contentListenerRef.current = modelRef.current.onDidChangeContent(() => {
        if (suppressChangeRef.current) return;
        contentDirtyRef.current = true;
      });
    }

    // Apply shiki theme to monaco (best-effort)
    (async () => {
      try {
        const name = "catppuccin-mocha";
        const highlighter = await createHighlighter({
          themes: [name],
          langs: ["json"],
        });
        shikiToMonaco(highlighter, monaco);
        monaco.editor.setTheme(name as any);
      } catch {
        // ignore theme errors and keep the default
      }
    })();

    // Register a simple snippet completion provider for JSON schema editing.
    if (monaco && editorRef.current) {
      completionProviderRef.current =
        monaco.languages.registerCompletionItemProvider("json", {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            );
            const suggestions: monaco.languages.CompletionItem[] = SNIPPETS.map(
              (s) => ({
                label: s.label,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: s.body,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: s.description,
                range,
              })
            );
            return { suggestions };
          },
        });
    }

    // Keyboard handler for Ctrl/Cmd+S to import current editor JSON. Register
    // with Monaco so it's invoked while the editor is focused and receives
    // all key events.
    if (editorRef.current) {
      keydownListenerRef.current = editorRef.current.onKeyDown((e) => {
        const isSave =
          (e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyS;
        if (!isSave) return;
        e.preventDefault();
        if (!contentDirtyRef.current) return;
        try {
          const text = modelRef.current?.getValue() ?? "";
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === "object" && onImportSchema) {
            onImportSchema(parsed);
            contentDirtyRef.current = false;
          }
        } catch {
          // ignore parse errors
        }
      });
    }

    return () => {
      editorRef.current?.dispose();
      modelRef.current?.dispose();
      if (contentListenerRef.current) contentListenerRef.current.dispose();
      if (keydownListenerRef.current) keydownListenerRef.current.dispose();
      if (completionProviderRef.current)
        completionProviderRef.current.dispose();
      editorRef.current = null;
      modelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update model when schema changes
  useEffect(() => {
    const txt = JSON.stringify(schema ?? {}, null, 2);
    if (modelRef.current) {
      // Avoid triggering the change listener when updating model programmatically
      if (modelRef.current.getValue() !== txt) {
        suppressChangeRef.current = true;
        // preserve editor view (cursor/selection/scroll) to avoid jump on setValue
        const viewState = editorRef.current?.saveViewState();
        modelRef.current.setValue(txt);
        if (viewState && editorRef.current)
          editorRef.current.restoreViewState(viewState);
        // release suppression on next tick
        window.setTimeout(() => (suppressChangeRef.current = false), 0);
      }
    } else if (editorRef.current && containerRef.current) {
      modelRef.current = monaco.editor.createModel(txt, "json");
      editorRef.current.setModel(modelRef.current);
    }
  }, [schema]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      const text =
        modelRef.current?.getValue() ?? JSON.stringify(schema ?? {}, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (_err) {
      // ignore
    }
  };

  return (
    <div className="h-full flex flex-col relative p-6">
      <div className="flex justify-between items-center flex-col sm:flex-row">
        <h3 className="text-lg font-semibold text-ctp-green-50">
          Generated Schema
        </h3>
        <div className="flex items-center gap-2">
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
          {/* Import button removed — Ctrl/Cmd+S now triggers import when editor content is dirty */}
        </div>
      </div>

      <div className="h-[2px] bg-ctp-green/50 my-2" />

      <div className="p-4 overflow-auto border-ctp-base bg-ctp-base h-full">
        <div
          ref={containerRef}
          className="w-full h-[420px] rounded-sm overflow-hidden"
        />
      </div>
    </div>
  );
};

export default CodeViewer;

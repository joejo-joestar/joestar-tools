import React, { useEffect, useRef, useState } from "react";
import useMediaQuery from "@hooks/useMediaQuery";
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
import hljs from "highlight.js/lib/core";
import jsonLang from "highlight.js/lib/languages/json";

// Register JSON language for highlight.js (idempotent)
try {
  hljs.registerLanguage("json", jsonLang);
} catch {
  /* ignore if already registered */
}
import SNIPPETS from "../../utils/snippets";
import Toast from "../Toast";
import type { ToastVariant } from "../Toast";

interface CodeViewerProps {
  schema: object;
  onImportSchema?: (
    schemaObj: object,
    markers?: {
      message: string;
      severity: number;
      startLineNumber: number;
      startColumn: number;
    }[]
  ) => void;
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
  // mobile: screens smaller than `lg` (max-width: 1023px)
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant?: ToastVariant;
  } | null>(null);
  // Suppress change events that originate from programmatic model updates
  const suppressChangeRef = useRef(false);
  // Debounce timer for parsing editor content
  // Track whether the editor content has unsaved changes
  const contentDirtyRef = useRef(false);
  // Store disposable for content change listener so we can dispose on cleanup
  const contentListenerRef = useRef<monaco.IDisposable | null>(null);
  const completionProviderRef = useRef<monaco.IDisposable | null>(null);
  const keydownListenerRef = useRef<monaco.IDisposable | null>(null);

  // Initialize the editor once (skip on mobile to keep bundle small)
  useEffect(() => {
    if (isMobile) return;
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
            // gather markers from Monaco (if any) and pass them to the importer
            const model = modelRef.current;
            const markers = model
              ? monaco.editor
                  .getModelMarkers({ resource: model.uri })
                  .map((m) => ({
                    message: m.message,
                    severity: m.severity,
                    startLineNumber: m.startLineNumber,
                    startColumn: m.startColumn,
                  }))
              : [];

            onImportSchema(parsed, markers);
            contentDirtyRef.current = false;
            setToast({ message: "Schema imported", variant: "success" });
          }
        } catch (err: any) {
          // Try to include the JSON.parse error message if present, and prefer
          // Monaco markers if they exist.
          const marker = getMarkerSummary();
          const errMsg = err?.message ? `: ${err.message}` : "";
          setToast({
            message: marker ?? `Failed to import — invalid JSON${errMsg}`,
            variant: "error",
          });
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
    } else if (!isMobile && editorRef.current && containerRef.current) {
      modelRef.current = monaco.editor.createModel(txt, "json");
      editorRef.current.setModel(modelRef.current);
    }
  }, [schema]);

  // Precompute the schema string and highlighted HTML for mobile view
  const schemaString = React.useMemo(
    () => JSON.stringify(schema ?? {}, null, 2),
    [schema]
  );
  const highlightedHtml = React.useMemo(() => {
    try {
      return hljs.highlight(schemaString, {
        language: "json",
        ignoreIllegals: true,
      }).value;
    } catch (_err) {
      return schemaString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }, [schemaString]);

  // Helper: collect markers (errors/warnings) for the current model and
  // return a short human-readable summary suitable for a toast message.
  const getMarkerSummary = (): string | null => {
    const model = modelRef.current;
    if (!model) return null;
    try {
      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      if (!markers || markers.length === 0) return null;
      // Prefer an Error marker, then Warning, then the first available.
      const chosen =
        markers.find((m) => m.severity === monaco.MarkerSeverity.Error) ||
        markers.find((m) => m.severity === monaco.MarkerSeverity.Warning) ||
        markers[0];
      const severityLabel =
        chosen.severity === monaco.MarkerSeverity.Error
          ? "Error"
          : chosen.severity === monaco.MarkerSeverity.Warning
            ? "Warning"
            : "Notice";
      const loc = `line ${chosen.startLineNumber}, col ${chosen.startColumn}`;
      const extra = markers.length > 1 ? ` (+${markers.length - 1} more)` : "";
      return `${severityLabel} at ${loc}: ${chosen.message}${extra}`;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      const text = isMobile
        ? schemaString
        : (modelRef.current?.getValue() ??
          JSON.stringify(schema ?? {}, null, 2));
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setToast({ message: "Copied to clipboard", variant: "success" });
    } catch (_err) {
      setToast({ message: "Copy failed", variant: "error" });
    }
  };

  const handleImport = async () => {
    if (onImportSchema && modelRef.current) {
      try {
        const text = modelRef.current.getValue();
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") {
          const model = modelRef.current;
          const markers = model
            ? monaco.editor
                .getModelMarkers({ resource: model.uri })
                .map((m) => ({
                  message: m.message,
                  severity: m.severity,
                  startLineNumber: m.startLineNumber,
                  startColumn: m.startColumn,
                }))
            : [];

          onImportSchema(parsed, markers);
          contentDirtyRef.current = false;
          setToast({
            message: "Schema imported",
            variant: "success",
          });
        }
      } catch (err: any) {
        const marker = getMarkerSummary();
        const errMsg = err?.message ? `: ${err.message}` : "";
        setToast({
          message: marker ?? `Failed to import — invalid JSON${errMsg}`,
          variant: "error",
        });
      }
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
          {!isMobile && (
            <button
              onClick={handleImport}
              className="bg-ctp-blue-700 hover:bg-ctp-blue-600 text-ctp-blue-50 flex-shrink-0 cursor-pointer w-full sm:w-auto font-medium py-2 px-4 transition duration-200 flex items-center justify-center gap-2"
            >
              {onImportSchema && (
                <>
                  <span>Import Schema</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="h-[2px] bg-ctp-green/50 my-2" />

      <div className="p-4 overflow-auto border-ctp-base bg-ctp-base h-full">
        {isMobile ? (
          <div className="w-full">
            <pre className="text-sm whitespace-pre-wrap">
              <code
                className="language-json text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </pre>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full overflow-hidden" />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant as ToastVariant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CodeViewer;

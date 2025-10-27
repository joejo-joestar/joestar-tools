declare module "monaco-editor" {
  export * from "monaco-editor/esm/vs/editor/editor.api";
}

declare module "shiki" {
  export function createHighlighter(opts: any): Promise<any>;
  export type Highlighter = any;
}

declare module "@shikijs/monaco" {
  export function shikiToMonaco(highlighter: any, monaco: any): void;
}

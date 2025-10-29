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

// Allow importing worker scripts with the `?worker` suffix in Vite.
declare module "monaco-editor/esm/vs/editor/editor.worker?worker" {
  const workerCtor: {
    new (): Worker;
  };
  export default workerCtor;
}

declare module "monaco-editor/esm/vs/language/json/json.worker?worker" {
  const workerCtor: {
    new (): Worker;
  };
  export default workerCtor;
}

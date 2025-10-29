<h1 align="center">
    <img src="../src/assets/pixcodingcar.png" alt="coding car" title="coding car" width="32" />
schema maker.
</h1>

a clientside visual [json schema](https://json-schema.org/understanding-json-schema/about) generator

<p align="center">
    <img src="../src/assets/readme/schemamaker.png" alt="Schema Maker" title="Schema Maker" >
</p>

>[!NOTE]
> The generator only creates schemas following the [`draft-07`](https://json-schema.org/draft-07) metaschema (it is hardcoded in the for now)

---

## ⚙️ Tech Used

| Package                                                                       | Description                                                 |
| :---------------------------------------------------------------------------- | :---------------------------------------------------------- |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/)                   | Embedded code editor used for desktop editing               |
| [Shiki](https://shiki.style/)                                                 | Syntax highlighting and theme integration for Monaco        |
| [highlight.js](https://highlightjs.org/)                                      | Lightweight client-side syntax highlighting (mobile viewer) |
| [Catppuccin port for highlight.js](https://github.com/catppuccin/highlightjs) | Catppuccin color theme for highlight.js                     |

---

## ✨ Features

- Build JSON Schemas using Visual Blocks!
- Generates JSON Schema targeting draft-07.
- Embedded [Monaco Editor](https://microsoft.github.io/monaco-editor) to display and manually edit the generated schema.
- [Shiki Monaco Editor Integration](https://shiki.style/packages/monaco) for the syntax highlighting (in the [catppuccin color scheme](https://github.com/catppuccin/vscode/tree/main/packages/catppuccin-vscode))
- [Snippets](../src/utils/snippets.ts) and completion support inside the editor for faster schema authoring.
- Duplicate-key detection in the UI (prevents accidental property name collisions).
- Import-time validation and duplicate-key detection (import will be blocked on validation errors).
- Pattern (regex) field available for string-typed properties in the UI and included in the generated schema.
- Small Toast system (info / success / error) for feedback (save/import/copy results).
- Copy-to-clipboard support for the generated schema.
- Keyboard import shortcut (Ctrl/Cmd+S) in addition to import flows (desktop only).
- Monaco is skipped on small screens (< lg) and the schema is shown as a preformatted highlighted, using [highlight.js](https://highlightjs.org/) HTML view (no inline editing).
- Importing is disabled/hidden on mobile devices - mobile is a read-only viewer with copy support.

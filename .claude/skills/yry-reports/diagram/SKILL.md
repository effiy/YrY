---
name: yry-report-diagram
description: >
  Create polished dark-themed architecture diagrams as self-contained HTML+SVG
  files from a written brief. The former codebase-analysis scripts have been removed.
lifecycle: default-pipeline
user_invocable: true
---

# yry-report-diagram

Architecture diagrams from requirements only.

## Status

- The requirements-driven authoring flow remains.
- The former bundled codebase-analysis scripts have been removed.
- Do not instruct users to run codebase scan, extraction, batching, or merge scripts from this skill.

## Quick Start

```text
/yry-report-diagram create
/yry-report-diagram create --out diagram.html
```

## What this skill does

- Produces a self-contained architecture-diagram page from a written system brief.
- Uses the 4-file split at `YiDoc/templates/diagram/` as the source of truth for structure and styling.
- Preserves the references, templates, agents, and engine sources needed for manual authoring and future replacement work.

## What this skill no longer does

- It no longer performs bundled codebase scanning or knowledge-graph generation.
- It no longer supports the previous script-driven `--from-codebase` workflow.

## Output Contract

Template assets have been consolidated into `YiDoc/templates/diagram/`
as the single source of truth. The skill no longer carries a
`templates/` subdirectory. Per-project output is a regenerated
`data.js` written to `YiDoc/projects/<project>/diagram/data.js`.

- `YiDoc/templates/diagram/index.html` defines DOM order and shared resource wiring.
- `YiDoc/templates/diagram/index.css` defines layered styling tokens and component classes.
- `YiDoc/templates/diagram/data.js` defines the diagram content shape exposed on `window.REPORT_DATA`.
- `YiDoc/templates/diagram/index.js` defines the Vue app and built-in interactions/export helpers.

## Rules

1. Read the 4 template headers (in `YiDoc/templates/diagram/`) before producing output.
2. Keep the rendered page self-contained and free of public CDN dependencies.
3. Draw SVG content in document order: defs, grid, arrows, masks, boxes, boundaries, legend.
4. Give every connection a clear protocol or flow label.
5. Omit empty sections instead of rendering placeholders.
6. Only write `data.js` into the project output dir; the shell is shared, never copied.

## Supporting resources

- [commands/create.md](./commands/create.md) — requirements-driven creation guide.
- `YiDoc/templates/diagram/index.html` — DOM skeleton and script wiring.
- `YiDoc/templates/diagram/index.css` — layered CSS design system entry.
- `YiDoc/templates/diagram/data.js` — diagram data shape.
- `YiDoc/templates/diagram/index.js` — Vue app and interactions.
- [references/design-system.md](./references/design-system.md) — diagram styling guidance.
- [references/knowledge-graph-schema.md](./references/knowledge-graph-schema.md) — retained historical schema notes.
- [references/templates-index.md](./references/templates-index.md) — template catalog.
- [references/quality-rubric.md](./references/quality-rubric.md) — diagram quality rubric.
- [engine/](./engine/) — retained implementation sources.

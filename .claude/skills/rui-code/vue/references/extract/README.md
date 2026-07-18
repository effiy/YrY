# Component Extraction

Source skills: `optimize` (component extraction heuristics), `pattern`
(4-file pattern), `data-flow` (props / emits), `composables` (state
migration hygiene).
Files in this topic: **2**

## What this topic covers

- **Identification** — the 5 falsifiable detection heuristics for
  inline code that should be a standalone SFC, plus a concrete
  signal catalog (regex / ripgrep / AST patterns) so a scan of a
  Vue codebase surfaces candidates mechanically rather than by
  vibe.
- **Refactoring** — the 7-step transformation recipe (boundaries →
  file choice → props contract → state migration → emits contract →
  new file → host replacement), the single-file SFC vs 4-file
  pattern decision tree, and a 5-entry before/after cookbook
  (one per heuristic).
- **Boundaries** — anti-patterns (single occurrence, 5+ props,
  hot lists, pure presentational wrappers) and the post-extraction
  verification checklist (functional, structural, performance,
  accessibility).

This topic is the first-class home for "extract component",
"refactor into a component", "split out a component", "split into a
component", "this is duplicated — pull it out" queries. The
optimization report still owns *whether* an extraction is worth
flagging in a report; this topic owns *how* the extraction is
actually done.

## Files

- [README.md](./README.md)
- [component-extraction.md](./component-extraction.md) — main
  reference: heuristics, signal catalog, transformation recipe,
  decision tree, cookbook, anti-patterns, scanning patterns,
  verification.

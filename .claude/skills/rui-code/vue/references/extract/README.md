# Component Extraction

Source skills: `optimize` (component extraction heuristics), `pattern`
(4-file pattern), `data-flow` (props / emits), `composables` (state
migration hygiene), `slots` (slot composition), `builtin` (KeepAlive /
Teleport), `async` (defineAsyncComponent), `state` (SSR-safe
singletons), `perf` (avoid extraction in hot lists).
Files in this topic: **3** (2 reference docs + 1 README).

## What this topic covers

Two related but distinct jobs:

- **Identification** — the detection side: is this chunk a
  candidate? Which heuristic (#1–#5) applies? How do I score
  priority? How do I scan a whole codebase mechanically?
- **Refactoring** — the transformation side: now that I have a
  candidate, what do I name it, slot vs prop, CSS scoping
  pitfalls, risk, edge cases (SSR / KeepAlive / Teleport / async),
  tests, and the order in which to do multiple extractions.

The split mirrors how the work actually happens: a scan surfaces
candidates; a refactor consumes them. Each doc can be loaded
independently.

## Files

- [README.md](./README.md) — this file.
- [component-identification.md](./component-identification.md) —
  the detection side. 6-question decision tree, priority
  scoring rubric (impact × frequency × risk), comprehensive
  signal catalog (per-heuristic + cross-cutting "looks-like-but-isn't"),
  4-pass scan workflow, identification checklist, triage matrix
  for overlapping heuristics, falsifiers.
- [component-extraction.md](./component-extraction.md) — the
  refactor side. Naming convention, slot-vs-prop decision matrix,
  CSS scoping pitfalls (with pre-flight checklist), risk
  classification (low / medium / high), edge cases
  (defineAsyncComponent / KeepAlive / Teleport / provide-inject /
  SSR / $slots / defineModel / defineExpose), testing the
  extraction, multi-extraction order, then the 8-step
  transformation recipe, the single-file SFC vs 4-file pattern
  decision tree, the 5-entry before/after cookbook (one per
  heuristic), anti-patterns, scanning patterns, and the
  post-extraction verification checklist.

## When to read which

| If the user is asking… | Read |
|---|---|
| "Is this a candidate?" | [component-identification.md](./component-identification.md) |
| "Scan this codebase for extractions." | [component-identification.md § Scan workflow](./component-identification.md#scan-workflow) |
| "Which extraction should I do first?" | [component-identification.md § Priority scoring rubric](./component-identification.md#priority-scoring-rubric) |
| "Extract this into a component." | [component-extraction.md](./component-extraction.md) |
| "What should I name the new component?" | [component-extraction.md § Naming convention](./component-extraction.md#naming-convention) |
| "Should this be a prop or a slot?" | [component-extraction.md § Slot vs prop decision matrix](./component-extraction.md#slot-vs-prop-decision-matrix) |
| "My extraction broke the styles." | [component-extraction.md § CSS scoping pitfalls](./component-extraction.md#css-scoping-pitfalls) |
| "How do I test the new component?" | [component-extraction.md § Testing the extraction](./component-extraction.md#testing-the-extraction) |
| "I have 3 extractions to do — order?" | [component-extraction.md § Multi-extraction order](./component-extraction.md#multi-extraction-order) |
| "Show me a before/after." | [component-extraction.md § Cookbook](./component-extraction.md#cookbook) |
| "This is in the report — execute it." | [component-extraction.md](./component-extraction.md) |

## Topic boundaries

| Boundary | Permission |
|---|---|
| `references/extract/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

This topic is the first-class home for "extract component",
"refactor into a component", "split out a component", "split into
a component", "this is duplicated — pull it out" queries. The
optimization report still owns *whether* an extraction is worth
flagging in a report; this topic owns *how* the extraction is
actually done.

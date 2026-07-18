# Optimization Reports (Vue 3 SFC)

Source skills: meta (consolidated from `core`, `reactivity`, `perf`,
`data-flow`, `composables`, `builtin`, `state`, `directives`, `slots`,
`pattern`, `css`, plus all `vueuse-*` categories).
Files in this topic: **1**

## What this topic covers

- The standard optimization page report shape (seven sections,
  severity / effort / impact scoring, risk & effort matrix, sprint
  slice).
- Opportunity entry format and the anchors that keep severity and
  effort ratings comparable across reports.
- **Component Extraction Opportunities** — the heuristics and worked
  example for flagging inline code that should be split into its own
  SFC. Triggers: 3+ repeated markup blocks, local reactive state
  owned by a region of the template, > 3 levels of nesting *and*
  > 30 lines, mixed concerns, or inlined UI primitives (button,
  card, modal, chip, tooltip). Each entry must cite a detection
  heuristic (#1–#5) and a target file.

## Files

- [README.md](./README.md)
- [optimization-report.md](./optimization-report.md)

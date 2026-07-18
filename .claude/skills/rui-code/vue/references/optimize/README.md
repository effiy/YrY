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
- **Component Extraction Opportunities** — how an extraction entry
  looks inside a report (two extra fields: `Detection:` and
  `Target:`). The full detection logic, decision tree, priority
  rubric, and signal catalog live in
  [component-identification.md](../extract/component-identification.md);
  the transformation recipe, naming, slot-vs-prop, CSS scoping,
  risk, edge cases, testing, multi-extraction order, decision
  tree (single SFC vs 4-file pattern), and before/after cookbook
  live in
  [component-extraction.md](../extract/component-extraction.md).
  The optimization report is the *where* to flag it; the extract
  topic is the *how* to do it. Triggers: 3+ repeated markup
  blocks, local reactive state owned by a region of the template,
  > 3 levels of nesting *and* > 30 lines, mixed concerns, or
  inlined UI primitives (button, card, modal, chip, tooltip).
  Each entry must cite a detection heuristic (#1–#5) and a target
  file.

## Files

- [README.md](./README.md)
- [optimization-report.md](./optimization-report.md)

## See also

- [Component Extraction](../extract/README.md) — first-class
  reference for identifying candidates and executing the refactor.
  Read this when an extraction entry has been flagged and you need
  to actually do the work.

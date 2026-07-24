# Optimization Page Report (Vue 3 SFC)

An **optimization report** is what you produce when the user asks "what
can I improve on this page?" — as opposed to a **code review** (which
catches *correctness* issues). The two overlap, but the framing is
different:

- A **code review** answers: *Is this code correct against the rules?*
- An **optimization report** answers: *What would make this faster,
  smaller, more maintainable, or more accessible — and how much would
  it cost to ship?*

When the user asks for "an optimization report" or "a page report" or
"a list of things I can improve," use this template. When they ask
"review my code," use the [code-review-checklist](../review/code-review-checklist.md)
instead.

## Report shape

A complete report has seven sections. The first three are mandatory;
the last four are recommended.

```markdown
# Optimization Report — <Page or Component Name>

> One-line summary of the component and its responsibility.

**Files reviewed:** `<list of paths>`
**Generated against:** yry-html-vue v<skill version>
**Total opportunities:** <N>  (Blocker: <b> · Major: <m> · Minor: <k> · Nit: <i>)

## 1. Executive Summary
- Top 3 wins, ordered by impact-per-effort.
- One-line statement of overall health (e.g. "Ship-ready; 2 minor
  performance tweaks recommended").

## 2. Performance Opportunities
Per-opportunity entry, grouped by sub-area:
  - Render / re-render frequency
  - Bundle size / code splitting
  - Network / hydration
  - Animation cost

## 3. Maintainability Opportunities
  - Type safety
  - Composable structure
  - Naming & contracts

## 4. Component Extraction Opportunities

Inline chunks that should be their own component. Every entry cites
a detection heuristic (#1–#5) and a target file. The full
detection logic (decision tree, priority rubric, signal catalog,
triage matrix) lives in
[component-identification.md](../extract/component-identification.md);
the transformation recipe, naming, slot-vs-prop, CSS scoping,
risk, edge cases, testing, multi-extraction order, and
before/after cookbook live in
[component-extraction.md](../extract/component-extraction.md).
This section covers only *how to report it* (the entry shape).

## 5. Accessibility Opportunities
  - Keyboard / focus
  - ARIA
  - Color & contrast (only when CSS is in scope)

## 6. Risk & Effort Matrix
A small table mapping each opportunity to (effort, impact, risk).

## 7. Suggested Sprint Slice
The smallest coherent set of changes that yields a measurable win.
```

## Component Extraction Opportunities (report entry shape)

The detection heuristics (#1–#5) and the "when NOT to flag" rules
live in [component-identification.md](../extract/component-identification.md);
do not duplicate them here. This section covers only the *report
entry shape* — what an extraction opportunity looks like inside a
page report.

An extraction entry follows the standard opportunity format with
two extra fields:

- **`Detection:`** — which heuristic (1–5) flagged the chunk.
  This is what makes the entry falsifiable; "this feels too big" is
  not a detection.
- **`Target:`** — where the new component should live (folder path
  and component name). A reader should be able to start typing
  without re-thinking the file layout.

A worked report entry for heuristic #1 is below; the remaining four
heuristics each have a before/after in
[component-extraction.md § Cookbook](../extract/component-extraction.md#cookbook).

### Worked report entry — heuristic #1

```markdown
### Extract `MetricTile` from the dashboard header — Major

**Location:** `pages/Dashboard.vue:18-72`
**Category:** Maintainability
**Effort:** S
**Impact:** Medium
**Detection:** #1 (3+ repeats), #4 (mixed concerns)
**Target:** `components/MetricTile.vue` (single SFC; no 4-file split
needed — this is leaf UI, not a doc page)

**Why it matters**
The same 12-line tile markup (`<div class="metric">…<span class="metric__label">…
</span><span class="metric__value">…</span>…`) appears three times in
the header. Duplication means any visual tweak (icon size, label
color, spacing) has to ship three times; the second tile has already
drifted (missing `aria-label`), and the third uses a slightly
different class for the trend arrow.

**Fix**
Pull the markup into `components/MetricTile.vue` and replace the
three inline copies with a single `v-for` over a `metrics` array.
Keep the props contract minimal — `label: string`, `value: string`,
`icon?: string`, `trend?: 'up' | 'down' | 'flat'`. No emits needed
unless a click target is required; if it is, prefer `defineModel`
over a custom event. Full step-by-step recipe in
[component-extraction.md § Transformation recipe](../extract/component-extraction.md#transformation-recipe).

**Verification**
- Visual diff is zero (the three rendered tiles are pixel-identical
  before and after — use a screenshot diff in Storybook or
  Playwright).
- Vue DevTools component count for this page drops from 1 (host) to
  4 (1 host + 3 tiles), and the `MetricTile` subtree has its own
  inspectable state.
- The `aria-label` audit now passes on all three tiles with one
  change instead of three.
- Bundle size: confirm the new component is tree-shaken into the
  dashboard chunk (it should be — no async boundary needed).

**Reference**
[component-extraction.md](../extract/component-extraction.md)
```

## Opportunity entry format

Every concrete opportunity follows this structure so the reader can scan
the report quickly:

```markdown
### <Short verb-led title> — <Severity>

**Location:** `<file>:<line range>`
**Category:** Performance | Maintainability | Accessibility | Correctness
**Effort:** XS | S | M | L
**Impact:** High | Medium | Low

**Why it matters**
One or two sentences connecting the issue to a measurable outcome (fewer
re-renders, smaller bundle, fewer SSR hydration mismatches, etc.).

**Fix**
A short code snippet or a one-paragraph description of the change.
Reference the canonical doc, e.g. "see
[perf-v-once-v-memo-directives.md](../../perf/perf-v-once-v-memo-directives.md)".

**Verification**
How to confirm the fix actually worked — a profile, a Lighthouse run, a
unit test, a `console.time` measurement, etc.
```

> **For Component Extraction entries (§ Component Extraction
> Opportunities), add two more fields after `**Impact:**`:**
> - `**Detection:** #N` (one or more of the five heuristics above)
> - `**Target:** path/to/NewComponent.vue`

## Severity anchors

Reuse the same anchors as the [code-review-checklist](../review/code-review-checklist.md):

| Severity | Anchor for the report |
|---|---|
| **Blocker** | Ship-stopper — correctness, security, or SSR leak. The report must lead with these. |
| **Major** | Visible user impact (perceived slowness, broken keyboard flow) or compounding tech debt. |
| **Minor** | Worthwhile but not urgent. Bulk of an optimization report lives here. |
| **Nit** | Style and consistency; surfaced at the end so they can be triaged out. |

## Effort anchors

| Effort | Meaning |
|---|---|
| **XS** | One-line change; no test impact. |
| **S** | One-file change; one or two tests to add. |
| **M** | Multi-file, single component subtree. Needs review. |
| **L** | Architectural — touches shared composables, plugins, or build config. |

## Impact anchors

| Impact | Meaning |
|---|---|
| **High** | User-visible on the current page (TTI, LCP, jank). |
| **Medium** | Pay-it-forward: reduces future work or unblocks another optimization. |
| **Low** | Locality is good but the win is bounded. |

## Risk & Effort matrix

The matrix is a one-screen overview that lets a reader decide what to
ship first without re-reading the whole report.

```markdown
| Opportunity | Effort | Impact | Risk | Priority |
|---|---|---|---|---|
| Replace `ref` with `shallowRef` on `items` | XS | Medium | Low | P1 |
| Virtualize the 5,000-row table | M | High | Medium | P1 |
| Add `errorComponent` to the async chart | XS | Medium | Low | P2 |
| Extract `MetricTile` from the dashboard header | S | Medium | Low | P1 |
| Split `useDashboard.ts` into 3 composables | M | Low | Medium | P3 |
```

Priority is `P1` (do this sprint), `P2` (next sprint), `P3` (backlog).

## What NOT to put in a report

- Speculative micro-optimizations (e.g. "swap `for` to `for...of` for a
  0.1 ms win") — measure first, then report.
- Generic advice not tied to the actual files reviewed.
- Reproductions of the entire SKILL.md ruleset. Cite the doc, don't
  duplicate it.
- Praise. Save positive callouts for the verbal hand-off; the report
  is for actionable signal.
- **Unjustified extraction entries** — "this could be a component"
  with no detection heuristic and no target file is a refactor wish,
  not a report item. If you can't cite one of the five heuristics,
  drop the entry.

## Worked example (abbreviated)

```markdown
### Hoist `v-for` inline handler to a named method — Major

**Location:** `components/OrderTable.vue:42-58`
**Category:** Performance
**Effort:** XS
**Impact:** High

**Why it matters**
A new function is created on every render and every row, defeating
Vue's compiled template caching and inflating render cost on a 1k-row
table.

**Fix
```vue
<script setup lang="ts">
function selectOrder(id: string) { /* ... */ }
</script>
<template>
  <Row v-for="o in orders" :key="o.id" :order="o" @select="selectOrder(o.id)" />
</template>
```

**Verification**
Profile with Vue DevTools' performance tab before/after; expect ~30 %
reduction in render time on the 1k-row dataset.

**Reference**
[perf-avoid-component-abstraction-in-lists.md](../../perf/perf-avoid-component-abstraction-in-lists.md)
```


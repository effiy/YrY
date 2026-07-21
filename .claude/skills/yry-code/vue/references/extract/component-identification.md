---
name: component-identification
description: First-class reference for spotting inline code that should become its own SFC. Pairs with component-extraction.md (which owns the refactor). Covers the 5 falsifiable detection heuristics, a 6-question identification decision tree, a priority scoring rubric (impact × frequency × risk), a comprehensive signal catalog (regex / ripgrep / structural / smell), a scan workflow, an identification checklist, and a triage matrix for when multiple heuristics fire on the same chunk.
---

# Component Identification — Spot Extraction Candidates

> One skill for one job: **recognize** inline code that wants to be
> a component. The refactor itself lives in
> [component-extraction.md](./component-extraction.md) — read this
> doc to *find* candidates, read that doc to *fix* them.

## Read this when

- The user asks "is this component too big?", "should I extract
  this?", "any duplication here?", "what should I split?".
- You are scanning a Vue codebase for extraction candidates and need
  a mechanical way to surface them rather than vibes.
- An optimization report or code review needs extraction entries
  with falsifiable detections (rule 18 of the parent skill).
- You want to know which candidate to extract *first* (priority).

## Routing

| Question you have | Section |
|---|---|
| "What counts as an extraction candidate?" | [§ Detection heuristics](#detection-heuristics) |
| "How do I figure out which heuristic applies?" | [§ Identification decision tree](#identification-decision-tree) |
| "I have several candidates — which one first?" | [§ Priority scoring rubric](#priority-scoring-rubric) |
| "What concrete code should make me look twice?" | [§ Signal catalog](#signal-catalog) |
| "How do I scan a whole codebase mechanically?" | [§ Scan workflow](#scan-workflow) |
| "Multiple heuristics fired on the same chunk — which wins?" | [§ Triage matrix](#triage-matrix) |
| "Give me a checklist I can run by hand." | [§ Identification checklist](#identification-checklist) |
| "What is NOT a candidate?" | [§ Falsifiers](#falsifiers) |

---

## Detection heuristics

The five heuristics below are **falsifiable** rules. Every detection
in a report or review must cite the matching number(s) in its
`**Detection:**` field. "This feels too big" is not a detection.

### #1 — Repeated structural pattern

The same markup block (card, list row, metric tile, form field
group, sidebar item, table cell pattern) appears **3+ times** in
the same template, either inside a single `v-for` or in sibling
sections.

**Why 3, not 2:** two repeats can be coincidence. Three is a
pattern — and the third copy is where the first drift shows up (a
missing class, an inconsistent prop, a different `aria-label`).

**Falsifier:** if the 3 copies diverge in *structure* (not just
content), they are different components that happen to share a
name; do not extract.

### #2 — Local reactive state

A region of the template owns its own `ref` / `reactive` state — a
boolean toggle, a counter, a form value, a focus target — but is
currently expressed as inline `v-if` branches, watchers, or event
handlers in the host SFC.

**The tell:** you can name a piece of state that "belongs to" a
specific region of the template, and that region's lifecycle (when
it appears, when it disappears, what resets it) is decoupled from
the host. If you can write `useThingState()` and the host never
mentions `thing` again, extract.

**Falsifier:** if reading the local state from inside a parent
`computed` / `watch` is required, the state is shared, not local —
lift it, don't extract it.

### #3 — Nesting + size threshold

A single branch of the template is **more than 3 levels deep** *and*
holds **more than ~30 lines** of markup. Either alone is fine; both
together signal a missing component boundary.

**Why both:** a 30-line flat list is readable inline. A 5-level deep
6-line block is also readable. A 30-line block you have to keep
*un-folding* in your head is the smell.

**Falsifier:** if the nesting is forced by a CSS class hierarchy
rather than template structure, fix the CSS first.

### #4 — Mixed concerns

A single SFC has two visually distinct regions that have their own
state, props contract, and styles, but no real shared logic. The
tells:

- Editing one region's tests forces re-running the other's tests.
- The two regions communicate only via shared imports (a common
  composable, a common store), not via each other's APIs.
- The CSS file has a section break (`/* ── Section A ── */` /
  `/* ── Section B ── */`) and the two halves never reference each
  other's classes.

**Falsifier:** if the two regions share a non-trivial `computed` or
`watch` that reads from both, they are one region with a long body,
not two regions.

### #5 — Reusable UI primitive inlined

A button, card, modal, chip, tooltip, badge, list item, or input
pattern is re-implemented with raw markup — `class="btn btn-primary"`
pasted into 6 different files — instead of being a shared component.

**Falsifier:** if the markup is in exactly one place and has no
event handlers, no internal state, and no styles of its own, a CSS
class on a native element is cheaper than a new component.

---

## Identification decision tree

Heuristics alone are not enough. When you look at a chunk and ask
"is this a candidate?", work through these 6 questions **in order**.
The first "yes" gives you the heuristic.

```
Q1. Does the same structural block appear 3+ times?
    (same opening tag + same class, or v-for rows of 6+ lines)
    ├─ YES → heuristic #1
    └─ NO  → Q2

Q2. Is there a piece of state (ref / computed / watch / effect)
    that is only read/written inside one region of the template?
    ├─ YES → heuristic #2
    └─ NO  → Q3

Q3. Is the region more than 3 levels deep AND more than 30 lines?
    ├─ YES → heuristic #3
    └─ NO  → Q4

Q4. Does one SFC hold two regions with their own state and styles
    that share only an import (not each other's APIs)?
    ├─ YES → heuristic #4
    └─ NO  → Q5

Q5. Is a button/card/chip/modal/badge pattern pasted across
    3+ files (or 3+ sibling sites in the same file)?
    ├─ YES → heuristic #5
    └─ NO  → not a candidate — stop.

Q6 (always). Is the pattern in exactly ONE place AND it has no
    state, no events, and no styles of its own?
    ├─ YES → not a candidate — use a CSS class instead.
    └─ NO  → re-check Q1–Q5; one of them applies.
```

**Why this order:** Q1 is the most obvious and the most likely
false-positive if the three copies are in fact different shapes.
Q2 catches the state-isolation case before size, because a 10-line
state-owning region is still a candidate. Q3 is the "I cannot read
this anymore" smell. Q4 is the "two pages stuck together" smell.
Q5 is the "we copy-pasted a button" smell. Q6 is the falsifier
gate that prevents pure presentational wrappers from becoming
components.

**If two heuristics fire on the same chunk:** see
[§ Triage matrix](#triage-matrix) below.

---

## Priority scoring rubric

Candidates are not equal. A #1 that fixes 9 copies of drift beats a
#3 that just makes a deep file easier to read. Score every
candidate on three axes; multiply to get a priority number. Order
your backlog by the product (descending).

### Axes

| Axis | 1 (low) | 2 (med) | 3 (high) |
|---|---|---|---|
| **Impact** — how many bugs / drift / churn does the fix remove? | A single duplicated region (cosmetic dedup) | 2 visible drift symptoms (inconsistent class, missing key) | 3+ drift symptoms, or one *correctness* bug, or a list-render perf issue |
| **Frequency** — how many call sites / rows will benefit? | 1 site (one-off) | 2–4 sites / 5–50 rows | 5+ sites / 50+ rows |
| **Risk** — how likely is the extraction to regress something? | New SFC, no shared state, isolated styles (1) | Needs prop / event wiring but no shared state (2) | Needs `provide` / `inject`, or moves a `watch` / lifecycle, or is in a hot list (3) |

**Priority score** = Impact × Frequency × Risk. Range: 1 (low) to
27 (high). Anything ≥ 12 is "do first"; 6–11 is "do second"; ≤ 5 is
"do when nothing else is hot."

### Worked example

A `StatCard` inlined 6 times across `Dashboard.vue` and
`Analytics.vue` (#1) with visible drift in `aria-label` and a
shared `useStats()` read:

- Impact: 2 (drift already visible in 2 places) → **2**
- Frequency: 6 sites → **3**
- Risk: 2 (prop wiring, no shared state) → **2**
- **Priority = 2 × 3 × 2 = 12 → do first.**

A 40-line 4-level deep `v-if` block inside one SFC (#3) that has
no shared state and no other call sites:

- Impact: 1 (readability only) → **1**
- Frequency: 1 site → **1**
- Risk: 1 (isolated) → **1**
- **Priority = 1 → do when nothing else is hot.**

### When to revise a score

- If a candidate's "1 site" turns out to be "1 site *today*, 4 sites
  next quarter" — bump Frequency to 2.
- If the extraction forces you to define 5+ props — bump Risk to 3
  and *re-think the data model first*.
- If a candidate surfaces a correctness bug (e.g. `<div @click>` is
  missing keyboard handling) — promote Impact to 3 immediately,
  regardless of the cosmetic count.

---

## Signal catalog

Prose heuristics are easy to forget. The catalog below is what to
*grep for* — concrete code patterns that mean "stop, look at this."
Organized by heuristic, with a final cross-cutting table for
"patterns that look like extractions but aren't."

### Per-heuristic signals

| Heuristic | Signal | How to spot it |
|---|---|---|
| #1 | Same opening tag + same class repeated | `rg -c '<div class="card"' *.vue` returning ≥ 3, **or** `v-for="x in xs"` followed by 8+ lines of repeated markup |
| #1 | Three sibling sections with the same `<header>`/`<h3>`/`<span>` structure | Visual scan: three blocks of 10+ lines that are line-for-line identical except for the bound values |
| #1 | Long copy-paste of the same wrapper around different content | Two `<div class="modal-overlay">…</div>` blocks in the same file with the only diff being the inner markup |
| #2 | Region-local `ref` + matching `v-if` / `v-show` toggle | `const isOpen = ref(false)` plus `v-if="isOpen"` or `v-show="isOpen"` confined to one template region |
| #2 | Region-local `ref` reset on a specific event | `xxx.value = false` called only from one event handler in one region |
| #2 | A `computed` whose dependencies are all declared in one section | Trace: if all 3 source refs are local to the candidate region, the computed moves with it |
| #2 | A `watch` whose source ref is declared in one section and whose effect touches the same section's DOM | The lifecycle follows the region — move the `watch` with the extraction |
| #3 | Single `<template>` branch > 30 lines | Visual: indent past 3 levels for 30+ lines |
| #3 | `v-if="x"` wrapping a 40-line block | The branch itself is a candidate |
| #3 | Indent of 16+ spaces at the deepest leaf | `rg -n '^\s{16,}<[a-z]+' --type vue` |
| #4 | Two visually distinct regions in one SFC | CSS file has two top-level class groups that never cross-reference |
| #4 | Region A's tests break when region B's CSS changes | The integration test for A mounts the whole SFC |
| #4 | A `// ── Section A ──` / `// ── Section B ──` divider in a single file | The author already partitioned the file mentally — confirm the parts don't share logic |
| #4 | A 250+ line SFC with no clear shared state between halves | File size alone is *not* a #4 signal, but combined with the absence of cross-region reads it is |
| #5 | `class="btn btn-primary"` or `class="chip"` pasted in N files | `rg -rn 'class="btn btn-primary"' src/ \| wc -l` returning ≥ 3 |
| #5 | `<button @click="...">` + same icon + same 5-line wrapper repeated | Three sibling buttons with identical wrappers |
| #5 | Manual `tabindex="0"` + `@keydown.enter` + `@keydown.space` on a `<div>` | Should be a real `<button>` — flag as both accessibility *and* primitive-inlined |
| #5 | `class="(card\|chip\|badge\|modal\|tooltip)\b` in 3+ files | `rg -c 'class="(card\|chip\|badge\|modal\|tooltip)\b' src/` filtered for count ≥ 3 |

### Cross-cutting patterns (look like X, actually Y)

| Pattern | Looks like | Actually is |
|---|---|---|
| Three `<div>` with `class="row"` siblings | #1 repeated pattern | CSS-only — add `.row` to a shared class, do not extract |
| One `ref` read from two template regions | #2 local state | Shared state — lift, do not extract |
| A 50-line `<template>` that is a single flat list | #3 nesting + size | Already fine; consider `v-memo` or virtualization instead (see [perf-virtualize-large-lists.md](../perf/perf-virtualize-large-lists.md)) |
| Two SFCs that import the same composable | #4 mixed concerns | Correct shared-utility usage; not an extraction signal |
| A `class="btn"` count of 3 across 3 files, but each one has 1+ unique modifier | #5 inlined primitive | A near-duplicate — flag but mark "low confidence" because the modifier is divergent |
| A region with 4 props and a single event | any heuristic | Healthy SFC boundary — do not extract further |
| A `<template>` chunk that has 0 refs, 0 events, 0 dynamic classes | any heuristic | Pure presentational wrapper — use a CSS class instead |

---

## Scan workflow

When you do not already know where the candidates are, follow this
4-pass workflow. Each pass has a different blast radius. Run
passes 1 and 2 unconditionally; run 3 and 4 only when the first
two come up empty.

### Pass 1 — Per-file signal sweep (cheap, noisy)

For every `.vue` / `.html` file, count the most-repeated opening
tags + class combos. High counts (> 3) are #1 / #5 candidates.

```sh
# Top 20 most-repeated opening tags + class combos across the repo
rg -o '<[a-z]+ class="[a-z][a-z0-9_-]+"' --no-filename \
   | sort | uniq -c | sort -rn | head -20
```

```sh
# Files with the most repeated class on a single tag (top 10)
rg -c '<[a-z]+ class="[a-z][a-z0-9_-]+"' --type vue --type html \
   | awk -F: '{print $2, $1}' | sort -rn | head -10
```

### Pass 2 — Per-template structure scan (medium cost, high signal)

Find `v-for` blocks of 6+ lines and deep (≥ 4 levels) template
branches. These are #1 and #3 candidates.

```sh
# v-for blocks > 6 lines (rough heuristic for repeated row)
rg -nU --multiline-dotall \
   'v-for="[^"]+"[^>]*>\s*\n((?:\s{4,}<[^\n]+\n){6,})' \
   --type vue
```

```sh
# Deep template leaves (16-space indent = 4 levels of 4-space nesting)
rg -n '^\s{16,}<[a-z]+' --type vue
```

### Pass 3 — Local-state scan (cost = a code review, high precision)

For every `<script setup>` block, list the `ref` / `reactive` /
`computed` / `watch` declarations and trace their *only call
sites*. If every read + write of a ref happens inside one template
region, it's a #2 candidate.

```sh
# All ref declarations across the repo
rg -n 'const \w+ = ref\(' --type vue -A 1
```

Then by hand: for each `ref`, open the host file and confirm that
the only read sites are inside one contiguous template region.

### Pass 4 — Cross-file primitive scan (cheap, requires judgment)

Find primitive-looking class strings that span multiple files. A
class that appears 3+ times in 3+ files is a #5 candidate.

```sh
# Buttons / cards / chips / modals hardcoded across files
rg -n 'class="btn(-[a-z]+)?\b' --type vue --type html
rg -n 'class="(card|chip|badge|modal|tooltip)\b' --type vue --type html
rg -c 'class="(card|chip|badge|modal|tooltip)\b' --type vue --type html \
   | awk -F: '$2 >= 3'
```

A line ending in `:N` where `N ≥ 3` is a primitive that wants to
be a component. **Then open the matching files by hand and
confirm structural sameness** — the count alone is not enough (see
the "near-duplicate" row in the cross-cutting table above).

### Pass output → report entry

Every hit from a pass becomes one entry in the report's
"Component Extraction Opportunities" section, in the form
prescribed by [optimization-report.md](../optimize/optimization-report.md):

- `**Detection:**` — `#1` / `#2` / … (or two numbers if two
  heuristics fired).
- `**Confidence:**` — High (signal-catalog direct match) / Medium
  (signal + visual confirmation) / Low (signal alone, no manual
  read).
- `**Priority:**` — score from the rubric above.
- `**Target:**` — folder + component name (use the naming guidance
  in [component-extraction.md § Naming convention](./component-extraction.md#naming-convention)).

---

## Triage matrix

When 2+ heuristics fire on the same chunk, pick the dominant one
and let the others sharpen the entry. Use this table.

| Heuristics fired | Dominant | How to report it | What changes in the refactor |
|---|---|---|---|
| #1 + #2 | #1 | "Repeated 4×; the 2nd–4th copies each own their own toggle." | The new SFC takes the toggle as a `defineModel` or as an `isOpen` prop. |
| #1 + #3 | #1 | "Repeated 5× inside a deep branch." | Extract the repeated row first; if the host is still 4+ levels deep, follow up with a second extraction. |
| #1 + #5 | #5 | "Primitive inlined 3+ times across files." | Treat as primitive extraction; the new SFC lives under `components/ui/`, not `components/feature/`. |
| #2 + #3 | #2 | "Region owns its state and is 4 levels deep." | The state is the *reason* to extract; the depth is the trigger. |
| #2 + #4 | #2 | "Two regions, each owns its own state, no shared logic." | Two SFCs out of one. |
| #3 + #4 | #4 | "Two regions, both 4+ levels deep." | The host becomes a thin composer; each region is its own SFC. |
| #1 + #2 + #3 | #1 | "Repeated 3+ times, each copy owns its state, each copy is 4+ levels deep in its host." | This is *the* high-priority case. Score is ≥ 18; do first. |

When no heuristic dominates, pick the one whose falsifier is
*least* violated. For example, a chunk that scores both #1 and #5
but where the 3 copies have *different* `aria-label`s — the #1
falsifier ("if the 3 copies diverge in structure") is closer to
firing than the #5 falsifier ("in exactly one place"). So
**report as #1** and explicitly note the `aria-label` drift as
the impact.

---

## Identification checklist

A 7-step manual pass for a single SFC. Run it top-to-bottom on
every file you are about to flag.

- [ ] **Q1 — Repeated markup.** Does the same opening tag + class
      combo appear 3+ times in this file (or 3+ times across files
      for #5)? If yes → #1.
- [ ] **Q2 — Local state.** Trace every `ref` / `reactive` / `watch`
      in `<script setup>`. Are any of them only read + written in
      one template region? If yes → #2.
- [ ] **Q3 — Deep + large.** Find the deepest template leaf. Is
      it past 3 levels *and* past 30 lines? If yes → #3.
- [ ] **Q4 — Mixed regions.** Read top-to-bottom. Are there two
      visually distinct regions with no shared logic between them?
      If yes → #4.
- [ ] **Q5 — Primitive pasted.** Are `class="btn …"` /
      `class="card"` / `class="chip"` / `class="modal"` strings
      repeated 3+ times across files? If yes → #5.
- [ ] **Q6 — Falsifier gate.** Is the candidate in exactly one
      place with no state, no events, and no styles of its own? If
      yes → not a candidate, use a CSS class.
- [ ] **Score.** Apply the priority rubric. Sort the backlog by
      product (descending). Anything ≥ 12 is "do first."

A blank row is *not* a candidate. Stop and move on.

---

## Falsifiers

A "candidate" that trips any of these is **not** an extraction —
it is something else. Drop it from the report.

- **One occurrence, no state, no events, no styles** → CSS class
  on a native element. Cheaper than a new SFC.
- **In a hot list (≥ 100 rows)** → extraction adds a render
  boundary per row; flatten or virtualize instead (see
  [perf-avoid-component-abstraction-in-lists.md](../perf/perf-avoid-component-abstraction-in-lists.md)
  and
  [perf-virtualize-large-lists.md](../perf/perf-virtualize-large-lists.md)).
- **Already inside a 4-file doc page** → re-evaluate within the
  doc-page pattern (see
  [component-pattern-spec.md](../pattern/component-pattern-spec.md));
  a leaf UI inside a doc page usually does *not* warrant a new
  doc page itself.
- **Was extracted 2 PRs ago and is still being reshaped** → wait
  for it to stabilize before pulling it apart again.
- **5+ props or a deep `provide` / `inject` chain** → the coupling
  is the smell; refactor the data first (see
  [component-extraction.md § Step 3](./component-extraction.md#step-3--define-the-props-contract)).
- **Two regions share a non-trivial `computed` or `watch`** → they
  are one region with a long body, not two regions (#4 falsifier).

---

## Cross-references

- [component-extraction.md](./component-extraction.md) — the
  refactor side: 7-step recipe, decision tree, cookbook, risk,
  edge cases, verification.
- [optimization-report.md](../optimize/optimization-report.md) —
  the report template; the `Detection:` / `Target:` fields
  required for every entry are defined there.
- [code-review-checklist.md](../review/code-review-checklist.md) —
  the review checklist; extraction entries appear here under
  "Maintainability".
- [component-pattern-spec.md](../pattern/component-pattern-spec.md) —
  4-file pattern, used when the new component is a doc page.
- [perf-virtualize-large-lists.md](../perf/perf-virtualize-large-lists.md) —
  when the right fix is virtualization, not extraction.
- [perf-avoid-component-abstraction-in-lists.md](../perf/perf-avoid-component-abstraction-in-lists.md) —
  when extraction in a hot list is the wrong move.

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

# Component Extraction — Refactor

> One skill for one job: **ship** a clean refactor that turns an
> inline chunk into its own SFC. The detection side — "is this a
> candidate?" — lives in
> [component-identification.md](./component-identification.md).
> The optimization report still owns *whether* an extraction is
> worth flagging; this doc owns *how* the extraction is actually
> done.

## Read this when

- The user asks "extract this into a component", "refactor into a
  component", "split out a component", "split into a component",
  "make this reusable", "this is duplicated — pull it out".
- An optimization report or code review contains a Component
  Extraction entry and you need to actually execute the refactor.
- You have already identified a candidate (via the decision tree
  in [component-identification.md](./component-identification.md))
  and need to know the next step.
- You need a slot-vs-prop decision, a CSS scoping fix, or a risk
  classification for an extraction that is not in the cookbook.

## Routing

| Question you have | Section |
|---|---|
| "What name should the new component have?" | [§ Naming convention](#naming-convention) |
| "Should this be a prop or a slot?" | [§ Slot vs prop decision matrix](#slot-vs-prop-decision-matrix) |
| "What CSS scoping pitfalls are there?" | [§ CSS scoping pitfalls](#css-scoping-pitfalls) |
| "How risky is this extraction?" | [§ Risk classification](#risk-classification) |
| "What about SSR / KeepAlive / Teleport / async?" | [§ Edge cases](#edge-cases) |
| "How do I test the extraction?" | [§ Testing the extraction](#testing-the-extraction) |
| "I have several extractions to do — in what order?" | [§ Multi-extraction order](#multi-extraction-order) |
| "What are the steps?" | [§ Transformation recipe](#transformation-recipe) |
| "Single-file SFC or 4-file pattern?" | [§ Single-file SFC vs 4-file pattern](#single-file-sfc-vs-4-file-pattern) |
| "Show me a before/after." | [§ Cookbook](#cookbook) |
| "When should I *not* extract?" | [§ Anti-patterns](#anti-patterns) |
| "How do I find candidates across a codebase?" | [§ Scanning a codebase](#scanning-a-codebase) |
| "How do I confirm the refactor is correct?" | [§ Verification](#verification) |
| "What counts as an extraction candidate?" (detection side) | [component-identification.md](./component-identification.md) |

---

## Detection heuristics (summary)

The five heuristics below are the same ones the
[optimization-report.md](../optimize/optimization-report.md) and
[component-identification.md](./component-identification.md) use.
They are restated here in 1-line form so you can re-classify a
candidate mid-refactor. For the full falsifiable rules, signal
catalog, priority rubric, and decision tree, read the
identification doc.

| # | Heuristic | 1-line test |
|---|---|---|
| 1 | Repeated structural pattern | Same opening tag + same class, 3+ times |
| 2 | Local reactive state | A `ref` / `computed` / `watch` is read + written only inside one template region |
| 3 | Nesting + size | > 3 levels deep **and** > ~30 lines |
| 4 | Mixed concerns | One SFC with two regions, no shared logic, only shared imports |
| 5 | Reusable UI primitive inlined | A button/card/chip/modal class pasted in 3+ files |

**The full identification decision tree lives in
[component-identification.md § Identification decision tree](./component-identification.md#identification-decision-tree).**
Use that doc to *find* candidates; this doc assumes you have
already found one.

---

## Signal catalog (cross-link)

The full signal catalog — per-heuristic patterns + the
"looks-like-but-isn't" cross-checks — lives in
[component-identification.md § Signal catalog](./component-identification.md#signal-catalog).
Use it during a scan; reach for it here only when you need to
re-classify a candidate mid-refactor.

---

## Naming convention

A name is part of the contract. Three rules cover ~95% of cases.
When in doubt, prefer a *narrower* name over a *broader* one — you
can always generalize later when a second use shows up.

### Rule 1 — PascalCase, no digits, no separators

Component names use `PascalCase`. Do not put numbers, dashes, or
underscores in them. The reason is structural: Vue's component
resolution treats `<foo-bar>` and `<FooBar>` as equivalent in the
template, but the *file* name and the *import* name must match —
so pick one spelling and use it everywhere.

| Bad | Good | Why |
|---|---|---|
| `metric-tile-1` | `MetricTile` | Digits in names force re-numbering when the list grows. |
| `btn_primary` | `PrimaryButton` | Underscores in component names look like CSS classes. |
| `UserCard2` | `UserCard` | The "2" is a smell — it usually means there are two shapes that should be one. |

### Rule 2 — Feature prefix for feature components, generic name for primitives

This is the single most useful naming decision you will make.

| Kind | Folder | Naming | Example |
|---|---|---|---|
| **Feature** — represents a domain concept (`UserCard`, `OrderItem`, `InvoiceHeader`) | `components/<feature>/` or `components/` | `[Noun][Role]` where `Role` is the UI role it plays | `UserCard`, `OrderItem`, `InvoiceHeader` |
| **Primitive** — represents a UI element (`Button`, `Card`, `Modal`, `Chip`, `Badge`) | `components/ui/` or `components/` | The element's name, optionally with a variant suffix | `Button`, `PrimaryButton`, `Modal`, `StatusChip` |
| **Layout** — composes other components (`PageHeader`, `Sidebar`, `DashboardGrid`) | `components/layout/` or `components/` | `[Noun]` that names the area, not the contents | `PageHeader`, `Sidebar`, `DashboardGrid` |

**How to decide:**

- If the new component is a *version* of a thing the user already
  knows (`Card` containing user data → `UserCard`), name it after
  the thing: `UserCard`.
- If the new component *replaces* a CSS class pasted across files
  (`class="btn btn-primary"` → `<PrimaryButton>`), name it after
  the element + variant: `PrimaryButton`.
- If the new component *composes* other components into a layout
  region (`<header>`, `<aside>`, `<section>`), name it after the
  region: `PageHeader`, `Sidebar`.

**Anti-patterns to avoid:**

- **`Base` / `Common` / `Shared` prefix.** `BaseButton` is a
  nothing-name — every component is "base" for something. If
  it is generic, call it `Button`; if it is feature-specific,
  call it `PrimaryButton` or `UserCard`.
- **`Wrapper` suffix.** `ModalWrapper` is almost always a sign
  that you have not found the right boundary yet. The wrapper is
  either the `Modal` itself (and the host should compose it
  directly) or it owns its own state and should be named after
  what it does (`ConfirmDialog`, not `ModalWrapper`).
- **`Component` / `Vue` suffix.** `UserCardComponent.vue` is
  redundant. The `.vue` extension already says it.
- **Re-exporting.** Do not define a `Card.vue` that re-exports
  `UserCard.vue` so consumers can `import { Card } from`. Pick
  one name and use it.

### Rule 3 — The name should survive being read out of context

The strongest naming test: open the host file 6 months from now,
find `<UserCard>` in a list, and decide what it does **without
opening the file**. If the name alone does not tell you, the
component is doing too much — split it before merging.

---

## Slot vs prop decision matrix

This is the most-asked question during a refactor: "the new
component needs to render `<img>` AND a label AND a button — is
each a prop, or are they slots?" Use the matrix below.

| You need the host to inject… | Use… | Example |
|---|---|---|
| A *value* (string, number, boolean) | **Prop** | `:status="item.status"`, `:count="12"` |
| A *bounded choice* (an enum, a variant) | **Prop** with a typed union | `variant: 'primary' \| 'secondary'` |
| A *whole element* (an icon, an avatar) at a fixed position | **Named slot** (or a prop accepting a `Component` / VNode) | `#icon`, `#avatar` |
| *Arbitrary content* at a position the new component chooses | **Default `<slot />`** | `<Card>...arbitrary host markup...</Card>` |
| *One of several* possible contents (e.g. "header OR empty state") | **Named slot with fallback** | `#header` / `#empty` |
| A two-way binding to a single value | **`defineModel`** (rule 5) | `v-model="search"` |
| A two-way binding to one of several values | **Named `defineModel`** | `defineModel('search')` |
| A *callback* (the host wants to be notified, not render) | **Emitted event** | `@select="onSelect"`, `@dismiss="onDismiss"` |
| A *reusable wrapper* that just composes other components | **Slots, no props** | `<PageHeader><h1>Title</h1></PageHeader>` |

### Decision rule of thumb

> **If the new component is choosing *what* renders, use slots.**
> **If the host is choosing *what* renders, use props.**

If you find yourself wanting a `:content` prop that takes a
`string | VNode | Component | () => h(...)`, you are describing a
slot. Stop and write a `<slot />`.

### Slot composition: default + named, and what to fallback

Most leaf components want this shape:

```vue
<template>
  <div class="card">
    <header v-if="$slots.header" class="card__header">
      <slot name="header" />
    </header>
    <div class="card__body">
      <slot />  <!-- default -->
    </div>
    <footer v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

- The `v-if="$slots.xxx"` wrapper means the `<header>`/`<footer>`
  DOM only exists when the host actually fills the slot. No
  empty wrapper divs.
- Define the slot names with `defineSlots<{ header(): unknown;
  footer(): unknown }>()` so the host's `<template #header>` is
  type-checked.

### When `defineModel` is the wrong answer

`defineModel` is for **a single value with a single writer** —
the host owns the value, the child reads + writes it. Do not use
`defineModel` when:

- The "value" is a *bag* of fields (use props + emits).
- The child owns the value (use local state + emits).
- The value comes from a shared store (use the store directly).

---

## CSS scoping pitfalls

`<style scoped>` is the default. It is also the #1 source of
"the extraction broke the styles" bugs. The pitfalls below are
the recurring ones.

### Pitfall 1 — Parent selector reach

`<style scoped>` adds a `[data-v-xxx]` attribute to every
element in the new component. The host's CSS, which targets
*its own* scoped children, cannot reach the new component's
DOM.

**Symptom:** after the extraction, the host's `> .row` or
`.card + .card` rules silently no longer apply.

**Fix:** if the new component must participate in the host's
layout (e.g. it is a flex child of a host flex container), pass
the relevant class as a prop, or use `:deep()` from the host to
the child:

```css
/* in the host's <style scoped> */
.parent :deep(.child__inner) { /* … */ }
```

**Better fix:** rewrite the host's layout to put the new
component *between* flex/grid items, so the new component owns
its own internal layout and the host's layout applies to the
outer wrapper.

### Pitfall 2 — Global selectors inside `<style scoped>`

Bare element selectors (`a`, `button`, `p`) inside a scoped
style leak globally because Vue's scoping attribute is added
*after* the selector is parsed. The fix is to *always* prefix
with a class:

```css
/* bad — leaks to every <button> on the page */
button { color: red; }

/* good — scoped to this component */
.card__button { color: red; }
```

### Pitfall 3 — `v-html` content

A `v-html`-injected subtree contains the host's scoping
attribute, *not* the new component's. Styles inside the new
component will not apply to the `v-html` content.

**Fix:** if the new component renders `v-html`, the related
styles must be global (in a non-scoped `<style>` block) or
injected via inline styles.

### Pitfall 4 — Animation / transition classes

`Transition` / `TransitionGroup` add classes like
`.fade-enter-active` *to the child component's root*. The
classes are applied at the transition's *parent* scope, so the
new component's scoped styles will not match.

**Fix:** define the transition's `.enter-active` /
`.leave-active` classes in the host's style block, or in a
shared (non-scoped) `transitions.css`. Do not bury them in the
extracted component's scoped block.

### Pitfall 5 — `:slotted` for parent-injected content

When the host injects markup via `<slot />`, the *child's*
scoped CSS does not reach that markup (the markup is in the
host's scope, not the child's). To style slot content, use
`:slotted()`:

```css
/* in the new component's <style scoped> */
.card :slotted(p) { margin: 0; }
```

### Pitfall 6 — CSS custom properties crossing the boundary

`--my-token` defined on the host cascades *into* the new
component (this is the right behavior). But a custom property
defined on the new component's *root* does not leak back up to
the host. If the host needs to read a value computed by the
child, use an emitted event or a `defineExpose`-d ref, not a
CSS variable.

### Pre-flight CSS checklist

Before merging the extraction, walk this list:

- [ ] No bare-element selectors inside `<style scoped>` (Pitfall 2).
- [ ] No host's flex/grid rules broken by the new boundary (Pitfall 1).
- [ ] No `v-html` in the new component (Pitfall 3) — if present,
      document the global styles it depends on.
- [ ] No `Transition` / `TransitionGroup` classes buried in
      scoped blocks (Pitfall 4).
- [ ] Slot content styles use `:slotted()` (Pitfall 5).
- [ ] No CSS variable assumed to flow upward (Pitfall 6).

---

## Risk classification

Not every extraction is equal. Before starting, classify the
extraction's risk so the review (and the rollback plan) matches
the blast radius.

### Low risk

- New SFC, no shared state, isolated styles.
- The candidate is heuristic #1, the new component is a pure
  leaf UI, and there are no `watch` / `onMounted` / lifecycle
  hooks to migrate.
- No change to the data flow (props are passed straight through,
  no new `provide` / `inject`).

**Review depth:** 1 reviewer, single-PR.

### Medium risk

- Needs prop / event wiring but no shared state.
- The candidate is heuristic #2 / #3 with a local `ref` to
  migrate; or heuristic #5 across multiple files (cross-file
  ripple).
- The new component lazy-loads (`defineAsyncComponent`).
- The new component introduces a new `slot` with `:slotted()`
  styles.

**Review depth:** 1 reviewer + visual diff in Storybook /
Playwright.

### High risk

- The extraction forces 5+ props or a deep `provide` / `inject`
  chain.
- A `watch` is being moved and its trigger timing changes
  (e.g. the new component mounts later than the host).
- The extraction is inside a hot list (≥ 100 rows).
- The extraction interacts with `<KeepAlive>` (state must
  survive unmount) or `<Teleport>` (the boundary crosses DOM
  roots).
- The host uses SSR / Nuxt, and the new component's lifecycle
  (especially `onMounted` with DOM access) is order-dependent.

**Review depth:** 2 reviewers (correctness + performance), full
test suite, staged rollout (feature-flag the import).

### Risk-down checklist

When a candidate looks high-risk, see if any of these bring it
back to medium:

- **5+ props → 1 group object.** Bundle related props into a
  single `:config` object; still pass through, but the
  signature is shorter.
- **Deep `provide` / `inject` → composable.** A composable
  (`useThing()`) called by both host and child is often
  cleaner than `provide` / `inject`.
- **`watch` moves → `watch` source clarifies.** Once the new
  component owns the ref, the `watch` source becomes
  unambiguous; the timing question often goes away.
- **Hot list → flatten the row.** See
  [perf-avoid-component-abstraction-in-lists.md](../perf/perf-avoid-component-abstraction-in-lists.md).

---

## Edge cases

The cookbook covers 90%. The 10% below are real cases that
*will* come up.

### Edge 1 — `defineAsyncComponent` for the new component

If the new component is large or rarely used, lazy-load it:

```ts
// host
import { defineAsyncComponent } from 'vue'
const UserCard = defineAsyncComponent({
  loader: () => import('./components/UserCard.vue'),
  delay: 200,  // rule 8
})
```

The new component itself stays a normal SFC. Apply rule 8
(200ms delay) — see
[component-async.md](../async/component-async.md).

### Edge 2 — `<KeepAlive>` interaction

If the host wraps the new component in `<KeepAlive>` and the
new component owns local state, the state must survive
unmount/remount. This is the *correct* use of `<KeepAlive>` —
no change to the extraction beyond confirming:

- `onActivated` / `onDeactivated` hooks (if any) live inside
  the new component, paired with `onScopeDispose` if they
  register listeners.
- The new component does not store *host-owned* state in its
  local refs (that would be a state-flow bug, not a KeepAlive
  bug).

If the new component is wrapped in KeepAlive but its state
*should not* survive remount, that is a different bug — flag
it, do not silently fix it in the extraction.

### Edge 3 — `<Teleport>` for modals and overlays

If the new component is a modal, the *rendered* DOM usually
needs to escape the host (so the host's `overflow: hidden`
does not clip it). Use `<Teleport to="body">` *inside* the new
component:

```vue
<!-- components/Modal.vue -->
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal" @click.self="$emit('close')">
      <slot />
    </div>
  </Teleport>
</template>
```

This is one of the few cases where the new component owns
*where* it renders, not just *what* it renders. Confirm with
the host that the `body` teleport target is OK; some embedded
contexts (Shadow DOM, iframes) require a different target.

### Edge 4 — `provide` / `inject` boundary

If the candidate region needs a value that the host provides
(via `provide` + `InjectionKey<T>`), the new component can
`inject` it directly. **This is fine** — do not pass the value
through props just to "be safe." Rule 6 says use `InjectionKey`
for typing; the extraction is consistent with that.

**Risk:** the `provide` site is in the host, but the `inject`
site is now in the child. If the host stops providing, the
child fails. Mitigation: define the default at the inject site
(`inject(myKey, defaultValue)`) when possible; otherwise
document the contract.

### Edge 5 — SSR / Nuxt context

Server-side rendering has two traps:

1. **`onMounted` does not run on the server.** If the new
   component has a `useIntersectionObserver` (or any DOM-only
   composable) inside `onMounted`, it is fine — but a
   side-effect composable called at the top of `<script setup>`
   (not inside a lifecycle hook) will run on the server and
   fail. Move it to `onMounted` if the extraction triggers
   this. See
   [reactivity.md](../reactivity/reactivity--reactivity.md) and
   [state-management.md](../state/state-management.md).
2. **Singleton state leaks across requests.** If the new
   component uses a `createGlobalState`-style singleton
   (counter, in-memory cache), it persists across SSR requests
   and leaks data between users. Prefer Pinia for SSR-safe
   shared state (rule 13).

### Edge 6 — Slots whose presence controls class names

When the host injects a slot, the new component sometimes
wants to render a class only when the slot is filled (e.g. a
border under `<header>`). Use `useSlots()` (or
`$slots` in templates) — see
[component-slots.md](../slots/component-slots.md):

```vue
<header v-if="$slots.header" class="card__header">
  <slot name="header" />
</header>
```

### Edge 7 — The component is itself a `defineModel` consumer

If the new component *uses* `defineModel` internally (e.g. it
wraps a third-party input), the host does not need to
`v-model` the new component — it just renders it. But the
*inner* `defineModel` is part of the new component's contract,
not the host's. Document it in the new SFC's `<script setup>`.

### Edge 8 — `defineExpose` for imperative APIs

If the new component owns an imperative action (open / close /
focus / scroll-to), expose it via `defineExpose`:

```ts
defineExpose({ open, close, focusFirst })
```

…and the host uses a `ref` to call it. This is the correct
shape for a modal; do not invent an `autoOpen` prop as a
substitute.

---

## Testing the extraction

An extraction is a refactor, not a behavior change. The test
goal is "the new component, mounted in isolation, behaves
identically to the inline block did in the host."

### Three layers of test

| Layer | What it covers | Tooling |
|---|---|---|
| **Unit** — the new SFC mounted alone | Props, emits, slots, internal state, `defineExpose`d methods | `@vue/test-utils` `mount()` |
| **Integration** — the host + the new SFC together | The host's calls to props / events / slots, the visual layout, the data flow | `@vue/test-utils` `mount()` of the host, with stubs for the new SFC's siblings |
| **Visual** — pixel-level identity before/after | Drift in class names, spacing, focus rings, transitions | Storybook + Chromatic / Playwright screenshot diff |

### What to write for the new SFC

A minimum-viable test file (Vitest + `@vue/test-utils`):

```ts
// components/UserCard.test.ts
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

describe('UserCard', () => {
  it('renders the label and value', () => {
    const wrapper = mount(UserCard, { props: { label: 'Users', value: 42 } })
    expect(wrapper.text()).toContain('Users')
    expect(wrapper.text()).toContain('42')
  })

  it('emits select on click', async () => {
    const wrapper = mount(UserCard, { props: { label: 'Users', value: 42 } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('renders the icon slot when provided', () => {
    const wrapper = mount(UserCard, {
      props: { label: 'Users', value: 42 },
      slots: { icon: '<svg data-testid="icon" />' },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })
})
```

### What to write for the host

A regression test that mounts the host with the new SFC stubbed
(or real) and asserts that the call sites still receive the
right props / emit the right events:

```ts
// Dashboard.test.ts
import { mount } from '@vue/test-utils'
import Dashboard from './Dashboard.vue'
import UserCard from './components/UserCard.vue'

it('passes user count to the first UserCard', () => {
  const wrapper = mount(Dashboard)
  const cards = wrapper.findAllComponents(UserCard)
  expect(cards[0].props('value')).toBe(/* expected */)
})
```

### What NOT to test in the extraction PR

- The new component's *styling* — that is a separate visual-diff
  test in a separate PR.
- The new component's *perf* — that is a separate benchmark
  PR.
- The host's other regions that the extraction did not touch
  — they should already be covered.

If you find yourself writing more than 1 unit test file for the
new SFC, the extraction is probably doing too much — split it
further before merging.

### Mutation-test sanity check

If the repo uses Stryker / mutmut, run a mutation pass on the
new SFC after merging. A healthy extraction has > 70% mutation
score; if it is < 50%, the new tests are not exercising the
contract.

---

## Multi-extraction order

When you have a backlog of 3+ extractions, do them in the
order below. This minimizes merge conflicts, rollback blast
radius, and review fatigue.

### Order rule 1 — Leaf first, host last

Extract the **innermost** components first. The host is the
last thing to change. This way every intermediate state
compiles and renders.

**Example backlog:**

1. `OrderLineItem` (innermost — has its own state, 3 call sites)
2. `OrderTotals` (composes `OrderLineItem` indirectly via props)
3. `OrderHeader` (independent of the other two)
4. `OrderDetail` (the host — splits the three sections out)

Doing them in this order means after step 1 the host still
works (just with one inline block replaced by `<OrderLineItem>`).
After step 4, the host is a thin composer.

### Order rule 2 — Lowest risk first

When extractions are independent, do the lowest-risk ones
first. This lets you ship value early and builds reviewer
confidence in the pattern before the hard ones land.

### Order rule 3 — Don't bundle

Resist bundling. If the heuristic was #1, do *not* also rename
the state, switch from Options API to Composition API, and
convert CSS to scoped tokens in the same PR. Each is a
separate review unit. A reasonable PR size is "1 heuristic
applied to 1 host, with the corresponding tests."

### Order rule 4 — Heuristic #4 (mixed concerns) splits the host

When you have a #4 candidate, the new SFCs come out *first* and
the host becomes a thin composer *last*. Do not try to "shrink
the host by 200 lines" in one PR; the host shrinks by the sum
of the child SFCs you extract, and the host's final shape only
becomes visible after the children land.

### Order rule 5 — Heuristic #5 (primitives) goes first, even if it's scary

A `Button` extraction touches the most files. Do it *first* in
the multi-extraction sequence: it is the highest-leverage win
(every later extraction can use the new `Button`), and its
diff is large but mechanical, which makes it reviewable.

### Recommended PR sequence (worked example)

Backlog from a Dashboard:

| # | Heuristic | Component | Risk | Why this order |
|---|---|---|---|---|
| 1 | #5 | `PrimaryButton` (4 sites) | Med | Highest leverage, touches most files, mechanical |
| 2 | #5 | `StatusBadge` (3 sites) | Low | Re-uses #1's `Button`-style review pattern |
| 3 | #1 | `StatCard` (5 sites) | Med | Independent of #1, #2 |
| 4 | #2 | `HelpModal` (1 site) | Med | One call site, but defines the modal Teleport pattern |
| 5 | #3 | `OrderDetail` split (3 children) | High | Depends on #3 / #4 components existing |
| 6 | #4 | `Settings` split (3 sections) | High | Last — host becomes a composer |

Open 6 PRs. Each is reviewable in isolation. None of them
require a flag-day merge.

---

## Transformation recipe

Once a heuristic has fired, do the refactor in this order. Skipping a
step is how extractions end up with 8 props and a `provide` chain.

### Step 1 — Identify the boundaries

Mark the smallest contiguous template region that satisfies the
detection heuristic. The boundaries are:

- **Inside:** the template region + the `<script setup>` bindings
  it reads + the `index.css` selectors that target it.
- **Outside:** the rest of the host SFC.

Write a 1-sentence contract for the inside: "`<Thing>` renders a
single item, shows X, fires `Y` on `Z`." If you can't write that
sentence, you don't have a clean boundary yet — go back to
heuristic #2 / #4 and re-check.

### Step 2 — Decide single-file SFC vs 4-file pattern

See the [decision tree](#single-file-sfc-vs-4-file-pattern) below.
For 90% of extractions the answer is **single-file SFC**.

### Step 3 — Define the props contract

List every value the region reads from the host. Each one is either:

- a **prop** (the value is data; the host owns it),
- an **emitted event** (the region owns the trigger; the host owns
  the consequence),
- **local state** (the value is owned by the region itself; nothing
  in the host needs to read it),
- a **slot** (the host injects markup into the region),
- or **shared state** (a composable, `provide`/`inject`, or a Pinia
  store — lift it explicitly, do not pass through props).

**Rule of thumb:** if extracting would force you to define **5+
props** or a deep `provide` / `inject` chain, the coupling is the
smell — refactor the data first, *then* extract.

**Prefer `defineModel` over `value` + `update:value`** for any
two-way binding (rule 5; see
[component-data-flow.md](../data-flow/component-data-flow.md)).

### Step 4 — Migrate state

For each `<script setup>` binding the region reads:

| Was | Becomes |
|---|---|
| `ref` read by both region and host | **Lift to host**, pass as prop |
| `ref` read only by the region | **Move into the new component** (local state) |
| `computed` reading region-local data | **Move into the new component** |
| `computed` reading host data | **Stay in host**, pass result as prop (or accept that it's now in the new component and recompute there if pure) |
| `watch` on a region-local `ref` | **Move into the new component** — the lifecycle follows the region |
| `watch` on host data | **Stay in host** |
| `onMounted` doing DOM stuff on the region's element | **Move into the new component** — its `templateRef` is local now |
| Side-effect composable (`useEventListener`, `useIntersectionObserver`, …) on the region's element | **Move into the new component** + pair with `onScopeDispose` / `tryOnScopeDispose` (rule 7; see [composables.md](../composables/composables.md)) |

### Step 5 — Decide emits contract

The region fires events in only three legitimate shapes:

- `update:modelValue` — only when using `defineModel`.
- A named semantic event — `@select`, `@dismiss`, `@submit` — with a
  typed payload via `defineEmits<{ select: [id: string] }>()`.
- No event at all — the parent doesn't need to know.

**Avoid** raw `update:xxx` events outside of `defineModel`. Avoid
events that re-emit parent props back to the parent (circular).

### Step 6 — Write the new file

Skeleton for the common case (single-file leaf UI):

```vue
<!-- components/MetricTile.vue -->
<script setup lang="ts">
interface Props {
  label: string
  value: string
  icon?: string
  trend?: 'up' | 'down' | 'flat'
}
const props = withDefaults(defineProps<Props>(), { trend: 'flat' })
</script>

<template>
  <div class="metric-tile" :data-trend="trend">
    <span v-if="icon" class="metric-tile__icon">{{ icon }}</span>
    <span class="metric-tile__label">{{ label }}</span>
    <span class="metric-tile__value">{{ value }}</span>
  </div>
</template>

<style scoped>
.metric-tile { /* ... */ }
</style>
```

If the component is a doc page rather than leaf UI, use the
[4-file pattern](../pattern/component-pattern-spec.md) instead.

### Step 7 — Replace the inline block in the host

- Import the new component.
- Replace the inline region with `<MetricTile :label="…" :value="…" />`
  (or, for #1, a `v-for` over the data array).
- Delete the now-unused `<script setup>` bindings, the CSS rules
  that targeted the old region, and any dead imports.
- Re-run typecheck and the visual diff (see
  [§ Verification](#verification)).

### Step 8 — Don't refactor more than the heuristic flagged

Resist bundling. If the heuristic was #1, do *not* also rename the
state, switch from Options API to Composition API, and convert CSS
to scoped tokens in the same PR. Each is a separate review unit.

---

## Single-file SFC vs 4-file pattern

This is a recurring decision. Use the tree below.

```
Is the new component a doc page (lives in the sidebar, has a
`window.XXX_CONFIG` data source, mounts via `mountDocComponent`)?
├── YES → 4-file pattern
│         (see component-pattern-spec.md)
└── NO  → Is the component a leaf UI primitive (no data source,
          no slot for a sidebar, no `data-include`)?
          ├── YES → single-file SFC under `components/`
          │         with `<style scoped>`
          └── NO  → Is it an interactive artifact (its own
                    `index.html`, self-contained)?
                    ├── YES → 4-file pattern + standalone entry
                    └── NO  → single-file SFC; re-evaluate
                              next time you touch it
```

**Quick rule:** if the answer to "where does the data come from?"
is "a `data.js` flat object loaded by `include.js`," it's 4-file.
Otherwise it's a single-file SFC.

---

## Cookbook

One before/after for each heuristic. Each entry is the minimum
diff — the real refactor may also need to migrate types, fix CSS
specificity, or update tests; those are out of scope here.

### #1 — Repeated structural pattern (3+ cards)

**Before** — same card markup three times, drift starting:

```vue
<!-- Dashboard.vue -->
<template>
  <section class="dashboard">
    <div class="card">
      <h3>Users</h3><p>{{ stats.users }}</p>
    </div>
    <div class="card">
      <h3>Revenue</h3><p>${{ stats.revenue }}</p>
    </div>
    <div class="card" aria-label="orders">
      <h3>Orders</h3><p>{{ stats.orders }}</p>
    </div>
  </section>
</template>
```

**After** — one `StatCard.vue`, driven by a `v-for`:

```vue
<!-- components/StatCard.vue -->
<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>
<template>
  <div class="stat-card" :aria-label="label">
    <h3 class="stat-card__label">{{ label }}</h3>
    <p class="stat-card__value">{{ value }}</p>
  </div>
</template>
```

```vue
<!-- Dashboard.vue -->
<template>
  <section class="dashboard">
    <StatCard
      v-for="s in statsList" :key="s.key"
      :label="s.label" :value="s.value"
    />
  </section>
</template>
<script setup lang="ts">
import StatCard from '@/components/StatCard.vue'
const statsList = [
  { key: 'users',   label: 'Users',   value: stats.users },
  { key: 'revenue', label: 'Revenue', value: `$${stats.revenue}` },
  { key: 'orders',  label: 'Orders',  value: stats.orders }
]
</script>
```

`aria-label` is now consistent across all three — the drift is gone.

### #2 — Local reactive state (a region-owned toggle)

**Before** — the modal open/close state lives in the host even
though only the modal region uses it:

```vue
<!-- Page.vue -->
<script setup lang="ts">
const isHelpOpen = ref(false)
</script>
<template>
  <main>
    <button @click="isHelpOpen = true">Help</button>
    <p>Page content…</p>
  </main>
  <div v-if="isHelpOpen" class="modal" @click.self="isHelpOpen = false">
    <p>How to use this page.</p>
    <button @click="isHelpOpen = false">Close</button>
  </div>
</template>
```

**After** — modal owns its own state, host doesn't know about it:

```vue
<!-- components/HelpModal.vue -->
<script setup lang="ts">
const isOpen = ref(false)
function open() { isOpen.value = true }
function close() { isOpen.value = false }
defineExpose({ open })
</script>
<template>
  <button class="help-trigger" @click="open">Help</button>
  <Teleport to="body">
    <div v-if="isOpen" class="modal" @click.self="close">
      <p>How to use this page.</p>
      <button @click="close">Close</button>
    </div>
  </Teleport>
</template>
```

```vue
<!-- Page.vue -->
<template>
  <main>
    <p>Page content…</p>
    <HelpModal ref="help" />
  </main>
</template>
```

### #3 — Nesting + size (a deep branch)

**Before** — a single 40-line, 4-level deep `v-if` block:

```vue
<template>
  <div class="order-detail" v-if="order">
    <div class="order-detail__header">
      <h2>Order #{{ order.id }}</h2>
      <span :class="['badge', `badge--${order.status}`]">
        {{ order.status }}
      </span>
    </div>
    <div class="order-detail__body">
      <div class="order-detail__line-items">
        <div v-for="line in order.lines" :key="line.id" class="line">
          <span class="line__name">{{ line.name }}</span>
          <span class="line__qty">×{{ line.qty }}</span>
          <span class="line__price">${{ line.price }}</span>
          <span v-if="line.note" class="line__note">{{ line.note }}</span>
        </div>
      </div>
      <div class="order-detail__totals">
        <!-- 12 more lines of subtotal / tax / shipping / total markup -->
      </div>
    </div>
  </div>
</template>
```

**After** — split into three components; the host drops to 8 lines:

```vue
<!-- components/OrderHeader.vue, OrderLineItem.vue, OrderTotals.vue -->
```

```vue
<template>
  <OrderHeader v-if="order" :order="order" />
  <OrderLineItems v-if="order" :lines="order.lines" />
  <OrderTotals v-if="order" :totals="order.totals" />
</template>
```

### #4 — Mixed concerns (two regions, no shared logic)

**Before** — `Settings.vue` does profile + billing + notifications
in one 280-line SFC; the three regions share only the import of
`useUser()`.

```vue
<template>
  <h1>Settings</h1>
  <ProfileSection />
  <BillingSection />
  <NotificationsSection />
</template>
```

**After** — each section is its own SFC, the host composes them:

```
components/settings/
├── Settings.vue           # composes the three
├── ProfileSection.vue
├── BillingSection.vue
└── NotificationsSection.vue
```

The host is now responsible for *layout*, the children for
*behavior*. Tests can target one region without mounting all three.

### #5 — Reusable UI primitive inlined (button everywhere)

**Before** — `<button class="btn btn-primary">` pasted into 9 files
with no shared component:

```vue
<button class="btn btn-primary" @click="save">Save</button>
<button class="btn btn-primary" @click="submit">Submit</button>
<button class="btn btn-primary" @click="confirm">Confirm</button>
```

**After** — one component, one CSS source of truth:

```vue
<!-- components/PrimaryButton.vue -->
<script setup lang="ts">
defineProps<{ disabled?: boolean }>()
defineEmits<{ click: [] }>()
</script>
<template>
  <button
    class="primary-button"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
```

```vue
<PrimaryButton @click="save">Save</PrimaryButton>
<PrimaryButton :disabled="!valid" @click="submit">Submit</PrimaryButton>
```

The new component gets `loading` state, `aria-busy`, focus ring,
and keyboard handling for free once they live in one place.

---

## Anti-patterns

Skip the extraction when *any* of these is true:

- **Single occurrence.** The pattern is in exactly one place. Don't
  pre-optimize for hypothetical reuse — pay the cost of the new
  component now, earn the benefit later when a second use shows up.
- **5+ props or a deep `provide` chain.** The coupling is the smell,
  not the inline form. Refactor the data first.
- **Inside a hot list.** ≥ 100 rows in a `v-for`? Extraction adds a
  render boundary per row and inflates render cost. Flatten the row
  inline instead, or virtualize the list (see
  [perf-virtualize-large-lists.md](../perf/perf-virtualize-large-lists.md)
  and
  [perf-avoid-component-abstraction-in-lists.md](../perf/perf-avoid-component-abstraction-in-lists.md)).
  Extraction is fine when the list is small (< ~20) or already
  virtualized.
- **Pure presentational wrapper.** A "component" with no state, no
  events, and no styles of its own is just a CSS class on a native
  element. A `<div class="card">{{ slot }}</div>` is not worth a
  new SFC; a `<div class="card metric-tile">` is.
- **Re-extraction churn.** The region was extracted 2 PRs ago and
  is still being reshaped. Wait for it to stabilize before pulling
  it apart again.

---

## Scanning a codebase

When you don't already know where the candidates are, these
ripgrep patterns surface them. Run from the project root.

### Find #1 candidates — repeated markup

```sh
# Find the most-repeated opening tags + class combos
rg -o '<[a-z]+ class="[a-z][a-z0-9_-]+"' --no-filename \
   | sort | uniq -c | sort -rn | head -20
```

```sh
# Find v-for blocks > 6 lines (rough heuristic for repeated row)
rg -nU --multiline-dotall \
   'v-for="[^"]+"[^>]*>\s*\n((?:\s{4,}<[^\n]+\n){6,})' \
   --type vue
```

### Find #2 candidates — region-local state

```sh
# A ref that's only ever toggled in one template region
rg -n 'const \w+ = ref\(' --type vue -A 1
# then visually confirm the matching v-if / v-show is local
```

### Find #3 candidates — deep + large

```sh
# Count template depth per file (rough)
rg -n '^\s{16,}<[a-z]+' --type vue
# 16-space indent = 4 levels of 4-space nesting; flag for review
```

### Find #5 candidates — inlined primitives

```sh
# Buttons / cards / chips / modals hardcoded across files
rg -n 'class="btn(-[a-z]+)?\b' --type vue --type html
rg -n 'class="(card|chip|badge|modal|tooltip)\b' --type vue --type html
rg -n 'class="(card|chip|badge|modal|tooltip)\b' --type vue --type html -c \
   | awk -F: '$2 >= 3'
```

A line ending in `:N` where `N ≥ 3` is a primitive that wants to be
a component.

---

## Verification

Every extraction must be verifiable. Run these checks before
closing the PR.

### Functional

- [ ] Visual diff is zero for the extracted region (screenshot diff
      in Storybook / Playwright).
- [ ] No new console warnings or Vue devtools errors.
- [ ] Typecheck passes; props and emits are typed end-to-end.
- [ ] All existing tests pass without modification (extraction is
      refactor, not behavior change).

### Structural

- [ ] Vue devtools component count increases by exactly 1 per
      extracted instance (host + N children, not host + 1 wrapper
      + N children).
- [ ] The new SFC has its own inspectable state — confirm in devtools.
- [ ] The new SFC's `<style scoped>` does not leak (no `:deep()` to
      bare elements; no global selectors).
- [ ] No unused `<script setup>` bindings remain in the host (the
      state migration in Step 4 was complete).

### Performance

- [ ] If the extraction is inside a `v-for`, profile render time
      before/after with Vue devtools performance tab. List
      virtualization is generally a better win; the extraction
      itself should be neutral or positive, never a regression.
- [ ] If the new component lazy-loads (e.g. `defineAsyncComponent`),
      confirm the chunk splits correctly and the delay is ~200ms
      (rule 8; see [component-async.md](../async/component-async.md)).

### Accessibility

- [ ] The new component's interactive elements are real `<button>` /
      `<a>`, not styled `<div>` with `@click` (see
      [code-review-checklist.md §10](../review/code-review-checklist.md)).
- [ ] `aria-label` is consistent across all instances of the
      extracted component (the drift from #1 is now impossible).

---

## Cross-references

- [component-identification.md](./component-identification.md) —
  the detection side: 6-question decision tree, priority scoring
  rubric, signal catalog, scan workflow, identification checklist,
  triage matrix for overlapping heuristics, falsifiers.
- [optimization-report.md](../optimize/optimization-report.md) — where
  extraction entries appear in a page report (severity / effort /
  impact, the 5 heuristics at a glance).
- [code-review-checklist.md](../review/code-review-checklist.md) —
  where extraction signals appear during a correctness review.
- [component-pattern-spec.md](../pattern/component-pattern-spec.md) —
  the 4-file pattern, used when the new component is a doc page.
- [component-data-flow.md](../data-flow/component-data-flow.md) —
  props / emits / `defineModel` / `provide` / `inject` contracts.
- [component-slots.md](../slots/component-slots.md) — slot
  composition, fallbacks, and `useSlots()` reactivity.
- [component-async.md](../async/component-async.md) —
  `defineAsyncComponent`, delay, hydration strategies.
- [component-keep-alive.md](../builtin/component-keep-alive.md) —
  state survival across unmount; `onActivated` / `onDeactivated`.
- [component-teleport.md](../builtin/component-teleport.md) —
  escaping the host's DOM for modals and overlays.
- [state-management.md](../state/state-management.md) — Pinia,
  plugin `install()`, SSR-safe singletons.
- [perf-avoid-component-abstraction-in-lists.md](../perf/perf-avoid-component-abstraction-in-lists.md) —
  when extraction is the *wrong* move because the list is hot.
- [perf-virtualize-large-lists.md](../perf/perf-virtualize-large-lists.md) —
  the better fix for long lists.
- [composables.md](../composables/composables.md) — for state
  migration: `onScopeDispose` / `tryOnScopeDispose` hygiene.


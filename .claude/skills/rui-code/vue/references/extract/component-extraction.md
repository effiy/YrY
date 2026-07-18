---
name: component-extraction
description: First-class reference for identifying inline code that should become its own SFC and for the mechanical refactor that produces a clean extraction. Covers the 5 detection heuristics, a concrete signal catalog, the transformation recipe, the single-file SFC vs 4-file pattern decision, a 5-entry before/after cookbook, anti-patterns, and ripgrep scanning patterns.
---

# Component Extraction — Identify & Refactor

> One skill for two related jobs: **spot** inline code that should be a
> component, then **ship** a clean refactor. The optimization report
> still owns *whether* an extraction is worth flagging; this doc owns
> *how* the extraction is actually done.

## Read this when

- The user asks "extract this into a component", "refactor into a
  component", "split out a component", "split into a component",
  "make this reusable", "this is duplicated — pull it out".
- An optimization report or code review contains a Component
  Extraction entry and you need to actually execute the refactor.
- You are scanning a Vue codebase for extraction candidates and need
  a concrete signal catalog (regex/AST patterns, repeated markup
  counts, etc.) instead of vibes.

## Routing

| Question you have | Section |
|---|---|
| "What counts as an extraction candidate?" | [§ Detection heuristics](#detection-heuristics) |
| "What concrete code should make me look twice?" | [§ Signal catalog](#signal-catalog) |
| "I've decided to extract — what are the steps?" | [§ Transformation recipe](#transformation-recipe) |
| "Single-file SFC or 4-file pattern?" | [§ Single-file SFC vs 4-file pattern](#single-file-sfc-vs-4-file-pattern) |
| "Show me a before/after." | [§ Cookbook](#cookbook) |
| "When should I *not* extract?" | [§ Anti-patterns](#anti-patterns) |
| "How do I find candidates across a codebase?" | [§ Scanning a codebase](#scanning-a-codebase) |
| "How do I confirm the refactor is correct?" | [§ Verification](#verification) |

---

## Detection heuristics

The five heuristics below are the same ones the
[optimization-report.md](../optimize/optimization-report.md) uses, but
stated as *falsifiable* rules. Every extraction entry in a report or
review must cite the matching number(s) in its `**Detection:**`
field. "This feels too big" is not a detection.

### #1 — Repeated structural pattern

The same markup block (card, list row, metric tile, form field group,
sidebar item, table cell pattern) appears **3+ times** in the same
template, either inside a single `v-for` or in sibling sections.

**Why 3, not 2:** two repeats can be coincidence. Three is a pattern
— and the third copy is where the first drift shows up (a missing
class, an inconsistent prop, a different `aria-label`).

**Falsifier:** if the 3 copies diverge in *structure* (not just
content), they are different components that happen to share a name;
do not extract.

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

## Signal catalog

Prose heuristics are easy to forget. The catalog below is what to
*grep for* — concrete code patterns that mean "stop, look at this."

| Heuristic | Signal | How to spot it |
|---|---|---|
| #1 | Same opening tag + same class repeated | `grep -c '<div class="card"' *.vue` returning ≥ 3, **or** `v-for="x in xs"` followed by 8+ lines of repeated markup |
| #1 | Three sibling sections with the same `<header>`/`<h3>`/`<span>` structure | Visual scan: three blocks of 10+ lines that are line-for-line identical except for the bound values |
| #2 | Region-local `ref` + matching `v-if` / `v-show` toggle | `const isOpen = ref(false)` plus `v-if="isOpen"` or `v-show="isOpen"` confined to one template region |
| #2 | Region-local `ref` reset on a specific event | `xxx.value = false` called only from one event handler in one region |
| #3 | Single `<template>` branch > 30 lines | Visual: indent past 3 levels for 30+ lines |
| #3 | `v-if="x"` wrapping a 40-line block | The branch itself is a candidate |
| #4 | Two visually distinct regions in one SFC | CSS file has two top-level class groups that never cross-reference |
| #4 | Region A's tests break when region B's CSS changes | The integration test for A mounts the whole SFC |
| #5 | `class="btn btn-primary"` or `class="chip"` pasted in N files | `grep -rn 'class="btn btn-primary"' src/ \| wc -l` returning ≥ 3 |
| #5 | `<button @click="...">` + same icon + same 5-line wrapper repeated | Three sibling buttons with identical wrappers |
| #5 | Manual `tabindex="0"` + `@keydown.enter` + `@keydown.space` on a `<div>` | Should be a real `<button>` — flag as both accessibility *and* primitive-inlined |

### Cross-checks (signals that should *not* be conflated)

| Pattern | Looks like | Actually is |
|---|---|---|
| Three `<div>` with `class="row"` siblings | #1 repeated pattern | CSS-only — add `.row` to a shared class, do not extract |
| One `ref` read from two template regions | #2 local state | Shared state — lift, do not extract |
| A 50-line `<template>` that is a single flat list | #3 nesting + size | Already fine; consider `v-memo` or virtualization instead |
| Two SFCs that import the same composable | #4 mixed concerns | Correct shared-utility usage; not an extraction signal |

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

- [optimization-report.md](../optimize/optimization-report.md) — where
  extraction entries appear in a page report (severity / effort /
  impact, the 5 heuristics at a glance).
- [code-review-checklist.md](../review/code-review-checklist.md) —
  where extraction signals appear during a correctness review.
- [component-pattern-spec.md](../pattern/component-pattern-spec.md) —
  the 4-file pattern, used when the new component is a doc page.
- [component-data-flow.md](../data-flow/component-data-flow.md) —
  props / emits / `defineModel` / `provide` / `inject` contracts.
- [perf-avoid-component-abstraction-in-lists.md](../perf/perf-avoid-component-abstraction-in-lists.md) —
  when extraction is the *wrong* move because the list is hot.
- [composables.md](../composables/composables.md) — for state
  migration: `onScopeDispose` / `tryOnScopeDispose` hygiene.

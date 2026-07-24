# Code Review Checklist (Vue 3 SFC)

Use this checklist when reviewing a single `.vue` file or an entire 4-file
component. Each row maps a reviewer question to a rule in the parent skill
and to a canonical reference doc. The goal is a quick, opinionated
first pass — surface real issues, not every conceivable nit.

## How to run a review

1. Read the SFC top-to-bottom. Note every `<script setup>` binding, every
   template binding, every composable call.
2. Walk this checklist in order. For each category, mark items as
   **OK**, **Issue**, or **N/A**.
3. For every **Issue**, cite the exact line and reference the matching
   rule in `SKILL.md` and the deeper doc.
4. End with a short summary: count of issues, severity (blocker / major /
   minor / nit), and the top 3 fixes.

Severity is your judgment, but the anchors below keep it consistent.

## 1. Script Setup & Macros

- [ ] Uses `<script setup lang="ts">` — not Options API, not plain `<script>` (rule 3).
- [ ] No `ref` for primitives that could be `shallowRef` (rule 4; see
      [reactivity.md](../../reactivity/reactivity--reactivity.md)).
- [ ] `defineProps` is type-based or uses `withDefaults` — not runtime array
      syntax (see [script-setup-macros.md](../../core/core--script-setup-macros.md)).
- [ ] `defineEmits` uses named tuple syntax for typed payloads.
- [ ] `defineModel` is used for two-way bindings instead of `update:xxx` +
      local `ref` (rule 5; see
      [component-data-flow.md](../../data-flow/component-data-flow.md)).
- [ ] No `expose` with macros that already provide access (`defineExpose`
      only when needed for cross-tree refs).

## 2. Reactivity

- [ ] Deep reactivity is justified — `shallowRef` for large lists or
      external objects (rule 4).
- [ ] Destructuring from `reactive` is wrapped in `toRef` / `toRefs` —
      destructuring loses reactivity.
- [ ] `computed` used for derived state — not a `watch` that mirrors a
      `ref` (see [reactivity.md](../../reactivity/reactivity--reactivity.md)).
- [ ] `watch` only on sources that actually change; `watchEffect` only when
      dependencies are intentional.
- [ ] Composables side-effects are cleaned up — listener handles in
      `onScopeDispose` / `tryOnScopeDispose` (rule 7;
      see [composables.md](../../composables/composables.md)).
- [ ] No accidental singleton state outside of an explicit
      `createGlobalState` / `createInjectionState` (rule 13;
      see [state-management.md](../../state/state-management.md)).

## 3. Template

- [ ] Every `v-for` has a stable, unique `:key` — never the array index
      for reorderable lists (rule 10).
- [ ] `v-if` and `v-for` are never on the same element (rule 10).
- [ ] `v-html` is not used on user-provided / untrusted content (rule 11).
- [ ] `v-once` / `v-memo` used on truly static or expensive subtrees
      (see [perf-v-once-v-memo-directives.md](../../perf/perf-v-once-v-memo-directives.md)).
- [ ] Long lists are virtualized — `useVirtualList` or equivalent
      (see [perf-virtualize-large-lists.md](../../perf/perf-virtualize-large-lists.md)).
- [ ] Inline arrow handlers in `v-for` are replaced by named handlers
      bound via component abstraction, or at least hoisted
      (see [perf-avoid-component-abstraction-in-lists.md](../../perf/perf-avoid-component-abstraction-in-lists.md)).
- [ ] `onUpdated` is used (not `useAttrs()` reads inside templates) for
      attr-driven side effects (rule 12).

## 4. Data Flow

- [ ] Props are read-only in the child — no assignment to `props.x`
      (rule 5).
- [ ] `provide` / `inject` use `InjectionKey<T>` symbols (rule 6;
      see [component-data-flow.md](../../data-flow/component-data-flow.md)).
- [ ] `v-model` modifiers are explicit and documented
      (see [component-data-flow.md](../../data-flow/component-data-flow.md)).
- [ ] Fallthrough attrs are not duplicated by manual `defineProps`
      declarations (see [component-fallthrough-attrs.md](../../slots/component-fallthrough-attrs.md)).
- [ ] Named slots have a sensible fallback content
      (see [component-slots.md](../../slots/component-slots.md)).

## 5. Async & Built-ins

- [ ] `defineAsyncComponent` with `loadingComponent` whose `delay` is
      ~200ms (rule 8; see [component-async.md](../../async/component-async.md)).
- [ ] `errorComponent` is provided for async components that can fail.
- [ ] `KeepAlive` includes / excludes are intentional and not unbounded.
- [ ] `Transition` / `TransitionGroup` use GPU-friendly `transform` /
      `opacity` (rule 9;
      see [component-transition.md](../../builtin/component-transition.md),
      [component-transition-group.md](../../builtin/component-transition-group.md)).
- [ ] `mode="out-in"` only when the outgoing and incoming nodes need
      sequenced transition — not a default.

## 6. State & Plugins

- [ ] Shared mutable state goes through Pinia for SSR-safety — not
      `createGlobalState` (rule 13; see
      [state-management.md](../../state/state-management.md),
      [plugins.md](../../state/plugins.md)).
- [ ] `app.use(plugin, options)` is the only install path — no direct
      singleton import.
- [ ] Custom directives are limited to low-level DOM access (rule 14;
      see [directives.md](../../directives/directives.md)).
- [ ] `h()` / JSX used only when templates are insufficient (rule 2;
      see [render-functions.md](../../directives/render-functions.md)).

## 7. Animation

- [ ] Animations are GPU-accelerated (`transform` / `opacity`) — not
      layout-triggering properties (rule 9;
      see [animation-state-driven-technique.md](../../animation/animation-state-driven-technique.md)).
- [ ] Class-based animation keyframes have an off-state — no permanent
      stuck-on hover effect (see
      [animation-class-based-technique.md](../../animation/animation-class-based-technique.md)).

## 8. Composables (VueUse)

- [ ] Picked by category, not by name (rule 15).
- [ ] `onScopeDispose` paired with every side-effect composable
      (rule 7).
- [ ] `useStorage` / `useLocalStorage` value is JSON-serializable; custom
      serializer is provided when not.
- [ ] `useEventListener` preferred over manual `addEventListener` +
      `removeEventListener` so cleanup is automatic.

## 9. 4-File Pattern Conformance

If the component follows the
[component-pattern-spec](../../pattern/component-pattern-spec.md):

- [ ] `<template id="xxx-template">` is unique project-wide.
- [ ] `<section id="xxx">` matches a sidebar `href="#xxx"`.
- [ ] `data.js` is loaded before `index.js`.
- [ ] `data.js` is a flat object — no nested constructors, no
      side-effects.
- [ ] `index.js` calls `mountDocComponent(id, ...)` exactly once.
- [ ] `index.css` uses `--yry-doc-*` tokens, never raw `--yry-*` (see
      [css-architecture.md](../../css/css-architecture.md)).
- [ ] Scoped CSS does not leak via `:deep()` to bare elements.

## 10. Accessibility & UX (Vue-flavored)

These are not Vue-specific; flag when reviewing Vue code anyway.

- [ ] Interactive elements are real `<button>` / `<a>` — not styled
      `<div>` with `@click`.
- [ ] `aria-*` attributes are bound reactively, not hard-coded strings.
- [ ] `v-if` removes focusable content from the tab order correctly.

## 11. Component Extraction Signals

The review should flag inline code that should be a standalone SFC
— this is a maintainability win that code review catches before an
optimization report does. Every flag cites one of the five
detection heuristics (#1–#5) and a target file. Full detection
logic, decision tree, priority rubric, and signal catalog in
[component-identification.md](../extract/component-identification.md);
transformation recipe, naming, slot-vs-prop, CSS scoping, risk,
edge cases, testing, multi-extraction order, and before/after
cookbook in
[component-extraction.md](../extract/component-extraction.md).

- [ ] **#1 — Repeated structural pattern:** the same markup block
      appears 3+ times in the template (same opening tag + same
      class, or three siblings line-for-line identical except for
      bound values).
- [ ] **#2 — Local reactive state:** a region of the template owns
      a `ref` / `reactive` whose matching `v-if` / `v-show` is
      confined to that region — extract and let the region own the
      lifecycle.
- [ ] **#3 — Nesting + size:** a single template branch is more
      than 3 levels deep *and* more than ~30 lines.
- [ ] **#4 — Mixed concerns:** two visually distinct regions in one
      SFC share only imports, not behavior; the CSS file has two
      unconnected class groups; editing one region's tests forces
      re-running the other's.
- [ ] **#5 — Reusable UI primitive inlined:** `class="btn"` /
      `class="card"` / `class="chip"` / `class="modal"` / etc.
      pasted into ≥ 3 files; a manual `tabindex="0"` +
      `@keydown.enter` + `@keydown.space` on a `<div>` that should
      be a real `<button>` (also flag in § 10 Accessibility).

When flagging, also confirm none of the anti-patterns apply
(single occurrence, 5+ props, hot list, pure presentational
wrapper) — see
[component-extraction.md § Anti-patterns](../extract/component-extraction.md#anti-patterns).

## Severity anchors

| Severity | Example |
|---|---|
| **Blocker** | `v-html` on untrusted input; missing `errorComponent` for a network-dependent async component; SSR singleton leak |
| **Major** | `v-for` with index key on reorderable list; missing cleanup on `useEventListener`; `v-if` and `v-for` on same element |
| **Minor** | `ref` where `shallowRef` would do; `watchEffect` where `watch` is clearer; missing `delay` on `loadingComponent` |
| **Nit** | Style inconsistency; ordering of imports; comments missing on non-obvious bindings |

## Output shape

When delivering a review, structure it as:

1. **Files reviewed** — paths and SFC count.
2. **Issues by severity** — blockers first, nits last. Each issue lists
   the line range, the rule broken, the reference doc, and a one-line fix.
3. **Positive callouts** — one or two things the SFC does well, to keep
   the review constructive.
4. **Top 3 fixes** — the highest-leverage changes to ship next.


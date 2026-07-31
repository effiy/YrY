---
title: Sortable.create called on null tbody/nav in onMounted, threw "el must be an HTMLElement, not [object Null]" on first mount
key: bug_2026_07_30_sortable_null_el
tags:
- sortable
- runtime
- null-guard
- protable
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: components/ProTable
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (browser runtime)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: sometimes
---

## Description
At runtime the browser console surfaced `Sortable: el must be an HTMLElement, not [object Null]` on first app boot, before any user interaction. The error came from `sortablejs` — `Sortable.create(null, ...)` — and was thrown from two unrelated call sites: (1) `ProTable/index.vue::dragSort` running in `onMounted`, and (2) `Tabs/index.vue::tabsDrop` also running in `onMounted`. Both had hard-coded `document.querySelector(...)` calls cast to `HTMLElement` (non-null) and passed directly to `Sortable.create` with no null guard. On the very first mount of the layout — before any tab had been pushed and before any ProTable instance with a sort column had rendered — the queried selectors returned `null`, and `Sortable.create` aborted.

## Steps to Reproduce
1. `pnpm dev` and open the app.
2. Land on the dashboard route (no tabs yet, or a ProTable without a `type: "sort"` column).
3. Open the browser console.
4. Observe `Unknown error\nSortable: el must be an HTMLElement, not [object Null]` logged once or twice during initial render.
5. The error is non-fatal (the rest of the app keeps running) but it spams the console, masks real errors, and on some routes the Sortable init genuinely fails so drag-sort never works on a table that opted into it.

## Expected Result
`Sortable.create` is only called when the target element actually exists in the DOM, and only on tables/tabs that have opted into drag-sort.

## Actual Result
Every ProTable instance ran `Sortable.create(document.querySelector("#uuid tbody"), ...)` on mount — even tables with no sort column and no `.move` handle — and every layout mount ran `Sortable.create(document.querySelector(".el-tabs__nav"), ...)` before any tab existed.

## Cause
Two separate but isomorphic defects:

1. **ProTable** — `dragSort()` is called unconditionally in `onMounted`, regardless of whether `columns` declares a `type: "sort"` column. The selector `#${uuid.value} tbody` returns the `<tbody>` of the table — which *usually* exists because `el-table` renders it even with no rows — but in the first tick of mount inside a keep-alive route that isn't yet active, or inside a `v-if` tab, the `el-table` internal `<tbody>` hasn't been committed to the DOM yet and the selector returns null. The `as HTMLElement` cast silenced the TypeScript check but didn't change the runtime value. Worse, even when the tbody *does* exist, calling `Sortable.create` on it is pointless if no `sort`-type column exists — there's no `.move` handle to grab.

2. **Tabs** — `tabsDrop()` runs in `onMounted` of the layout's `Tabs` component. On first boot, `initTabs()` (called right after) hasn't yet pushed any tab, so `<el-tabs>` hasn't rendered its internal `.el-tabs__nav` node. The `document.querySelector(".el-tabs__nav")` call returns `null`, and `Sortable.create(null, ...)` throws.

In both cases the root cause is the same shape: a `document.querySelector` in `onMounted` with no null guard, where the selector targets an element rendered by a child component that may not have committed yet.

## Solution
Applied — guarded both call sites:

1. **`components/ProTable/index.vue::dragSort`** — added an early-return when `props.columns` has no `type: "sort"` entry (so tables that don't opt into drag-sort skip the `Sortable.create` call entirely), and a null guard on the `tbody` query (skip silently if not yet in the DOM). Cast changed from `as HTMLElement` to `as HTMLElement | null` so TypeScript also knows about the null path.

2. **`layouts/components/Tabs/index.vue::tabsDrop`** — extracted the `.el-tabs__nav` query to a local `nav` variable, early-return if `null`. The route watcher still re-runs after the first tab is pushed, so drag-sort initializes correctly once the nav exists.

Process follow-up (not yet landed): add an ESLint rule (or a tiny wrapper `safeSortable.create(el, opts)` that early-returns on null) so `Sortable.create` cannot be called with a possibly-null element in the future. Document in `CLAUDE.md` that any `document.querySelector` in `onMounted` must be null-guarded because Vue's mount lifecycle does not guarantee child-component DOM has committed by the time the parent's `onMounted` runs.

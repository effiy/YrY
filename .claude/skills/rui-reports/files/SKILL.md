---
name: rui-report-files
description: >
  Project-wide file-size + dependency-nesting analysis rendered as a
  modular Vue 3 page (4 app modules + 2 lib utilities + 7 components).
  Analyzes scope, emits data.js, opens the report.
  Use /rui-report-files or call scripts/analyze.mjs directly.
---

# rui-report-files

A six-stage static analysis pipeline that produces a self-contained
Vue 3 report page at `docs/reports/files/`. The page is **modular**:
the page-level Vue app is split into `app/state.js`, `app/actions.js`,
`app/lifecycle.js`, `app/mount.js`; the shared low-level helpers live
in `lib/rui-bytes.js` and `lib/rui-sortable.js`; each of the 7 report
sections is a standalone component under `components/rui-report-*/`.

This mirrors the structure of `YiPet/docs/files/` (which uses the same
app/ + lib/ + components/ layout) and applies the rui-tools principle
of inlined canonical snippets — the load order and per-file contract
are documented in this file rather than inferred from a templates/
directory dump.

## Quickstart

```bash
# 1) Run the analyzer — writes data.js AND assembles the full page
#    (inlines 5 shared + 7 report component templates, substitutes
#    {{SHARED_ROOT}} and {{SCOPE_TITLE}}, copies byte-stable assets).
node scripts/analyze.mjs "$(pwd)" docs/reports/files

# 2) Open
open docs/reports/files/index.html   # macOS
xdg-open docs/reports/files/index.html  # Linux
```

The output is self-contained — no build step, no external CDN. The
Vue 3 runtime and the shared `rui-*` components are loaded from a
relative path back to `/.claude/shared/` (computed at build time from
the output directory's depth). All 12 component templates (5 shared +
7 report) are inlined into `index.html` as `<script type="text/x-template">`
blocks so the page works under both `file://` and `http://` — the
shared loader's XHR fetch is bypassed because the templates are
already in the document. All design tokens (`--rui-*`) are defined in
each page's own `index.css` with fallback defaults.

## Pipeline (6 stages — see `scripts/analyze.mjs`)

1. **File Inventory** — Walk scope, collect bytes/lines/type/mtime
2. **Size Distribution** — Directory aggregation, top-N, oversize flags, type breakdown, histogram
3. **Dependency Graph** — Per-language import regex, adjacency list, fan-in/fan-out, hotspot scores
4. **Nesting Depth** — DFS with memoization, max-depth per file, aggregate stats
5. **Cycle Detection** — 3-color DFS, cycle paths with suggested fixes
6. **Freshness** — asOf = max(lastModified), age buckets, top-N stale files

## Output (modular — 4 app modules + 2 lib utilities + 7 components)

The page is byte-stable, copied from `templates/`. The runtime data
(`data.js`) is regenerated every run.

```
docs/reports/files/
├── index.html                 — Vue 3 markup, no inline styles
├── index.css                  — Page-level styles, all extracted from
│                                index.html
├── index.js                   — Thin entry: waits for Vue, then calls
│                                RuiReportApp.mount()
├── data.js                    — REPORT_CONFIG + REPORT_DATA (regenerated)
├── app/                       — Page-level Vue app, split by concern
│   ├── state.js               — data() + computed{} (derived state)
│   ├── actions.js             — methods{} (theme/share/print/export)
│   ├── lifecycle.js           — mounted() + beforeUnmount()
│   └── mount.js               — RuiReportApp.mount() — assembles + boots
├── lib/                       — Small shared utilities
│   ├── rui-bytes.js           — humanBytes + debounce
│   └── rui-sortable.js        — sortBy + setSortMixin (4 components)
└── components/                — 7 section components, each with
                                index.{html,js,css} + data.js (regenerated)
    ├── rui-report-summary/
    ├── rui-report-size/
    ├── rui-report-largest/
    ├── rui-report-coupling/
    ├── rui-report-risk/
    ├── rui-report-health/
    └── rui-report-self-improvement/
```

## File-by-file contract

The byte-stable top-level files (`index.html`, `index.css`, `index.js`)
are documented below as canonical snippets. The `app/`, `lib/`, and
`components/` modules each have a single responsibility — see the
header comment of the actual file for the in-line contract.

### `index.html` — markup only, no `<style>`, no logic

```html
<!DOCTYPE html>
<html lang="en" data-rui-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Files Report — {{SCOPE_TITLE}}</title>
    <meta name="description" content="Vue 3 files report — sorted largest files, coupling analysis, risk files, health metrics.">
    <link rel="icon" href="data:image/svg+xml,…">   <!-- inline SVG, no /favicon.ico -->
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <a class="skip-link" href="#summary">Skip to main content</a>
    <div class="reading-progress" role="progressbar"
         :style="{ width: readingProgress + '%' }" v-cloak></div>

    <!-- Component CSS — order matters: report → coupling/health/.../summary -->
    <link rel="stylesheet" href="components/rui-report-coupling/index.css">
    … (7 components in alphabetical order) …

    <!-- Vue 3 + shared rui-* components — {{SHARED_ROOT}} is substituted
         at build time by analyze.mjs to a relative path from the output
         directory back to /.claude/shared/. Relative paths work under
         both file:// and http://; absolute /.claude/shared/ paths break
         under file:// (they resolve to the filesystem root). -->
    <script src="{{SHARED_ROOT}}/loader.js"></script>
    <script src="{{SHARED_ROOT}}/components/rui-breadcrumb/index.js"></script>
    <script src="{{SHARED_ROOT}}/components/rui-score-bar/index.js"></script>
    <script src="{{SHARED_ROOT}}/components/rui-badge/index.js"></script>
    <script src="{{SHARED_ROOT}}/components/rui-tag-chip/index.js"></script>
    <script src="{{SHARED_ROOT}}/components/rui-back-top/index.js"></script>

    <!-- Inlined component templates — 5 shared + 7 report, each a
         <script type="text/x-template"> block. analyze.mjs reads the
         per-component index.html source files, strips stray
         <script src="index.js"> lines, and substitutes the concatenation
         here. Inlining (vs. fetch) is what makes the page work under
         file:// — fetch/XHR are CORS-blocked on the null origin. -->
    <!-- {{COMPONENT_TEMPLATES}} -->

    <!-- Section component JS — each defines window.ruiReportXxx -->
    <script src="components/rui-report-coupling/index.js"></script>
    … (7 components) …

    <!-- Shared utilities — rui-bytes + rui-sortable -->
    <script src="lib/rui-bytes.js"></script>
    <script src="lib/rui-sortable.js"></script>

    <!-- Runtime data — regenerated by analyze.mjs -->
    <script src="data.js"></script>

    <!-- App modules — assembled into window.RuiReportApp -->
    <script src="app/state.js"></script>
    <script src="app/actions.js"></script>
    <script src="app/lifecycle.js"></script>
    <script src="app/mount.js"></script>
    <script src="index.js"></script>

    <div id="page-app" v-cloak>
        <header>…</header>
        <details class="read-helper">…</details>
        <nav id="toc">…</nav>
        <div class="risk-banner">…</div>
        <div class="key-findings">…</div>
        <section id="summary">…</section>
        <section id="size">…</section>
        … (7 sections + remediation) …
        <footer>…</footer>
        <div class="section-nav">…</div>
    </div>
</body>
</html>
```

The full markup lives at `templates/index.html`. The page never has
inline `<style>` — all styles are in `index.css`. The page never has
inline `<script>` beyond the template-fetch promise.

### `index.js` — thin entry, ~70 lines

```js
/**
 * index.js — Thin entry point. Waits for window.__vueLoadPromise,
 * verifies data.js loaded, hides the #app-vue-missing fallback,
 * then delegates to RuiReportApp.mount() (app/mount.js).
 */
(function () {
    'use strict';

    function hideVueMissing() { /* … */ }
    function showVueMissing(err) { /* … */ }
    function ensureData() { /* throws if REPORT_DATA/REPORT_CONFIG missing */ }

    function boot() {
        if (typeof window.__vueLoadPromise !== 'object' || typeof window.__vueLoadPromise.then !== 'function') {
            showVueMissing(new Error('window.__vueLoadPromise is not a Promise — {{SHARED_ROOT}}/loader.js did not run.'));
            return;
        }
        window.__vueLoadPromise
            .then(function () {
                if (typeof window.Vue === 'undefined' || typeof window.Vue.createApp !== 'function') {
                    throw new Error('window.Vue is unavailable after the loader resolved.');
                }
                hideVueMissing();
                ensureData();
                return window.RuiReportApp.mount();
            })
            .catch(function (err) {
                console.error('[rui-report-files] boot failed:', err);
                showVueMissing(err);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else { boot(); }
})();
```

### `app/state.js` — `RuiReportApp.{data, computed}`

Defines the page's reactive state:

- `data()` — `CONFIG`, `breadcrumb`, `data` (from `window.REPORT_DATA`),
  `activeSection`, `readingProgress`, `theme`, `shareLabel`,
  `remediationDone`, `visibleSections` (lazy-mount flags).
- `computed` — `optionsJson`, `sections`, `alertCounts`, `generatedAt`,
  `riskBanner`, `scoreClass`, `sectionFlags`, `dataAgeDays`, `isStale`,
  `distPct`, `keyFindings`, `remediationQueue`, `remediationGrouped`,
  `remediationDoneCount`, `activeSectionIndex`,
  `activeSectionLabel`, `prevSectionLabel`, `nextSectionLabel`.

### `app/actions.js` — `RuiReportApp.methods`

- Theme: `toggleTheme()` (localStorage-persisted)
- Share: `shareLink()` (clipboard write with text fallback)
- Print: `printReport()`
- Export: `exportJson()`, `exportCsv()` (data is in `data.js`)
- Helpers: `csvEscape()`, `download()`, `humanBytes(b)` (templates call this; delegates to `window.RuiBytes.humanBytes`. Leading underscore is forbidden — Vue 3's template compiler reserves `_`-prefixed identifiers for itself.)
- Navigation: `jumpSection(delta)`
- Remediation: `toggleRemediation(key)`, `clearRemediationDone()`

### `app/lifecycle.js` — `RuiReportApp.{mounted, beforeUnmount}`

- Hydrate theme from localStorage, then `documentElement[data-rui-theme]`
- Wire collapsible h2 click + keyboard (Enter/Space)
- IntersectionObserver → `activeSection` (TOC highlight)
- IntersectionObserver → `visibleSections[id] = true` (lazy mount)
- rAF-throttled `scroll` → `readingProgress`
- Keyboard shortcuts: `?`, `t`, `l`, `p`, `s`, `e`, `c`, `1..7`

`beforeUnmount` disconnects both observers and removes both listeners.

### `app/mount.js` — `RuiReportApp.mount()`

Boot sequence:

1. `Promise.all([whenReady(ruiBreadcrumb), …, whenReady(ruiBackTop)])` —
   shared rui-* components (loaded via `{{SHARED_ROOT}}/components/*`).
   Each fires a `*-ready` event once its Vue options object is on `window`.
2. `Promise.all([whenReportComponentReady(ruiReportSummary, …), …])` —
   the 7 report section components. `whenReportComponentReady` polls
   `window[globalName]` AND `document.getElementById(templateId)`.
   The template check resolves immediately because all 12 templates
   are inlined synchronously into `index.html` at build time — no
   fetch/XHR is involved.
3. `scheduleMount(mountOnce)` — `requestIdleCallback` or rAF fallback

`mountOnce(attempt)` snapshots the initial markup, calls
`Vue.createApp(RuiReportApp).component(…).mount(mountEl)`, and retries
once with a fresh mount target if the first attempt throws.

### `lib/rui-bytes.js` — `window.RuiBytes`

Pure utilities: `humanBytes(b)` (B/KB/MB/GB) and `debounce(fn, ms)`.
Used by `app/actions.js` (`humanBytes` method), by the largest
component's filter, and by any future call site.

### `lib/rui-sortable.js` — `window.RuiSortable`

`sortBy(rows, key, dir)` and `setSortMixin(defaults)`. The mixin adds
`data.sortKey/sortDir`, `methods.setSort/sortClass/sortAria`, and
`methods.sortBy(rows)`. Used by `rui-report-largest`,
`rui-report-coupling`, `rui-report-risk`, `rui-report-health`.

### `components/rui-report-*/index.{html,js,css}`

Each component:

- `index.html` — `<script type="text/x-template">` fragment
- `index.js`   — `window.ruiReportXxx` Vue options object
- `index.css`  — component-scoped styles

Components with sortable tables use the mixin:

```js
window.ruiReportXxx = Object.assign({
    name: 'ruiReportXxx',
    template: '#rui-report-xxx-tpl',
    props: { /* … */ },
    data: function () { /* local UI state, e.g. active tab */ },
    computed: {
        // … domain-specific …
        sorted: function () { return this.sortBy(this.rows); },
    },
    methods: {
        setTab: function (tab) { /* update tab + reset sortKey/sortDir */ },
    },
}, window.RuiSortable.setSortMixin({ sortKey: 'bytes', sortDir: -1 }));
```

## Canonical data shape

`data.js` (regenerated by `scripts/analyze.mjs`) MUST contain:

```js
window.REPORT_CONFIG = {
    options:   { topN, noCycles, theme, generatedAt /* ISO 8601 */ },
    constants: { filterDebounceMs, componentReadyTimeoutMs, csvHeader },
    labels:    { /* all user-visible strings */ },
};

window.REPORT_DATA = {
    scope, score, summary, alerts, treemap, types, histogram,
    largest, fanin, fanout, hotspots, orphans, depthStats,
    depthRanking, cycles, freshness, freshnessBuckets, freshnessStats,
    records, adjacency, selfImprovement, methodology,
};
```

The analyzer extracts the `window.REPORT_CONFIG = {…};` literal from
the template `data.js`, swaps the `generatedAt: null` placeholder for
the actual ISO 8601 UTC timestamp, and concatenates the (new)
`window.REPORT_DATA` (including the full `records` + `adjacency`)
below it. The single `data.js` ships everything the report needs —
no sidecar lazy-load is required.

## Severity contract

`REPORT_DATA.alerts[]` entries MUST be:

```ts
{
    severity: 'P0' | 'P1' | 'P2',
    marker:   'P0' | 'P1' | 'P2',
    category: 'bloat' | 'coupling' | 'depth' | 'hotspot' | 'orphan' | 'cycle' | 'freshness' | 'size',
    file:     string,        // relative to scope
    line:     number | null,
    message:  string,
}
```

The remediation queue reads `alerts[]` directly; missing `file`,
`category`, or `marker` drops the entry from the queue.

## Severity thresholds (defaults — see `references/scoring.md`)

| Level | Marker | Threshold |
|-------|--------|-----------|
| Critical (P0) | 🚫 | > 1000 LOC, depth > 15, cycle ≥ 3, hotspot ≥ 5.0 |
| Warning (P1) | ⚠️ | 500–1000 LOC, depth 8–15, cycle 2, hotspot 2.0–4.99 |
| Info (P2) | ℹ️ | Below warning thresholds |

## Exclusions (defaults)

`node_modules` `.git` `dist` `build` `.memory` `.next` `.turbo`
`coverage` `.claude` `target` `intermediate` `.DS_Store`

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `1`–`7` | Jump to section by number |
| `t` | Back to top |
| `l` | Toggle dark/light theme |
| `s` | Copy share link to current section |
| `p` | Print / save as PDF |
| `e` | Export JSON |
| `c` | Export CSV |
| `?` | Show/hide "How to read" |

## Pitfalls

- **`index.html` must NOT contain inline `<style>` or inline `<script>`
  beyond the template-fetch promise** — all styles live in `index.css`,
  all logic lives in `app/*` or `lib/*`. Inline styles defeat the
  cache, blow up the file size, and break CSP for `/docs/`.
- **Load order in `index.html` matters** — shared components
  (`rui-breadcrumb` etc.) MUST load before the section components,
  which MUST load before `lib/rui-sortable.js` (which the components
  reference), which MUST load before `app/state.js` (which reads
  `window.REPORT_DATA`).
- **The Vue mount is scheduled via `requestIdleCallback`** — the
  ~60ms synchronous mount of the full page would otherwise register
  as a long rAF handler in Chrome (Violations panel). Don't move the
  mount to a `requestAnimationFrame` callback.
- **Lazy-mount flags in `app/state.js` `data()`** — only
  `summary` and `size` are visible on initial mount. The remaining 5
  sections flip on via `IntersectionObserver` in `app/lifecycle.js`.
  This keeps the initial mount under the long-task threshold.
- **`data.js` is the single source of truth at runtime** — it
  ships `REPORT_CONFIG` and the full `REPORT_DATA` (including
  `records` and `adjacency`) in one block. Export actions read
  `this.data` directly with no additional `<script>` injection.
- **No external CDN** — all assets must come from the local
  `/.claude/shared/` directory. The build step substitutes
  `{{SHARED_ROOT}}` with a *relative* path (not the absolute
  `/.claude/shared/`) because absolute paths break under `file://` —
  the browser resolves `/.claude/shared/loader.js` to the filesystem
  root, not the project's `.claude/` directory. Adding a
  `<script src="https://…">` will break the report in offline +
  enterprise environments.
- **Templates are inlined, not fetched** — the 12 component templates
  (5 shared + 7 report) are inlined into `index.html` at build time.
  The page must NOT use `fetch()` or `XMLHttpRequest` to load
  templates at runtime: both are CORS-blocked on the `null` origin
  under `file://`. The shared loader's template-fetch path is
  bypassed because `document.querySelector('script[type="text/x-template"]#' + id)`
  finds the inlined block first.

## See also

- `references/methodology.md` — per-section measurement methodology
- `references/scoring.md` — score formula + thresholds
- `rules/analysis-contracts.md` — analyzer ↔ page data contract
- `commands/analyze.md` — user-facing CLI reference

---
name: rui-report-files
description: >
  Project-wide file-size and dependency-nesting analysis as a 4-file
  Vue 3 page. Analyzes scope, emits data.js, and opens the HTML
  report. Use /rui-report-files or variants with flags.
arguments:
  - name: path
    description: Limit analysis scope to a subdirectory
    required: false
  - name: out
    description: Custom output directory for the report
    required: false
  - name: top
    description: Number of largest files to show (default: 20)
    required: false
  - name: no-cycles
    description: Skip cycle detection for speed
    required: false
  - name: theme
    description: Report theme (dark | light, default: dark)
    required: false
  - name: generated-at
    description: ISO 8601 timestamp embedded in the report (default: now UTC)
    required: false
---

# Rui Report — Files

Run a project-wide file-size and dependency-nesting analysis, emitting a
4-file Vue 3 page at `docs/reports/files/`.

## Usage

| Command | Description |
|---------|-------------|
| `/rui-report-files` | Full analysis on cwd |
| `/rui-report-files <path>` | Limit scope to `<path>` |
| `/rui-report-files --out <dir>` | Custom output directory |
| `/rui-report-files --top 50` | Show top-50 largest files |
| `/rui-report-files --no-cycles` | Skip cycle detection |
| `/rui-report-files --theme light` | Light theme report |
| `/rui-report-files --generated-at 2026-07-15T08:00:00Z` | Pin the "generated at" timestamp |

## Analysis Pipeline (6 stages)

1. **File Inventory** — Walk scope, collect bytes/lines/type/mtime
2. **Size Distribution** — Directory aggregation, top-N, oversize flags, type breakdown, histogram
3. **Dependency Graph** — Per-language import regex, adjacency list, fan-in/fan-out, hotspot scores
4. **Nesting Depth** — DFS with memoization, max-depth per file, aggregate stats
5. **Cycle Detection** — 3-color DFS, cycle paths with suggested fixes
6. **Freshness** — asOf = max(lastModified), age buckets, top-N stale files

## Output (modular — 4 app modules + 2 lib utilities + 7 components)

The page is byte-stable. `analyze.mjs` is the single entry point: it
writes `data.js` AND assembles the full page from `templates/` (copies
byte-stable assets, inlines 12 component templates into `index.html`,
substitutes `{{SHARED_ROOT}}` and `{{SCOPE_TITLE}}`).

```
docs/reports/files/
├── index.html                 — Vue 3 markup + 12 inlined <script
│                                type="text/x-template"> blocks. No inline
│                                <style>, no inline logic beyond the
│                                template-fetch-free boot path.
├── index.css                  — Page-level styles, all extracted from
│                                index.html, ~1k lines (written once)
├── index.js                   — Thin entry: waits for Vue, then calls
│                                RuiReportApp.mount() (written once)
├── data.js                    — REPORT_CONFIG + REPORT_DATA
│                                (regenerated; includes full records + adjacency)
├── app/                       — Page-level Vue app, split by concern
│   ├── state.js               — data() + computed{}  (derived state)
│   ├── actions.js             — methods{}             (theme/share/print/export)
│   ├── lifecycle.js           — mounted() + beforeUnmount()
│   └── mount.js               — RuiReportApp.mount() — assembles + boots
├── lib/                       — Small shared utilities
│   ├── rui-bytes.js           — humanBytes + debounce
│   └── rui-sortable.js        — sortBy + setSortMixin (used by 4 components)
└── components/                — 7 section components, each with index.{js,css}
    ├── rui-report-summary/       (index.html is NOT emitted — inlined into
    ├── rui-report-size/           the page-level index.html at build time)
    ├── rui-report-largest/
    ├── rui-report-coupling/
    ├── rui-report-risk/
    ├── rui-report-health/
    └── rui-report-self-improvement/
```

The `app/` split is identical in pattern to `YiPet/docs/files/app/`
(state/actions/lifecycle/mount). The `lib/` split mirrors
`YiPet/docs/files/lib/` (shared low-level utilities). See `SKILL.md`
for the full file-by-file contract.

## Report Sections (in render order)

- **Stale banner** — shown when `dataAgeDays > 7`
- **Risk banner** — P0 / P1 / all-clear derived from `alerts[]`
- **Risk distribution** — P0/P1/P2 proportion bar
- **Remediation queue** — alerts grouped by severity with checkboxes
  (state persisted in `localStorage['rui-report-remediation-done']`)
- **Meta-grid** — 5 header KPIs
- **Key findings** — TL;DR card grid; each card links to its section
- **How to read** + **Methodology** — collapsible help blocks
- `#summary` — Score gauge + stat cards
- `#size` — Tabbed: Treemap / Types / Histogram
- `#largest` — Sortable top-N table with path filter
- `#coupling` — Tabbed: Fan-in / Fan-out top-20
- `#risk` — Tabbed: Hotspots / Orphans / Depth
- `#health` — Tabbed: Cycles / Freshness
- `#self-improvement` — Diagnostics: severity donut, risk vectors, levers, roadmap
- **Footer recap** — 4 tile recap + scope + options

## Alerts contract (drives remediation queue + risk banner)

Each entry in `REPORT_DATA.alerts[]` MUST include:

```ts
{
  severity: 'P0' | 'P1' | 'P2',
  marker:   'P0' | 'P1' | 'P2',
  category: 'bloat' | 'coupling' | 'depth' | 'hotspot' | 'orphan' | 'cycle' | 'freshness' | 'size',
  file:     string,    // relative to scope
  line:     number | null,
  message:  string,
}
```

The remediation queue reads `alerts[]` directly; missing `file`,
`category`, or `marker` drops the entry from the queue.

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

## Severity Levels

| Level | Marker | Threshold |
|-------|--------|-----------|
| Critical (P0) | 🚫 | > 1000 LOC, depth > 15, cycle ≥ 3, hotspot ≥ 5.0 |
| Warning (P1) | ⚠️ | 500–1000 LOC, depth 8–15, cycle 2, hotspot 2.0–4.99 |
| Info (P2) | ℹ️ | Below warning thresholds |

## Exclusions

`node_modules` `.git` `dist` `build` `.memory` `.next` `.turbo` `coverage`

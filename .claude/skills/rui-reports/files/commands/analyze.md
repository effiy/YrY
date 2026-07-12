---
name: rui-report-files
description: >
  Project-wide file-size and dependency-nesting analysis as a 4-file
  Vue 3 page. Analyzes scope, emits data.js + data-records.js, and opens
  the HTML report. Use /rui-report-files or variants with flags.
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

## Analysis Pipeline (6 stages)

1. **File Inventory** — Walk scope, collect bytes/lines/type/mtime
2. **Size Distribution** — Directory aggregation, top-N, oversize flags, type breakdown, histogram
3. **Dependency Graph** — Per-language import regex, adjacency list, fan-in/fan-out, hotspot scores
4. **Nesting Depth** — DFS with memoization, max-depth per file, aggregate stats
5. **Cycle Detection** — 3-color DFS, cycle paths with suggested fixes
6. **Freshness** — asOf = max(lastModified), age buckets, top-N stale files

## Output (5 files)

```
docs/reports/files/
├── index.html       — Vue 3 template (written once)
├── index.js         — Vue app mount + logic (written once)
├── index.css        — Styles (written once)
├── data.js          — REPORT_CONFIG + REPORT_DATA (regenerated every run)
└── data-records.js  — Full records + adjacency (lazy-loaded, regenerated)
```

## Report Sections

- `#summary` — Score gauge + stat cards
- `#size` — Tabbed: Treemap / Types / Histogram
- `#largest` — Sortable top-N table with path filter
- `#coupling` — Tabbed: Fan-in / Fan-out top-20
- `#risk` — Tabbed: Hotspots / Orphans / Depth
- `#health` — Tabbed: Cycles / Freshness
- `#self-improvement` — Diagnostics: severity donut, risk vectors, levers, roadmap

## Severity Levels

| Level | Marker | Threshold |
|-------|--------|-----------|
| Critical (P0) | 🚫 | > 1000 LOC, depth > 15, cycle ≥ 3, hotspot ≥ 5.0 |
| Warning (P1) | ⚠️ | 500–1000 LOC, depth 8–15, cycle 2, hotspot 2.0–4.99 |
| Info (P2) | ℹ️ | Below warning thresholds |

## Exclusions

`node_modules` `.git` `dist` `build` `.memory` `.next` `.turbo` `coverage`

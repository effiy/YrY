---
name: rui-report-files
description: >
  Project-wide file-size and dependency-nesting analysis emitted as a
  5-file Vue 3 page (index.html + index.js + index.css + data.js +
  data-records.js). Six-stage analysis pipeline: inventory, size
  distribution, dependency graph, nesting depth, cycle detection,
  freshness. Use whenever the user asks for file-size reports,
  treemaps, dependency-depth analysis, or project-structure visual
  overviews.
  Triggers: "file-size report", "project treemap", "dependency depth",
  "file analysis report", "project structure overview", "oversized
  files", "hotspot analysis", "fan-in fan-out report".
lifecycle: default-pipeline
user_invocable: true
---

# rui-report-files

> Turn a project directory into a 5-file Vue 3 page that surfaces file-size distribution and dependency-nesting relationships. Read-only analysis; the only side effect is the emitted report files — regeneration rewrites only `data.js` and `data-records.js`.

## Quick Start

```bash
/rui-report-files                           # Full analysis on cwd
/rui-report-files <path>                    # Limit scope to <path>
/rui-report-files --out <dir>               # Custom output directory
/rui-report-files --top 50                  # Show top-50 largest files
/rui-report-files --no-cycles               # Skip cycle detection (faster)
/rui-report-files --theme light             # Light theme report
```

## What This Skill Does

- Walk a project directory and collect per-file metrics: bytes, lines, type, lastModified
- Aggregate size distribution: directory-level sums, top-N largest, oversize flags, type breakdown, histogram
- Build a dependency graph via per-language import regex, compute fan-in/fan-out and hotspot scores
- Compute nesting depth via DFS with memoization, aggregate depth statistics
- Detect cycles via 3-color DFS, output cycle paths with suggested fixes
- Compute freshness: age buckets, top-N stale files
- Emit a self-contained 5-file Vue 3 page at the output directory with 7 interactive sections

## What This Skill Does NOT Do

- Does NOT modify source files — read-only analysis
- Does NOT measure code complexity (McCabe, cognitive metrics)
- Does NOT check for outdated or vulnerable dependencies
- Does NOT detect architecture-layer violations
- Does NOT provide live interactive exploration (this is a static snapshot)
- Does NOT aggregate across multiple scopes or monorepos in a single run

## Workflow

```
resolve-scope → walk-files → extract-imports → compute-graph → compute-depth
→ detect-cycles → compute-freshness → copy-templates → write-data
```

Six analysis stages, run in order:

1. **File Inventory** — walk scope, collect bytes/lines/type/mtime
2. **Size Distribution** — directory aggregation, top-N largest, oversize flags, type breakdown, histogram
3. **Dependency Graph** — per-language import regex, adjacency list, fan-in/fan-out, hotspot scores
4. **Nesting Depth** — DFS with memoization, max-depth per file, aggregate stats
5. **Cycle Detection** — 3-color DFS, cycle paths with suggested fixes
6. **Freshness** — asOf = max(lastModified), age buckets, top-N stale files

## Borders

| Boundary | Permission |
|----------|-----------|
| `<scope>/**/*` source files | read |
| `templates/` (this skill) | read |
| `<outDir>/` (report output) | write |
| Anywhere else | no write |

## Rules

- [analysis-contracts.md](./rules/analysis-contracts.md) — Walk exclusions, import regex per language, depth computation, cycle detection, freshness, hotspot/orphan/histogram contracts.

## References

- [methodology.md](./references/methodology.md) — Full 6-stage pipeline specification: walk, size, dependency graph, depth, cycles, freshness.
- [scoring.md](./references/scoring.md) — Unified scoring rubric (0–100, A–F), alert mapping (P0/P1/P2), and JSON contract.

## Specialized Agents

- [file-analyzer.md](./agents/file-analyzer.md) — Walks the scope, extracts per-file metrics, and emits `FileRecord[]`.

## Commands

- [analyze.md](./commands/analyze.md) — Run the full 6-stage analysis pipeline and emit the 5-file Vue 3 page.

## Fallback

| Situation | Behavior |
|-----------|----------|
| Scope path does not exist | Abort with `scope-not-found` |
| Scope has zero source files after exclusions | Abort with `empty-scope` |
| Output directory not writable | Abort with `target-not-writable` |
| Single file read fails | Skip with `dim` warning, continue |
| Import regex timed out on minified/huge file | Skip import extraction for that file |
| Cycle count exceeds 200 | Truncate to top-200 by severity; note truncation in HTML |
| Unknown `--theme` | Fall back to `dark`, warn on stderr |

## Severity Levels

| Level | Marker | Threshold |
|-------|--------|-----------|
| Critical (P0) | 🚫 | > 1000 LOC, depth > 15, cycle >= 3, hotspot >= 5.0 |
| Warning (P1) | ⚠️ | 500-1000 LOC, depth 8-15, cycle 2, hotspot 2.0-4.99 |
| Info (P2) | ℹ️ | Below warning thresholds |

## Templates

- [templates/index.html](./templates/index.html) · [templates/index.js](./templates/index.js) · [templates/index.css](./templates/index.css) · [templates/data.js](./templates/data.js) — Canonical 5-file Vue 3 page templates. `index.html`, `index.js`, `index.css` are byte-stable (copied verbatim); `data.js` and `data-records.js` are regenerated each run.


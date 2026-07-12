# methodology.md

> Full methodology for rui-report-files. The implementing agent
> reads this once before executing, then follows it step by
> step.

## Stage 1 — File Inventory

Walk the scope with `find` (or equivalent Glob), applying the
default exclusion set (see `rules/analysis-contracts.md`).

Per file, collect:

| Field | Source | Example |
|-------|--------|---------|
| `path` | walk output | `src/utils/request.js` |
| `absPath` | `realpath` | `/abs/src/utils/request.js` |
| `bytes` | batched `find -printf` or `stat` (see `rules/analysis-contracts.md`) | `4321` |
| `lines` | batched `wc -l` | `120` |
| `type` | extension → normalized type | `js` / `ts` / `vue` / `py` / `go` / `rust` / `css` / `other` |
| `lastModified` | batched `stat` mtime (unix seconds) | `1719900000` |

Skip empty files (0 bytes) for line counting; they're still
listed in the inventory but with `lines: 0`.

## Stage 2 — Size Distribution

Aggregate per directory:

```
dirBytes(d) = sum of bytes of files directly in d
dirBytesRecursive(d) = dirBytes(d) + sum of dirBytesRecursive(c) for c in d.children
```

Top-N largest files: sort by `bytes desc`, take `--top` (default
20). Oversized flags:

| Condition | Severity |
|-----------|----------|
| `lines > 1000` | Critical |
| `lines > 500` | Warning |
| `bytes > 100_000` | Warning (binary-ish?) — verify it's actually source |

### 2.5 — File-type breakdown

Group `records` by `type`. For each type emit:

```
{ type, fileCount, totalBytes, totalLines, pctFiles, pctBytes }
```

`pctFiles = fileCount / totalFiles * 100`, rounded to 1 decimal;
`pctBytes` analogous. Sort by `totalBytes desc`. Render as a
horizontal bar table (CSS-only, no chart library) — one row per
type, bar width ∝ `pctBytes`.

### 2.6 — Size histogram

Bucket all files by `lines` using fixed-width buckets:

| Bucket | Range (lines) |
|--------|---------------|
| `0` | 0 |
| `1-50` | 1–50 |
| `51-100` | 51–100 |
| `101-250` | 101–250 |
| `251-500` | 251–500 |
| `501-1000` | 501–1000 |
| `1001-2000` | 1001–2000 |
| `2000+` | > 2000 |

Emit `{ bucket, count, pctFiles, totalBytesInBucket }`. Render
as a vertical-bar histogram (CSS only, bar height ∝ `pctFiles`).

## Stage 3 — Dependency Graph

For each file, run the matching import regex (see
`rules/analysis-contracts.md` for the table). Each match yields
an edge `file → specifier`. Resolve the specifier:

1. If it starts with `./` or `../`, resolve against the file's
   directory; try the resolved path as-is, then with each
   extension in `[.js, .ts, .mjs, .cjs, .jsx, .tsx, .vue]`.
2. Otherwise, mark `external` and skip.

Adjacency list: `Map<absPath, Set<resolvedAbsPath>>`.

Fan-in: `Map<absPath, number>` — count of files that import this
file. Fan-out: per-file, `adjacencyList.get(file).size`.

### 3.5 — Fan-in / fan-out rankings

Compute the following ranked lists (top-20 each):

| Ranking | Sort key | Use |
|---------|----------|-----|
| Top fan-in | `fanIn desc, path asc` | Most-depended-on modules — change ripples widely |
| Top fan-out | `fanOut desc, path asc` | Most-coupled modules — hardest to isolate |
| Orphans | files with `fanIn == 0` AND `fanOut == 0`, sort by `bytes desc` | Candidates for deletion or entry-point promotion |

External fan-out (count of `external` specifiers per file) is
tracked separately and surfaced in the largest-files table as
`extDeps`, but not used for depth or cycle detection.

### 3.6 — Hotspot score

Combine size and coupling into a single risk signal:

```
hotspotScore(f) =
    lines(f) / 1000 * 0.5
  + fanIn(f) * 0.2
  + fanOut(f) * 0.1
  + maxDepth(f) * 0.2
```

Round to 2 decimals. A file is listed in the `#hotspots`
section when `hotspotScore >= 2.0` (the section-inclusion
threshold). Severity within that section, per the SKILL.md
table: Critical when `hotspotScore >= 5.0`, Warning when
`2.0 <= hotspotScore < 5.0`. The formula is deliberately
transparent — no ML, no opaque weights — so the reader can
sanity-check why a file ranked where it did.

## Stage 4 — Nesting Depth

Compute `maxDepth(f)` via DFS with memoization (see contract in
`rules/analysis-contracts.md`). The implementing agent MUST use
an explicit stack (not recursion) for graphs deeper than ~500
nodes to avoid stack overflow on pathological repos.

Depth ranking: sort files by `maxDepth desc, path asc`, take
top 20.

Deep-nesting flags:

| `maxDepth` | Severity |
|------------|----------|
| > 15 | Critical |
| 8–15 | Warning |
| 3–7 | Info |

Also emit aggregate depth stats:

```
{ max: ..., mean: ..., median: ..., p90: ..., filesAtMax: N }
```

`mean` is over all files with at least one resolvable out-edge;
`median` and `p90` are computed on the same population.

## Stage 5 — Cycle Detection

3-color DFS over the adjacency list. Collect every cycle's:

- `path`: array of absolute paths
- `length`: number of edges (= `path.length - 1`)
- `severity`: per the contract table
- `hottestMember`: the file in the cycle with the highest
  `hotspotScore` — used to suggest which edge to break first

Sort cycles by `(length desc, path asc)`. Truncate at 200 if
needed.

For each cycle, emit a **suggested fix**: remove the edge
`hottestMember → its successor in the cycle path`. This is a
heuristic, not a directive — the reader decides.

## Stage 5.5 — Freshness

Compute file age from the `lastModified` field collected in
Stage 1.

```
asOf = max(lastModified(f) for f in records)  # unix seconds
ageDays(f) = max(0, floor((asOf - lastModified(f)) / 86400))
```

When `records` is empty, `asOf = 0` and all freshness fields are
zero / empty.

### 5.1 — Top-N stale files

Sort by `(ageDays desc, path asc)`, take `--top` (default 20).
Exclude files with `ageDays == 0` from this list (they are
"current" as of the anchor). Each row emits:

```
{ path, ageDays, lastModified, type, bytes, lines }
```

### 5.2 — Age buckets

Fixed buckets, non-overlapping and exhaustive:

| Bucket | Range (ageDays) |
|--------|-----------------|
| `<30d` | 0–29 |
| `30-90d` | 30–90 |
| `90-180d` | 91–180 |
| `180-365d` | 181–365 |
| `>365d` | ≥ 366 |

Emit `{ bucket, count, pctFiles }`. Render as a vertical-bar
histogram (CSS only, bar height ∝ `pctFiles`).

### 5.3 — Severity (informational)

| ageDays | Severity |
|---------|----------|
| ≥ 365 | Critical |
| 180–364 | Warning |
| 90–179 | Info |

Severity is surfaced in the section blurb only; no per-row
severity field is emitted.

### 5.4 — Aggregate stats

```
{
  asOf,          // the anchor mtime (unix seconds)
  maxAge,        // max ageDays over all records
  median,        // median ageDays
  p90,           // 90th percentile (nearest-rank)
  staleCount,    // count where ageDays >= 180
  criticalCount  // count where ageDays >= 365
}
```

`staleCount` is also mirrored into `summary.staleCount` for the
summary card.

### 5.5 — Determinism

Because `asOf = max(lastModified)` is derived from the records
themselves, two runs on the same scope at different wall-clock
times produce byte-identical `data.js`. This is required by the
Output determinism clause in `rules/analysis-contracts.md`.

## Stage 6 — Vue page emit

Copy the three stable files from `templates/report/` into
`docs/reports/files/`:

- `index.html` — Vue 3 standalone template with inline CDN loader
- `index.js` — `PAGE_REPORT_FILES_APP` Vue options + deferred mount
- `index.css` — `--rui-*` token values in `:root` + layout/print CSS

Then write `docs/reports/files/data.js` with `window.REPORT_CONFIG`
(verbatim from the template) and `window.REPORT_DATA` filled with
this run's analysis. Theme is selected via `<html
data-rui-theme="dark|light">` — the implementing agent sets the
attribute in `index.html` per the `--theme` option.

**No HTML string concatenation.** All dynamic content flows through
Vue's `{{ }}` interpolation or `v-for` / `:key`, fed by
`REPORT_DATA` in `data.js`. The generator's only string-building
job is `JSON.stringify(data)` for `data.js`.

Sections rendered by the Vue template (in order):

1. `<nav id="toc">` — sticky table of contents, `v-for` over the
   `sections` computed; collapses to a top-bar on narrow viewports
2. `<header>` — title, scope, totalFiles, totalBytesHuman, options
   used (JSON). No `generatedAt` / timestamp field.
3. `#summary` — 6 stat cards: total files, total size, max
   nesting depth, critical-files count, hotspot count, cycle
   count
4. `#treemap` — CSS-grid of directory tiles, area ∝ bytes
5. `#types` — file-type breakdown (bars + table)
6. `#histogram` — size-distribution histogram
7. `#largest` — top-N table (sortable via `@click` on `<th>`s;
   filterable via `<input type="search" v-model="filterText">`)
8. `#fanin` — top-20 most-imported files
9. `#fanout` — top-20 most-importing files
10. `#hotspots` — files ranked by hotspot score, with the
    contributing factors broken out
11. `#orphans` — files with no incoming or outgoing edges. No
    `Last Modified` column.
12. `#depth` — top-20 depth ranking + aggregate depth stats
13. `#cycles` — list with path + length + severity + suggested
    fix
14. `#freshness` — stat cards (anchor mtime, max/median/p90 age,
    stale count) + age-bucket histogram + sortable top-N table
    (path, ageDays, lastModified, type, lines)
15. `<footer>` — generator tag, scope, options, methodology
    link. No timestamp.


Also render a hidden `<script type="application/json"
id="rui-report-data">` blob carrying the full structured result
(records, adjacency, cycles, hotspots). The "Export JSON" button
reads this blob; the "Export CSV" button walks `records` to emit
a CSV. Both use `Blob` + `URL.createObjectURL`, no network.

Write the file with `Write` tool. Print the absolute path to
stdout for the user / orchestrator.

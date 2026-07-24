# analysis-contracts.md

> Invariants the implementing agent MUST respect while running
> yry-report-files. Violations are bugs in the execution, not the
> spec.

## Walk exclusions

Default exclusion set (matched as path globs under the scope):

```
**/node_modules/**
**/.git/**
**/dist/**
**/build/**
**/.next/**
**/.turbo/**
**/coverage/**
**/.memory/**
**/.claude/**
**/.DS_Store
```

The set is **append-only** within a single run — `--include` flags
may shrink it, but never silently. Hidden directories (those
starting with `.`) are excluded by default unless explicitly
included.

## Per-language import regex contract

Each language's import pattern MUST be anchored at line start
(`^\s*`), MUST use a non-greedy specifier where capturing, and
MUST capture the specifier (the path / module name) as the **last**
capture group of the match. Patterns are case-sensitive.

The implementing agent resolves relative specifiers (`./x`,
`../x`) against the importing file's directory. Resolution
**stops at the first existing file**; if no file is found, the
specifier is kept as `external` and excluded from depth
computation but included in fan-out counts.

Bare specifiers (`react`, `lodash`) are always `external`.

## Depth computation

`maxDepth(file)` = the longest chain of *resolvable* relative
imports starting from `file`, where each edge `a → b` means
"file a imports file b". Computed via DFS with memoization:

```
maxDepth(f) = 0                                  if f has no resolvable out-edges
            = 1 + max(maxDepth(g) for g in deps(f))
                                                   otherwise
```

Memoization key = absolute path of `f`. Cycles short-circuit
the DFS (gray-node detection) and do not contribute to depth.

Aggregate depth stats are computed over the population
`P = { f | f has ≥ 1 resolvable out-edge }`:

- `max` = max of `maxDepth(f)` over `P`
- `mean` = arithmetic mean over `P` (rounded to 2 decimals)
- `median` = 50th percentile of `maxDepth(f)` over `P`
- `p90` = 90th percentile (nearest-rank method) over `P`
- `filesAtMax` = count of `f ∈ P` with `maxDepth(f) == max`

When `P` is empty, all five fields are `0` and the depth section
surfaces an empty-state note instead of a table.

## Cycle detection

3-color DFS:

- white: unvisited
- gray: in current DFS stack
- black: fully processed

A cycle is reported when DFS encounters a gray node. The cycle
path is reconstructed from the stack snapshot at that point.
Length = number of edges in the cycle. Self-edges (a → a) are
excluded (they're usually re-exports of the same module).

Cycle severity:

| Length | Severity |
|--------|----------|
| 2 | Warning |
| 3–4 | Critical |
| ≥ 5 | Critical (escalated display) |

If more than 200 cycles are detected, the implementing agent
truncates to top-200 by `(length desc, path asc)` and notes the
truncation in the HTML.

## Freshness computation

`asOf = max(lastModified)` over all records (unix seconds). When
the scope has zero records, `asOf = 0` and all freshness fields
are zero / empty.

```
ageDays(f) = max(0, floor((asOf - lastModified(f)) / 86400))
```

Files with `ageDays == 0` are excluded from the `freshness` top-N
list but still counted in `freshnessBuckets` and `freshnessStats`.

Age buckets are fixed (non-overlapping, exhaustive):

| Bucket | Range (ageDays) |
|--------|-----------------|
| `<30d` | 0–29 |
| `30-90d` | 30–90 |
| `90-180d` | 91–180 |
| `180-365d` | 181–365 |
| `>365d` | ≥ 366 |

Severity (informational, surfaced in the blurb only — not a
per-row field):

| ageDays | Severity |
|---------|----------|
| ≥ 365 | Critical |
| 180–364 | Warning |
| 90–179 | Info |

Aggregate stats (`freshnessStats`):

- `asOf` — the anchor mtime
- `maxAge` — max `ageDays` over all records
- `median` — median `ageDays` over all records
- `p90` — 90th percentile `ageDays` (nearest-rank)
- `staleCount` — count of records with `ageDays ≥ 180`
- `criticalCount` — count of records with `ageDays ≥ 365`

`freshness` top-N is sorted by `(ageDays desc, path asc)` and
capped at `--top` (default 20).

**Determinism.** Because `asOf` is derived from the records
themselves, two runs on the same scope at different wall-clock
times produce byte-identical `data.js`. This is required by the
Output determinism clause below.

## Hotspot, orphan, and histogram contracts

**Hotspot score** is a transparent linear combination of four
normalized signals — the implementing agent MUST use the exact
weights published in `references/methodology.md` Stage 3.6.
Any change to the formula is a spec change and MUST be mirrored
in the methodology doc, the SKILL.md severity table, and the
`#hotspots` section's explanatory blurb in the template. The
score is unitless; only its relative ordering carries meaning.

A file is an **orphan** when `fanIn == 0` AND `fanOut == 0`
(resolvable). Entry-point files (those with `fanIn == 0` but
non-zero `fanOut`) are NOT orphans — they are root modules and
are listed separately if the user passes `--show-roots`. Default
run does not list roots.

**Size histogram** buckets are fixed (see methodology Stage 2.6).
A file with `lines == 0` is counted in the `0` bucket only.
Buckets are non-overlapping and exhaustive; every record falls
into exactly one bucket.

**File-type breakdown** uses the normalized `type` field from
Stage 1. `other` is a real bucket — never silently dropped. The
sum of `pctBytes` across all types MUST equal `100.0 ± 0.1`
(floating-point tolerance); the implementing agent verifies this
in the verify step.

## Output determinism

Two runs with identical `(scope, options, file contents)` MUST
produce byte-identical `data.js` output in `YiDoc/projects/<project>/files/`. The only
non-deterministic field is `REPORT_CONFIG.options.generatedAt`
(ISO 8601 UTC of the run). All other fields are derived from
the file inventory and are stable. The latest run overwrites
the previous run's `data.js` in place.

Sort keys for all collections are pinned in the methodology
reference; do not rely on filesystem traversal order.

`data.js` exports `window.REPORT_DATA` whose top-level key order
is pinned: `scope`, `score`, `alerts`, `summary`, `treemap`, `types`,
`histogram`, `largest`, `fanin`, `fanout`, `hotspots`, `orphans`,
`depthStats`, `depthRanking`, `cycles`, `freshness`, `freshnessBuckets`,
`freshnessStats`, `selfImprovement`, `records`, `adjacency`. The first
20 are view-model arrays/objects consumed by Vue; `records` and
`adjacency` are kept for Export JSON / Export CSV. The implementing
agent MUST NOT add or reorder keys without updating SKILL.md and the
template in lockstep.

`REPORT_DATA.alerts[]` is the canonical remediation queue. Each
entry MUST contain:

```ts
{
  severity: 'P0' | 'P1' | 'P2',
  marker:   'P0' | 'P1' | 'P2',
  category: 'bloat' | 'coupling' | 'depth' | 'hotspot' | 'orphan' | 'cycle' | 'freshness' | 'size',
  file:     string,           // relative to scope
  line:     number | null,    // null when no source position applies
  message:  string,           // human-readable, ≤ 120 chars, must be XSS-safe
}
```

The category drives which section the remediation card links to
(bloat/size → `#largest`, coupling/depth/hotspot/orphan → `#risk`,
cycle/freshness → `#health`). The Vue page **never** string-builds
HTML from these values; the `riskBanner` computed property uses
explicit `&lt;` escaping for embedded HTML, and the remediation
queue uses `{{ }}` interpolation only.

`REPORT_CONFIG.options.generatedAt` (ISO 8601 UTC) is embedded in
the meta-grid and drives the stale-banner (>7 days). When absent,
the report uses `Date.now()` and never re-emits a stable hash; this
is documented in the SKILL.md "Report surface" section.

## Bounded behavior on huge repos

**`REPORT_DATA.records` truncation.** When `records.length > 50_000`, the
`records` array in `data.js` MUST drop per-record `fanIn` / `fanOut` /
`maxDepth` (which are derivable from `adjacency` + `depthStats`) and
keep only `{ path, bytes, lines, type, lastModified }` per record.
When `records.length > 100_000`, `data.js` MUST additionally replace
`adjacency` with a `{ edgeCount, topFanIn: [...20], topFanOut: [...20] }`
summary instead of the full map. The Vue-rendered sections themselves
are unaffected — they render from the staged view arrays
(`largest` / `fanin` / `fanout` / `hotspots` / `orphans` /
`depthRanking`), not from `records`. A `truncated: true` flag is added
to `REPORT_DATA` so the export buttons can warn the user.

**Import-regex read cap.** When extracting imports from a file
whose `bytes > 256_000`, the implementing agent reads only the
first 64 KB. Imports are at the top of source files in every
supported language; reading past 64 KB yields no edges and
wastes I/O. The file is still listed in the inventory with its
full `bytes` / `lines` — only the import-extraction stage is
capped.

**Walk batching.** Stage 1 MUST batch `stat` calls — use
`find -printf '%p\t%s\t%T@\n'` (GNU) or a single `stat` call
per file via `find -print0 | xargs -0 stat -f '%z %m %N'`
(macOS) / `stat -c '%s %Y %n'` (Linux). Spawning one `stat`
and one `wc -l` per file is forbidden on repos with more than
1 000 files; `wc -l` MUST be batched via `find -print0 | xargs
-0 wc -l`.

## XSS safety

User-controlled strings — file paths, file names, directory
names, specifier values — MUST pass through `textContent` when
inserted into the HTML. Building HTML by string concatenation
with such values is a contract violation.

The implementing agent MAY use `innerHTML` for static template
fragments that contain no user-controlled substrings.

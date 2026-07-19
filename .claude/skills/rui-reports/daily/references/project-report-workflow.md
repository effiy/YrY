# CTO Daily Project Report — Workflow

> Generate a daily, CTO-perspective HTML report for a specified project.
> Reads the local git repository + project files, synthesizes a leadership
> briefing, and writes a **4-file** static report to
> `<out>/<YYYY-MM-DD>/{index.html, index.js, index.css, data.js}`
> (default `~/.claude/reports/<project>/<YYYY-MM-DD>/`; override with
> `--out`).

## Inputs

| Arg | Required | Meaning |
|-----|----------|---------|
| `--project <path>` | yes | Absolute path to the project repo (must contain `.git`) |
| `--out <dir>` | no | Override for output directory; the report is written to `<out>/<YYYY-MM-DD>/` (default `~/.claude/reports/<project>/`) |
| `--since <duration>` | no | Lookback window (default `24h`; accepts `12h`, `7d`, etc.) |
| `--focus <area>` | no | One of `summary`, `risk`, `health`, `people`, `all` (default `all`) |
| `--open` | no | Open the rendered HTML in the default browser when done |
| `--redact-emails` | no | Mask local part of author emails (`a@b` → `***@b`) |

If `--project` is missing, ask. If the path is not a git repo, refuse
with a clear error. If `--out` is provided, the date directory is still
created underneath; only the parent of the date dir is overridden.

## What the report covers

The CTO lens — not the IC lens. Skip line-level diffs and surface
decisions, risks, and signals an engineering leader needs in five
minutes before standup.

### 1. Summary (always)

- **Window**: lookback range, total commits, total PRs merged, total PRs opened
- **Top contributors** (top 5 by commit count + lines changed)
- **Hot files** (top 5 by churn — file count × insertions × deletions)
- **One-paragraph narrative** — what got built, what got fixed, what drifted

### 2. Risk (always when `--focus` includes `risk`)

- Files changed by 3+ authors in the window → collaboration hot-spot, merge-conflict risk
- Long-lived branches (> 7 days, no merge) → work-in-progress risk
- Reverted commits or fix-on-fix commits → quality signal
- Test-only changes vs feature changes ratio → coverage drift
- LOC growth > 30% in any single file → refactor candidate
- New unowned directories (no recent commits, recently created) → abandoned work

### 3. Health (always when `--focus` includes `health`)

- Languages detected + LOC distribution (use `cloc` or `tokei` if installed, else `find … | xargs wc -l` for a coarse signal)
- Test ratio (`tests/` LOC vs `src/` LOC)
- TODO / FIXME / XXX count via `git grep`
- CI status if `.github/workflows` or similar present — list workflows and last run status
- Dependency footprint: count of declared deps in `package.json` / `Cargo.toml` / `go.mod` / `requirements.txt` / `pyproject.toml`
- Stale branches: `git for-each-ref --format='%(refname:short) %(committerdate:relative)' refs/heads` older than 30 days

### 4. People (always when `--focus` includes `people`)

- Author commit distribution (Pareto: top 20% of authors do what % of commits?)
- Bus factor: how many files have a single author?
- Reviewer coverage: PRs that merged with < 1 review vs ≥ 1 review
- New contributors in the window
- Inactive frequent committers (people who appear in last 30 days but not this window)

### 5. Out of scope (do NOT include)

- Line-level diffs, individual commit messages
- Code style / lint scores
- Performance benchmarks
- Any data that requires running the project (the report is offline)

## Data collection

The workflow is offline — no API calls, no CI integration. Everything
comes from local git + filesystem reads.

```bash
# Project identity
git -C <project> rev-parse --show-toplevel
git -C <project> log -1 --format='%H %s'

# Activity
git -C <project> log --since='<window>' --pretty=format:'%h|%an|%ae|%ad|%s' --date=iso
git -C <project> shortlog -sn --since='<window>'

# Branches
git -C <project> for-each-ref --format='%(refname:short)|%(committerdate:iso)|%(authorname)' refs/heads

# Diff stats
git -C <project> log --since='<window>' --pretty=format: --numstat | awk '{ add += $1; del += $2 } END { print add, del }'

# File churn (top 5)
git -C <project> log --since='<window>' --pretty=format: --name-only | sort | uniq -c | sort -rn | head -5

# Hot files by author count
git -C <project> log --since='<window>' --pretty=format:'%an' --name-only | tail -n +2 | sort | uniq -c | sort -rn | head -20

# Test files
find <project> -type d \( -name node_modules -o -name .git -o -name dist -o -name build -o -name target -o -name .venv \) -prune -o -type f -print | grep -Ei '/(test|tests|__tests__|spec)/' | wc -l
find <project> -type d \( -name node_modules -o -name .git -o -name dist -o -name build -o -name target -o -name .venv \) -prune -o -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.py' -o -name '*.go' -o -name '*.rs' \) -print | wc -l

# TODO/FIXME density
git -C <project> grep -nE 'TODO|FIXME|XXX' | wc -l
```

If `git` is unavailable or the path is not a repo, stop with a
single-line error and exit code 2.

## Output structure

A **4-file** static report, matching the rest of the rui-reports catalog
(`files`, `diagram`, `arch`, `test`). Output is written under
`<out>/<YYYY-MM-DD>/`:

```
<out>/<YYYY-MM-DD>/
├── index.html      page shell; loads shared/loader.js, data.js, index.css, index.js
├── index.js        Vue 3 app; reads window.REPORT_DATA, mounts #app
├── index.css       all styles, layered (reset → tokens → base → layout → components → sections → utilities → responsive → print)
└── data.js         schema (DEFAULT_DATA, EXAMPLE_DATA, mergeWithDefaults); populates window.REPORT_DATA
```

The four files are loaded in this order in `index.html`:
1. `/.claude/shared/loader.js` — auto-injects Vue 3 (primary + fallback URL)
2. `/.claude/shared/components/rui-back-top/index.js` — shared scroll-to-top button
3. `data.js` — populates `window.REPORT_DATA` from the active data object
4. `index.css` — page styles
5. `index.js` — Vue 3 app, mounted on `#app`

The template lives at `templates/report/` inside the skill. The
workflow reads each of the four files, substitutes the active data
into `data.js`, and writes the full set to the date directory. The
template must be re-loaded, not inlined: any drift between the
template and the rendered file is a contract violation.

`data.js` exports:
- `window.REPORT_DATA_SCHEMA.defaults` — empty / placeholder values
- `window.REPORT_DATA_SCHEMA.example`  — illustrative fixture (used when the template is opened directly in a browser)
- `window.REPORT_DATA_SCHEMA.merge(input)` — deep-merge a report with defaults
- `window.REPORT_DATA` — the active data object (defaults → example → input)

The Vue app in `index.js` reads `window.REPORT_DATA` and renders the
four sections — summary, risk, health, people — in that order. Each
section is collapsible via the `+ / −` toggle on its `.head` element.

The `{{REPORT_TITLE}}` placeholder in `index.html` is replaced at
write time so the `<title>` matches the rendered page header.

## Risk heuristics (default thresholds)

Tune these if the user overrides `--focus`, but use these defaults:

| Signal | Threshold | Why |
|--------|-----------|-----|
| Hot file (churn) | ≥ 3 distinct authors in window | Collaboration cost |
| Long-lived branch | > 7 days no merge | WIP risk |
| TODO/FIXME growth | > +20% vs prior 7-day window | Tech-debt signal |
| Single-author files | > 60% of files | Bus-factor risk |
| Unreviewed merges | > 30% of merged PRs without review | Process risk |
| Branch count | > 50 active | Hygiene |
| LOC spike | file grew > 30% in window | Refactor candidate |
| Inactive frequent committer | appeared in last 30d, absent in this window | Capacity signal |

If a signal is amber, show it; if red, add a "Action suggested" tag
and a one-line remediation hint.

## Writing the one-paragraph narrative

The summary section ends with a 3-5 sentence paragraph that reads
like a standup update from a CTO. Cover:

1. What shipped (the most consequential merge in the window, or the
   cluster of merges that share a theme)
2. What's at risk (one hot file or long-lived branch worth naming)
3. What's drifting (one tech-debt or process signal worth naming)
4. One thing to watch (a forward-looking signal — growing test gap,
   new contributor, etc.)

Tone: matter-of-fact, no marketing, no hedging. If the report
finds nothing meaningful, say "no material activity in the window"
and stop — never invent a story.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| Empty repo / no commits in window | Render an empty report with "no activity" and a "this is normal" note |
| Monorepo | Treat top-level as the project; note sub-packages in the summary, don't recurse |
| No `git` binary | Exit 2 with a one-line error |
| Path exists but is not a git repo | Exit 2 with "not a git repository" |
| `--out` directory not writable | Surface the underlying error, suggest `~/.claude/reports/<project>/` |
| `cloc` / `tokei` not installed | Fall back to a coarse `find … | xargs wc -l` count, mark the section as "coarse" |
| Stale `.git` lock (concurrent git op) | Wait 5s once, retry; surface if it persists |
| `--since` is invalid | Reject with usage hint before touching the filesystem |
| Date directory already exists | Overwrite the 4 files inside; do not delete sibling dates |
| Template file missing in `templates/report/` | Refuse to write; surface the missing path; exit 2 |
| `data.js` shape mismatch (missing top-level key) | `mergeWithDefaults()` fills the gap; do not throw |

## Privacy + data scope

- The report reads **only** the project at `--project` and writes to
  the output dir. No network calls.
- Author emails appear in the report. If the user wants them
  redacted, pass `--redact-emails` (replaces the local part with `***`).
- The report file is not encrypted. The user is responsible for where
  they share it.
- The default output dir is `~/.claude/reports/<project>/`. The user
  can `--out` elsewhere. The 4 files are written under
  `<out>/<YYYY-MM-DD>/` so multiple reports for the same project
  don't overwrite each other.
- The page shell (`index.html`) loads the shared CDN loader
  (`/.claude/shared/loader.js`) at runtime to inject Vue 3. The
  shared loader auto-falls-back to a secondary CDN if the primary
  is unreachable. The four report files themselves contain no
  remote URLs and no remote font requests.

## Template layout

The 4-file template lives at
`templates/report/{index.html,index.js,index.css,data.js}` inside
the skill. The contract:

- **`data.js` is the single source of truth for what the renderer
  can render.** Any field the active data forgets to fill renders
  as `—` (scalar) or no header at all (array), via
  `mergeWithDefaults()`. Bump `version` in the schema header when
  the shape changes.
- **`index.js` contains the runtime template as a `String.raw`
  literal.** This is the only place where section order, table
  columns, and KPI grid layout live. Do not split the template
  across files.
- **`index.css` is layered** (`reset → tokens → base → layout →
  components → sections → utilities → responsive → print`). The
  layer order is the contract; do not re-order without thinking
  about cascade.
- **`index.html` is the page shell.** It loads the shared loader
  first, then `data.js` (which populates `window.REPORT_DATA`),
  then `index.css`, then `index.js`. The `{{REPORT_TITLE}}`
  placeholder in the `<title>` element is replaced at write time.
- The `rui-back-top` shared component is auto-mounted by the
  shared loader; no extra wiring needed in the report app.

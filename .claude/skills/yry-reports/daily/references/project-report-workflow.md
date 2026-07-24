# CTO Daily Project Report — Workflow

> Generate a daily, CTO-perspective HTML report covering **multiple projects**
> for a given date. Reads each project's local git repository + files,
> synthesizes a leadership briefing, and writes a **2-file** static report to
> `YiDoc/projects/<project>/daily/{index.html, <YYYY-MM-DD>.js}`.
>
> Reports are organized by two dimensions:
> - **Date** — one directory per day (`YiDoc/projects/<project>/daily/`)
> - **Project** — entries inside the `projects[]` array in `data.js`

## Unified template contract

```
YiDoc/projects/<project>/daily/                     ← per-project deployment
├── index.html          ← thin shell (byte-identical across all 6 projects; loads ?date=<YYYY-MM-DD>.js)
├── <YYYY-MM-DD>.js     ← per-day data (window.REPORT_DATA) — the ONLY varying file
└── gen_daily.js        ← data generator script

YiDoc/templates/daily/                             ← shared template (byte-stable)
├── index.html         ← shell for PLAN mode (different concern)
├── index.css          ← shared styles (loaded by report shell via ../../../templates/daily/index.css)
├── index.js           ← shared Vue 3 app (loaded by report shell via ../../../templates/daily/index.js)
└── report/            ← shape reference for REPORT mode shell
    └── index.html     ← canonical report shell (paths assume depth-3 layout; projects adapt to depth-4)
```

**Only `<YYYY-MM-DD>.js` varies per date.** The shell (`index.html`) is byte-identical
across every project's `daily/` directory; the shared styles (`index.css`) and Vue app
(`index.js`) live in `YiDoc/templates/daily/` and are referenced via `../../../templates/daily/`.

The skill's `YiDoc/templates/daily/report/` directory is the canonical shape reference
for new report shells; projects deploy an adapted copy (path-adjusted for depth-4).

## Inputs

| Arg | Required | Meaning |
|-----|----------|---------|
| `--project <path…>` | yes (≥ 1) | One or more project paths to report on |
| `--date <YYYY-MM-DD>` | no | Override report date (default: today) |
| `--since <duration>` | no | Lookback window (default `1d`; accepts `12h`, `7d`, etc.) |
| `--focus <area>` | no | One of `summary`, `risk`, `health`, `people`, `all` (default `all`) |
| `--out <dir>` | no | Override output base dir (default `YiDoc/projects/<project>/daily/`) |
| `--open` | no | Open the rendered HTML in the default browser when done |
| `--redact-emails` | no | Mask local part of author emails |

When multiple `--project` flags are given, each project gets its own entry in
the `projects[]` array inside a single `data.js` — so one date directory
always covers all projects.

If `--project` is missing, ask. If any path is not a git repo, skip it with a
warning (do not refuse the entire run).

## What the report covers

The CTO lens — not the IC lens. Skip line-level diffs and surface decisions,
risks, and signals an engineering leader needs in five minutes before standup.

### 1. Summary (always)

Per project:
- **Window**: lookback range, total commits, total PRs merged, total PRs opened
- **Top contributors** (top 5 by commit count + lines changed)
- **Hot files** (top 5 by churn — file count × insertions × deletions)
- **One-paragraph narrative** — what got built, what got fixed, what drifted

### 2. Risk (always when `--focus` includes `risk`)

Per project:
- Files changed by 3+ authors in the window → collaboration hot-spot
- Long-lived branches (> 7 days, no merge) → work-in-progress risk
- Reverted commits or fix-on-fix commits → quality signal
- Test-only changes vs feature changes ratio → coverage drift
- LOC growth > 30% in any single file → refactor candidate
- New unowned directories (no recent commits, recently created) → abandoned work

### 3. Health (always when `--focus` includes `health`)

Per project:
- Languages detected + LOC distribution
- Test ratio (`tests/` LOC vs `src/` LOC)
- TODO / FIXME / XXX count via `git grep`
- Branch status
- Dependency footprint

### 4. People (always when `--focus` includes `people`)

Per project:
- Author commit distribution
- Bus factor: how many files have a single author?
- Reviewer coverage
- New contributors in the window
- Activity pulse (per-day commit bar chart)

### 5. Out of scope (do NOT include)

- Line-level diffs, individual commit messages
- Code style / lint scores
- Performance benchmarks
- Any data that requires running the project (the report is offline)

## Data collection

The workflow is offline — no API calls, no CI integration. Everything
comes from local git + filesystem reads.

```bash
# Per-project identity
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

If `git` is unavailable or a path is not a repo, skip that project with a
warning and continue with the others. Do not abort the entire run.

## Output structure

A **2-file** static report per date, matching the unified template contract:

```
YiDoc/projects/<project>/daily/
├── index.html      byte-identical across all 6 projects (thin path-adjusted shell; ?date= + <YYYY-MM-DD>.js model)
└── <YYYY-MM-DD>.js schema (DEFAULT_DATA, DEFAULT_PROJECT, EXAMPLE_DATA, mergeWithDefaults); populates window.REPORT_DATA
```

The shell (`index.html`) is not copied from `YiDoc/templates/daily/report/` — that subdir
holds a *different* design (per-date-directory model, shape reference only). The project
shell is a byte-stable entry point maintained directly in each project's `daily/` dir;
css/js are loaded from `YiDoc/templates/daily/` via `../../../templates/daily/`.

### How to generate

1. **Create** `YiDoc/projects/<project>/daily/` if it does not exist.
2. **Ensure** `YiDoc/projects/<project>/daily/index.html` matches the shared shell contract:
   `?date=` query-param + `document.write('<script src="' + date + '.js">')` runtime
   injection, depth-4 paths (`../../../../YiPet/cdn/` + `../../../templates/daily/`).
   Byte-identical to the other 6 projects' shells. The `<title>` is populated at runtime
   from `window.REPORT_DATA.meta.title`.
3. **Write** `YiDoc/projects/<project>/daily/<YYYY-MM-DD>.js` containing `window.REPORT_DATA`
   with:
   - `meta.date`, `meta.window`, `meta.sinceDate`, `meta.untilDate`,
     `meta.timestamp`, `meta.title`
   - `projects: [{project, scope, scopeShort, summary, risk, health, people}, …]`
   - One entry per project passed via `--project`

Do **NOT** write `index.css` or `index.js` into the project's `daily/` dir — they are
shared in `YiDoc/templates/daily/` and referenced via `../../../templates/daily/`.

### Data shape

```javascript
window.REPORT_DATA = {
  meta: {
    date: 'YYYY-MM-DD',
    window: '1d',
    sinceDate: 'YYYY-MM-DD',
    untilDate: 'YYYY-MM-DD',
    timestamp: 'ISO-8601',
    title: 'YrY · Daily CTO Report · YYYY-MM-DD'
  },
  projects: [
    {
      project: 'YiDoc',
      scope: '/absolute/path/to/project',
      scopeShort: 'YiDoc',
      summary: {
        kpis: [{ label, value, sub, tone }],
        contributors: [{ author, commits, percent, barWidth }],
        hotFiles: [{ rank, path, touches }],
        narrative: { shipped, atRisk, drifting, watch }
      },
      risk: {
        legend: { green, amber, red },
        items: [{ severity, name, hint, action, category }]
      },
      health: {
        languages: [{ kind, files, loc, percent, barWidth }],
        skills: [],
        tests: { testLoc, allJsLoc, ratio, threshold, verdict, color },
        techDebt: [{ marker, count, verdict, color, share }],
        branches: [{ name, lastCommit, ageDays, status, note, color }],
        dependencies: { text, verdict, color }
      },
      people: {
        distribution: [{ author, commits, percent, barWidth }],
        busFactor: [{ bucket, files, percent, verdict, color }],
        activityPulse: [{ date, day, commits, hint, barWidth }],
        review: { text, verdict, color },
        newContributors: string
      }
    },
    // … one entry per project
  ]
};
```

The full schema (with defaults, example fixture, and `mergeWithDefaults()`)
lives in `YiDoc/templates/daily/report/data.js`. Any field the report omits renders as
`—` or an empty section — never a crash.

### Project switcher

The Vue app in `YiDoc/templates/daily/index.js` renders a project switcher
toolbar when `projects.length > 1`. Clicking a project button updates the
active project. The active project is also reflected in the URL hash
(`#YiDoc`) for deep-linking.

## Risk heuristics (default thresholds)

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
| No activity | 0 commits in window | Project stalled |

## Writing the one-paragraph narrative

The summary section ends with a 3-5 sentence paragraph that reads
like a standup update from a CTO. Cover:

1. What shipped
2. What's at risk
3. What's drifting
4. One thing to watch

Tone: matter-of-fact, no marketing, no hedging. If the report finds nothing
meaningful, say "no material activity in the window" and stop — never invent
a story.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| Empty repo / no commits in window | Render project entry with "no activity" and a "this is normal" note |
| A `--project` path is not a git repo | Skip it with a warning; do not abort the run |
| No `git` binary | Exit 2 with a one-line error |
| `--out` directory not writable | Surface the underlying error, suggest `YiDoc/projects/<project>/daily/` |
| `cloc` / `tokei` not installed | Fall back to a coarse `find … | xargs wc -l` count, mark as "coarse" |
| Stale `.git` lock | Wait 5s once, retry; surface if it persists |
| Date directory already exists | Overwrite `data.js` and `index.html`; do not delete sibling dates |
| Template file missing in `YiDoc/templates/daily/` (index.css / index.js) | Refuse to write; surface the missing path; exit 2 |
| `data.js` shape mismatch | `mergeWithDefaults()` fills the gap; do not throw |
| Single `--project` | Still write `projects[]` (one-entry array); the UI hides the switcher |

## Privacy + data scope

- The report reads **only** the projects at `--project` and writes to
  `YiDoc/projects/<project>/daily/`. No network calls.
- Author emails appear in the report. If redaction is needed, pass
  `--redact-emails`.
- The default output dir is `YiDoc/projects/<project>/daily/`. Override with `--out`.

## Browser console hygiene

Every generated page must open without JavaScript errors:

- **Vue 3 loading**: the thin shell tries
  `../../../YiPet/cdn/vendor/vue.global.prod.js` first, falls back to
  `https://unpkg.com/vue@3.4.27/dist/vue.global.prod.js` on failure.
- **`window.REPORT_DATA`**: populated by `data.js` before the Vue app
  mounts, so the app always finds data on first render.
- **CSS/JS references**: `index.html` loads `../../../templates/daily/index.css` and
  `../../../templates/daily/index.js` — both exist because they are the canonical shared
  template files. Never break these paths.
- **`document.title`**: set at runtime from `window.REPORT_DATA.meta.title`
  — never hardcode the date or project name in `index.html`.

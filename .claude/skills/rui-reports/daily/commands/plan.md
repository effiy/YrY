---
name: daily-plan
description: >
  Engineering planning checklist across three time tiers — 30 days
  (sprint-tier execution), 90 days (quarter-tier commitments), and
  long-term (strategic bets). Reads a local git repo + filesystem,
  proposes milestones / themes / bets, risk mitigations, team
  allocation, and a tiered DoD checklist, and writes a
  self-contained HTML page (default) or markdown file to
  `~/.claude/plans/<project>/<YYYY-MM-DD>-plan.{html,md}`. Offline
  + git-only.
arguments:
  - name: project
    description: Absolute path to the project repo (must contain .git)
    required: true
  - name: out
    description: Override for output directory (default ~/.claude/plans/<project>/)
    required: false
  - name: horizon
    description: Inner-tier window (default 30d; accepts 14d, 30d, 45d)
    required: false
  - name: tiers
    description: Comma-separated subset of 30d,90d,long (default: all three)
    required: false
  - name: format
    description: Output format — html or md (default html)
    required: false
  - name: focus
    description: One of milestones, wbs, risk, team, dod, all (default all)
    required: false
  - name: redact-emails
    description: Replace the local part of author emails with ***
    required: false
  - name: open
    description: Open the rendered file in the default browser when done
    required: false
  - name: no-diff
    description: Skip the plan-vs-prior diff section
    required: false
  - name: diff-vs
    description: Compare against the specified plan file instead of the most recent prior
    required: false
  - name: allow-overcommit
    description: Write the plan even when capacity verdict is red (adds OVERCOMMITTED tag)
    required: false
  - name: no-validate
    description: Skip the plan-validation self-check (adds UNVALIDATED tag)
    required: false
---

# /daily plan — Three-horizon engineering plan

Generate a draft engineering plan for a local project, structured
around three time tiers: **30 days** (sprint-tier execution),
**90 days** (quarter-tier commitments), and **long-term**
(strategic bets). 30d milestones roll up into 90d themes, which
roll up into long-term bets.

## Usage

| Command | Description |
|---------|-------------|
| `/daily plan --project /Users/me/code/myapp` | Default: 30d/90d/long-term, HTML output |
| `/daily plan --project ~/code/myapp --format md` | Markdown checklist output |
| `/daily plan --project ~/code/myapp --horizon 14d` | Narrow the inner tier to 14 days |
| `/daily plan --project ~/code/myapp --tiers 30d,90d` | Skip the long-term tier |
| `/daily plan --project ~/code/myapp --focus risk` | Emphasize risk mitigations across tiers |
| `/daily plan --project ~/code/myapp --redact-emails` | Mask author emails in team allocation |
| `/daily plan --project ~/code/myapp --open` | Open in browser when done |
| `/daily plan --project ~/code/myapp --no-diff` | Skip the plan-vs-prior diff |
| `/daily plan --project ~/code/myapp --diff-vs ~/plans/myapp/2026-07-10-plan.html` | Diff against a specific prior plan |
| `/daily plan --project ~/code/myapp --allow-overcommit` | Write even when capacity is red |
| `/daily plan` | Asks for `--project` before touching the filesystem |

## Pipeline (5 stages)

1. **Detect mode** — first arg is `plan`; verify `--project` is present
2. **Collect state** — git identity, velocity, branches, churn, TODO density, test ratio
3. **Render tiers** — 30d (milestones + WBS) → 90d (themes + epics) → long-term (bets)
4. **Validate roll-up** — every 30d milestone → 90d theme → long-term bet; every bet has kill criteria
5. **Write + (optional) open** — mount the Vue app from `templates/index.html` + `data.js`; or call `planToMarkdown(plan)` from `templates/index.js` for `--format md`

## Output layout

```
~/.claude/plans/<project>/
└── <YYYY-MM-DD>-plan.html   (or .md)
```

Self-contained HTML: layered CSS in `templates/index.css` (inlined
when the plan is written), tiny inline JS in `templates/index.js`
for section collapse + toolbar (expand / collapse / copy-as-markdown
/ print) + risk matrix filter. No external resources at render
time (Vue 3 is inlined too). Shareable as a single file.

## What the plan contains

| Section | Always? | Notes |
|---------|---------|-------|
| Context | yes | Project identity, velocity, one-paragraph framing across all three tiers |
| 30-day tier | when `--tiers` includes `30d` | 2-3 milestones, each with WBS of S/M/L items |
| 90-day tier | when `--tiers` includes `90d` | 2-4 themes with epics and north-star metrics |
| Long-term tier | when `--tiers` includes `long` | 1-3 bets with kill criteria and decision points |
| Risks | when `--focus` includes `risk` | Tagged by tier (30d / 90d / long) |
| Team | when `--focus` includes `team` | Roster + 30d allocation + 90d allocation (all draft) |
| DoD | when `--focus` includes `dod` | Tiered: 30d / 90d / long-term checklists |

## Non-negotiable rules

1. **No calendar dates.** Use `T+Nd` offsets. The skill does not
   know the user's calendar.
2. **Every tier rolls up.** 30d → 90d → long-term. Orphan
   milestones refuse to render — ask the user to clarify.
3. **Every bet has kill criteria + decision point.** Bets without
   kill criteria are sunk-cost magnets.
4. **Header is labeled `DRAFT — <YYYY-MM-DD>`.** Plans that look
   final get shared prematurely.
5. **Owner placeholders are `<unassigned>`** until the user
   confirms. Git-blame suggestions are labeled as draft.
6. **Template-driven.** Read `templates/index.html` (the page shell) and `templates/data.js` (the schema) before writing; do not reinvent the structure inline. The 4-file layout (`data.js · index.html · index.css · index.js`) is the source of truth. For `--format md`, call `window.planToMarkdown(plan)` exported from `templates/index.js` — the old `plan-checklist.md` template has been folded into the Vue app.
7. **Offline.** No network calls. Same contract as `report` mode.

## Cross-references

- [references/plan-workflow.md](../references/plan-workflow.md) —
  full workflow, data collection, tier rules, edge cases.
- [references/plan-examples.md](../references/plan-examples.md) —
  worked `billing-service` example for granularity calibration.
- [references/plan-validation.md](../references/plan-validation.md) —
  self-check for the rendered plan (roll-up integrity, DoD coverage).
- [references/plan-scenarios.md](../references/plan-scenarios.md) —
  five curated planning scenarios with recommended flags.
- [references/plan-metrics.md](../references/plan-metrics.md) —
  north-star metric catalog by project type.
- [references/plan-capacity.md](../references/plan-capacity.md) —
  capacity vs demand model (green / amber / red verdict).
- [references/plan-assumptions.md](../references/plan-assumptions.md) —
  assumptions register model (validation date + consequence).
- [references/plan-diff.md](../references/plan-diff.md) —
  plan-vs-prior diff model (drift verdict + changed/added/removed items).
- [references/plan-review.md](../references/plan-review.md) —
  human review checklist (6 groups + sign-off block, all unchecked).
- [references/plan-decisions.md](../references/plan-decisions.md) —
  decision log model (rationale + alternatives + reversibility).
- [references/plan-render.md](../references/plan-render.md) —
  template substitution pipeline (Vue mount + `planToMarkdown()`
  export, conditional rendering pattern replacing the old
  `{{*_BLOCK}}` convention, common bugs).
- [templates/index.html](../templates/index.html) —
  page shell with Vue mount point `#app` and resource loader
  (loads `shared/loader.js`, `data.js`, `index.css`, `index.js`).
- [templates/index.js](../templates/index.js) —
  Vue 3 app: inline template (13 sections), interactivity
  (expand/collapse, risk matrix filter, copy-as-markdown,
  print), and the `window.planToMarkdown(plan)` exporter.
- [templates/index.css](../templates/index.css) —
  all styles, layered (`reset → tokens → base → layout →
  components → sections → utilities → responsive → print`).
- [templates/data.js](../templates/data.js) —
  data schema (default values + example fixture), the single
  source of truth for what the renderer can render. Replaces
  the old `README.md` placeholder reference.

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Plan rendered and written |
| 2 | `--project` missing, path not a git repo, `git` not on PATH, template missing, or roll-up validation failed |

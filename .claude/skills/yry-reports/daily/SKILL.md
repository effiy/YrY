---
name: daily
description: >
  Daily engineering helper — four modes in one skill. (1) **ask** a
  developer question and get an answer grounded in real daily.dev
  articles, (2) **api** the daily.dev REST API directly, (3)
  **report** generate a daily CTO-perspective HTML page report for a
  specified local project, (4) **plan** generate a planning checklist
  (milestones, work breakdown, risk mitigations, team allocation,
  definition-of-done) for a local project as a self-contained HTML
  page or markdown file.

  Trigger when the user wants to: ask a developer question and ground
  the answer in real community articles; call the daily.dev API
  (feeds, bookmarks, tags, sources, posts, search, custom feeds);
  generate a daily, CTO-lens status report for a local repository
  (commits, PRs, hot files, risk, health, people) as a self-contained
  HTML page; or produce an engineering planning checklist / roadmap
  / sprint plan / milestone breakdown / work breakdown structure /
  definition-of-done list for a local project.

  Trigger words: daily, daily.dev, dailydev, daily report, daily
  project report, project status, CTO report, dev news, developer
  feed, ask daily.dev, search dev articles, my feed, bookmark this,
  follow tag, build my stack, weekly digest, trending radar, search
  articles, community articles, project health, project risk, hot
  files, long-lived branches, bus factor, contributor distribution,
  plan, planning checklist, roadmap, sprint plan, milestone breakdown,
  work breakdown structure, WBS, definition of done, DoD checklist,
  engineering plan, next sprint, release plan, kickoff plan.

  Do NOT trigger for: generic WebSearch, news topics unrelated to
  developer content, IC-level coding tasks, language/framework
  tutorials, curated reading lists (CTO / interview / design pattern
  navigation), or topics that no registered source covers (e.g.
  sales, legal, pure marketing tactics unrelated to developer
  marketing).
lifecycle: default-pipeline
user_invocable: true
---

# daily — Four Modes, One Skill

> One skill, four modes. Daily.dev (`ask` / `api`), a daily
> CTO-perspective project report (`report`), and an engineering
> planning checklist (`plan`). Mode is determined by the first arg
> after `/daily`.

## Quick Start

```
/daily ask <question>                     → ground answer in daily.dev articles
/daily api <operation>                    → call api.daily.dev directly
/daily report --project <path>            → daily CTO HTML report for a project
/daily plan --project <path>              → engineering planning checklist (HTML / MD)
```

The first arg after `/daily` picks the mode. Everything else is
free-form.

## What this skill does

- **ask mode** — searches daily.dev's article graph (keyword +
  semantic), deduplicates results, weighs by `numUpvotes` /
  `numComments`, and returns a grounded answer with citations.
- **api mode** — calls the daily.dev REST API on the user's behalf
  (feeds, posts, tags, sources, bookmarks, custom feeds, profile
  stack, search).
- **report mode** — reads a local git repository + filesystem,
  synthesizes a CTO-lens daily briefing (summary, risk, health,
  people), and writes a self-contained static HTML page built from
  the 4-file template at `templates/report/{index.html,index.js,
  index.css,data.js}`. Output goes to
  `<out>/<YYYY-MM-DD>/{index.html,index.js,index.css,data.js}`
  (default `~/.claude/reports/<project>/<YYYY-MM-DD>/`; override
  with `--out`). Offline + git-only, no network calls.
- **plan mode** — reads a local git repository + filesystem, infers
  the current state (active branches, TODOs, hot files, recent
  velocity), and produces an engineering planning checklist across
  three time tiers — **30 days** (sprint-tier execution), **90
  days** (quarter-tier commitments), and **long-term** (strategic
  bets). Each tier carries its own milestones / themes / bets,
  work breakdown, risk mitigations, team allocation, and a tiered
  definition-of-done list. 30d milestones roll up into 90d themes,
  which roll up into long-term bets. Output is a self-contained
  HTML page (default) or markdown file, written to
  `~/.claude/plans/<project>/<YYYY-MM-DD>-plan.{html,md}`. Offline
  + git-only, no network calls.

## What this skill does NOT do

- Does NOT invent or paraphrase article content. If the article
  graph doesn't cover the question, say so.
- Does NOT send `DAILY_DEV_TOKEN` to any domain other than
  `api.daily.dev`. Tokens are prefixed `dda_` and must be treated
  as sensitive.
- Does NOT bypass Plus-only endpoints (403) — surfaces the error
  and tells the user how to upgrade.
- Does NOT scrape the daily.dev web app. Use the API.
- Does NOT make network calls in `report` mode — the report is
  entirely offline + git-only.
- Does NOT execute or run the project under report. The report
  reads files; it does not build, test, or deploy.
- Does NOT curate reading lists (CTO / interview / design pattern
  navigation) — those are separate skills. The CTO perspective here
  is expressed through the `report` mode's lens, not as a reading
  navigator.
- Does NOT execute or run the project under plan. The plan reads
  files and git state; it does not build, test, or deploy.
- Does NOT commit to dates on the user's behalf. Plan mode proposes
  milestones and an order; the user owns the calendar.

## Mode selection

The first arg after `/daily` is the mode. When the user doesn't
specify a mode, infer from intent:

| Prompt shape | Default mode |
|--------------|--------------|
| Question with no verb ("Is React Server Components worth it?") | `ask` |
| Imperative mentioning an endpoint / account / mutation | `api` |
| Mentions a project path, `--project`, or asks for a status / daily report | `report` |
| Mentions "plan", "roadmap", "sprint", "milestone", "WBS", "DoD", or asks for a planning checklist | `plan` |

When two modes could apply, the more specific mode wins. When still
ambiguous, ask.

## Workflow

```
1. Detect mode       → first arg, or infer from prompt
2. Mode-specific flow
   ├─ ask:      search (keyword + semantic) → dedupe → synthesize → cite
   ├─ api:      load api-reference.md → pick endpoint → curl with bearer
   ├─ report:   git + filesystem → 4 sections → write self-contained HTML
   └─ plan:     git + filesystem → 3 tiers (30d/90d/long) × 5 sections → write self-contained HTML / MD
3. Handle errors     → 401 / 403 / 404 / 429 with the right recovery
4. Cite sources      → ask cites every claim; report / plan cite nothing (offline)
```

Key principles:
1. **Mode is explicit, not guessed.** When the prompt is a question
   with no verb, default to `ask`. When it mentions an endpoint /
   account / imperative, default to `api`. Report cues are usually
   explicit ("project report", `--project`, a repo path). Plan cues
   are "plan", "roadmap", "sprint plan", "milestone", "DoD".
2. **Cite every claim in `ask` mode.** A response without a sources
   block is incomplete.
3. **Never embed the `DAILY_DEV_TOKEN` in commands the user will
   share.** Always pipe it through `$DAILY_DEV_TOKEN` and
   `Authorization: Bearer`.
4. **One search is rarely enough in `ask` mode.** The ask workflow
   is iterative — start with one keyword + one semantic query, then
   follow up on the most useful tags and source names that surface.
5. **`report` and `plan` modes are offline.** No network calls. If
   the user wants a CI-integrated report, hand off to a CI-specific
   tool.
6. **CTO perspective is in the `report` mode, not a separate
   reading-list mode.** Use `report` for project briefings; route
   curated reading-list questions to the relevant dedicated skill.
7. **`plan` mode proposes, never commits.** Milestone dates and
   team assignments are draft proposals — the user owns the
   calendar and the headcount. Always label the output as a draft
   until the user confirms.
8. **`plan` mode uses the 4-file template.** The Vue 3 app
   lives in `templates/index.html` + `templates/index.js`; the
   data schema lives in `templates/data.js`; styles in
   `templates/index.css`. Read the schema (`@data_shape` JSDoc
   in `data.js`) before writing the output; do not reinvent
   the structure inline. For `--format md`, call
   `window.planToMarkdown(plan)` exported from `index.js`.
9. **`plan` mode uses the three-horizon model.** 30 days (sprint),
   90 days (quarter), long-term (strategic bets). Every tier must
   be rendered unless `--tiers` excludes it; 30d rolls up to 90d,
   90d rolls up to long-term. No orphan milestones.
10. **`plan` mode granularity matches the tier.** 30d is S/M/L with
    file guesses; 90d is XL epics with themes; long-term is bets
    with kill criteria. Finer granularity at longer horizons is
    theater.
11. **`report` mode uses the 4-file template at `templates/report/`.**
    Output goes to `<out>/<YYYY-MM-DD>/{index.html,index.js,
    index.css,data.js}` (default `~/.claude/reports/<project>/
    <YYYY-MM-DD>/`; override with `--out`). The schema lives in
    `templates/report/data.js`; do not write a one-off HTML file
    — match the catalog pattern of `files` / `diagram` / `arch` /
    `test` so all reports render consistently. Read
    `@data_shape` in `data.js` before populating; `mergeWithDefaults()`
    fills missing fields so the page still renders with sensible
    `—` placeholders.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` (ask-workflow, api-reference, security, token-storage, project-report-workflow, plan-workflow) | read |
| `templates/**` (index.html, index.js, index.css, data.js — for `plan` mode) | read |
| `templates/report/**` (index.html, index.js, index.css, data.js — for `report` mode) | read |
| Skill directory | read + write |
| `~/.claude/reports/<project>/<YYYY-MM-DD>/` (report mode output, 4-file layout) | read + write |
| `~/.claude/plans/<project>/` (plan mode output) | read + write |
| `<project>/.git/**` and `<project>/**` (report / plan mode input) | read |
| Network to `api.daily.dev` only (ask / api modes) | required (via `Bash` + `curl`) |
| Outside the skill directory | no automatic writes |

## Commands

| Mode | When to use | Detail |
|------|-------------|--------|
| `ask <question>` | User wants a grounded answer to a developer question | [references/ask-workflow.md](./references/ask-workflow.md) |
| `api <operation>` | User wants to call a daily.dev endpoint | [references/api-reference.md](./references/api-reference.md) |
| `report --project <path>` | User wants a daily CTO HTML report for a local project | [references/project-report-workflow.md](./references/project-report-workflow.md) |
| `plan --project <path>` | User wants an engineering planning checklist for a local project | [commands/plan.md](./commands/plan.md) · [references/plan-workflow.md](./references/plan-workflow.md) · [references/plan-examples.md](./references/plan-examples.md) · [references/plan-validation.md](./references/plan-validation.md) · [references/plan-scenarios.md](./references/plan-scenarios.md) · [references/plan-metrics.md](./references/plan-metrics.md) · [references/plan-decisions.md](./references/plan-decisions.md) |

## Rules

| # | Rule | Why |
|---|------|-----|
| 1 | Resolve the `DAILY_DEV_TOKEN` before any API call in `ask` / `api` modes | Silent 401s are confusing; the user needs to know early |
| 2 | Default to `ask` when the prompt is a question with no verb and no other cue | Questions deserve grounded answers, not raw endpoint output |
| 3 | Run keyword + semantic searches in the same turn for `ask` mode | Two angles → less coverage gap than one |
| 4 | Dedupe by `id` across all search rounds in `ask` mode | The same article appearing twice wastes context |
| 5 | Weight by `numUpvotes` first, `numComments` second in `ask` mode | Engagement is the closest proxy for credibility the API gives us |
| 6 | Cite the URL of every claim in `ask` mode | The whole point of `ask` mode is grounded, source-linked answers |
| 7 | Read `references/api-reference.md` before calling an unfamiliar endpoint | The endpoint surface is wide; the spec is the source of truth |
| 8 | Back off on 429 with the `Retry-After` value | 60 req/min is shared; one runaway subagent can starve the rest |
| 9 | Never print the `DAILY_DEV_TOKEN`, even redacted — refer to it as `$DAILY_DEV_TOKEN` | Token leaks in shared transcripts are the #1 risk |
| 10 | In `report` mode, never execute the project; only read files | The report is offline + git-only; running the project is a different skill |
| 11 | In `report` mode, the output is the 4-file layout under `<out>/<YYYY-MM-DD>/`: `index.html` + `index.js` + `index.css` + `data.js`, loaded from `templates/report/` | The 4-file layout matches the other yry-reports (files, diagram, arch, test) so the catalog renders consistently; do not collapse to a single self-contained `.html` |
| 12 | If the user asks for a curated reading list (CTO, interview, design patterns), do NOT route to a missing mode — say "out of scope for this skill" and suggest a dedicated skill | The skill used to bundle curated indexes; those have been removed, so do not pretend to have them |
| 13 | In `plan` mode, load the template from `templates/index.html` (with `data.js` as the schema) before writing output | The 4-file layout (`data.js · index.html · index.css · index.js`) is the source of truth; reinventing the structure inline drifts from the contract and breaks evals |
| 14 | In `plan` mode, when `--format md` is requested, call `planToMarkdown(plan)` from `templates/index.js` (the markdown exporter is a function, not a separate template file) | The old `plan-checklist.md` template has been folded into the Vue app's `planToMarkdown()` so the schema only lives in one place |
| 15 | In `plan` mode, every 30d work item must have an owner placeholder (`<unassigned>` is valid) and a size estimate (S / M / L / XL) | Unowned, unestimated tasks are the #1 reason plans rot |
| 16 | In `plan` mode, every milestone / theme / bet (any tier) must have a DoD checklist with ≥ 1 acceptance criterion | A milestone without DoD is a wish, not a plan |
| 17 | In `plan` mode, never invent dates. Use `T+Nd` relative offsets; the user converts to calendar dates | The skill does not know the user's calendar, holidays, or sprint cadence |
| 18 | In `plan` mode, the output is a draft until the user confirms. Label it "DRAFT — <YYYY-MM-DD>" in the header | Plans that look final get shared prematurely |
| 19 | In `plan` mode, never execute the project; only read files + git state | Same offline contract as `report` mode |
| 20 | In `plan` mode, render all three tiers (30d / 90d / long-term) unless `--tiers` excludes one | The three-horizon model is the contract; dropping a tier silently breaks the roll-up |
| 21 | In `plan` mode, every 30d milestone traces to a 90d theme; every 90d theme traces to a long-term bet | Orphan work is the #1 reason quarterly plans fail to ship |
| 22 | In `plan` mode, every long-term bet has a kill criteria + decision point | Bets without kill criteria are sunk-cost magnets |
| 23 | In `plan` mode, granularity matches the tier — 30d is S/M/L with file guesses; 90d is XL epics; long-term is bets only | Finer granularity at longer horizons is theater |

## Supporting resources

- [references/ask-workflow.md](./references/ask-workflow.md) —
  iterative search strategy, dedupe, synthesis template, sources
  block format.
- [references/api-reference.md](./references/api-reference.md) — full
  endpoint catalog, auth, rate limits, error codes, agent use cases.
- [references/security.md](./references/security.md) — token
  handling rules (`dda_` prefix, never log, never share).
- [references/token-storage.md](./references/token-storage.md) —
  macOS Keychain / Windows Credential Manager / Linux Secret
  Service setup, one-liner per platform.
- [references/project-report-workflow.md](./references/project-report-workflow.md) —
  inputs, data collection, output structure, risk heuristics,
  edge cases for `report` mode.
- [references/plan-workflow.md](./references/plan-workflow.md) —
  inputs, data collection, 5 planning sections, milestone / WBS /
  DoD structure, template usage, edge cases for `plan` mode.
- [references/plan-examples.md](./references/plan-examples.md) —
  fully worked example for a mid-stage project (`billing-service`),
  used to calibrate granularity, tone, and the 30d → 90d → long-term
  roll-up pattern.
- [references/plan-validation.md](./references/plan-validation.md) —
  self-check rules the skill runs against its own output before
  writing (roll-up integrity, DoD coverage, owner/size, date
  format, granularity, tone). Failures refuse to write and exit 2.
- [references/plan-scenarios.md](./references/plan-scenarios.md) —
  five curated planning scenarios (greenfield, scaling,
  maintenance, incident response, pre-launch) with recommended
  flags and typical 30d / 90d / long-term thrust for each.
- [references/plan-metrics.md](./references/plan-metrics.md) —
  north-star metric catalog by project type (SaaS, infra,
  consumer, marketplace, dev platform, internal tooling) plus
  anti-metrics and a "picking a metric when stuck" recipe.
- [references/plan-capacity.md](./references/plan-capacity.md) —
  capacity vs demand model (active committers × working days ×
  focus factor vs. work item sizes + meeting/oncall overhead +
  15% buffer). Verdict green / amber / red; red refuses to
  write unless `--allow-overcommit`.
- [references/plan-assumptions.md](./references/plan-assumptions.md) —
  assumptions register model: every load-bearing belief gets a
  validation date (T+Nd), a signal, and an invalidation
  consequence (re-plan / cut / defer / kill / escalate).
  Inferred assumptions are tagged `[inferred]` for review.
- [references/plan-diff.md](./references/plan-diff.md) —
  plan-vs-prior diff model: compares identities (not text),
  classifies items as added / removed / changed / stable, and
  escalates to RED if any assumption moved to `invalidated`.
  Skipped with `--no-diff`; compare against a specific file
  with `--diff-vs <path>`.
- [references/plan-review.md](./references/plan-review.md) —
  human review checklist (distinct from machine validation):
  6 groups (narrative, roll-up, capacity, assumptions, risks,
  sign-off) with unchecked boxes. The gate a planner walks
  through before sharing the plan. Sign-off block has role
  placeholders (author / peer reviewer / stakeholder).
- [references/plan-decisions.md](./references/plan-decisions.md) —
  decision log model: every explicit choice (cut, override,
  tier exclusion, scope change) is recorded with date, rationale,
  alternatives considered, and reversibility level (reversible /
  hard to reverse / irreversible). Inferred decisions are tagged
  `[inferred]`. Prevents revisiting settled choices and surfaces
  the load-bearing ones for review.
- [references/plan-render.md](./references/plan-render.md) —
  template substitution pipeline: the contract for turning
  `templates/index.html` + `data.js` into a finished plan file.
  Documents the Vue mount + `planToMarkdown()` export, the
  conditional rendering pattern (replacing the old
  `{{*_BLOCK}}` → `''` convention), and the common bugs
  (unexpanded placeholders, orphan cells, pre-checked
  checkboxes, calendar dates).
- [templates/index.html](./templates/index.html) —
  self-contained page shell for `plan` mode output. Loads
  `shared/loader.js`, `data.js`, `index.css`, `index.js`.
- [templates/index.js](./templates/index.js) —
  Vue 3 app: inline template (13 sections), interactivity
  (expand/collapse, risk matrix filter, copy-as-markdown,
  print), and the `window.planToMarkdown(plan)` exporter.
- [templates/index.css](./templates/index.css) —
  all styles, layered (`reset → tokens → base → layout →
  components → sections → utilities → responsive → print`).
- [templates/data.js](./templates/data.js) —
  data schema (default values + example fixture), the single
  source of truth for what the renderer can render. Replaces
  the old `README.md` placeholder reference.
- [templates/report/index.html](./templates/report/index.html) —
  page shell for `report` mode output. Loads
  `shared/loader.js`, the `yry-back-top` shared component, the
  report `data.js`, `index.css`, and `index.js`. The
  `{{REPORT_TITLE}}` placeholder is replaced at write time.
- [templates/report/index.js](./templates/report/index.js) —
  Vue 3 app: runtime template (4 sections: summary, risk,
  health, people), interactivity (section collapse, severity
  pills, KPI grid, horizontal bars, hbar widths), and the
  `yry-daily-report-ready` mount event. Reads
  `window.REPORT_DATA`.
- [templates/report/index.css](./templates/report/index.css) —
  all styles, layered CSS (`reset → tokens → base → layout →
  components → sections → utilities → responsive → print`)
  with light/dark mode via `prefers-color-scheme`.
- [templates/report/data.js](./templates/report/data.js) —
  data schema (`meta`, `summary`, `risk`, `health`, `people`)
  with `DEFAULT_DATA`, `EXAMPLE_DATA`, and `mergeWithDefaults()`
  so any missing scalar renders as `—` and any missing array
  produces no orphan header. `version: 1` for consumers to
  detect shape mismatches.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `DAILY_DEV_TOKEN` empty after keychain lookup | Walk the user through [references/token-storage.md](./references/token-storage.md); don't guess |
| 401 from API | Token is invalid/expired → direct user to https://app.daily.dev/settings/api |
| 403 from API | Plus subscription required → direct user to https://app.daily.dev/plus |
| 429 from API | Wait `Retry-After` seconds, retry once; surface if it persists |
| `ask` mode returns no articles | Say so explicitly; don't fabricate content. Suggest rephrasing the question |
| User pastes a non-developer question in `ask` mode | Still search; community articles sometimes cover tangentially — but flag if zero relevant results |
| Endpoint not in `api-reference.md` | Fetch the OpenAPI spec inline: `curl -s https://api.daily.dev/public/v1/docs/json` and look it up |
| `report` mode: `--project` not provided | Ask for the project path before touching the filesystem |
| `report` mode: path exists but is not a git repo | Refuse with a one-line error; exit code 2 |
| `report` mode: no `git` binary on PATH | Refuse with a one-line error; exit code 2 |
| `report` mode: empty repo / no activity in window | Render the report with "no material activity" and a "this is normal" note |
| `report` mode: `cloc` / `tokei` not installed | Fall back to a coarse `find … | xargs wc -l` count, mark the section as "coarse" |
| `report` mode: `--out` directory not writable | Surface the underlying error, suggest `~/.claude/reports/<project>/` |
| `report` mode: stale `.git` lock | Wait 5s once, retry; surface if it persists |
| `plan` mode: `--project` not provided | Ask for the project path before touching the filesystem |
| `plan` mode: path is not a git repo | Refuse with a one-line error; exit code 2 |
| `plan` mode: no `git` binary on PATH | Refuse with a one-line error; exit code 2 |
| `plan` mode: empty repo / no activity | Render the plan with "no historical signal — greenfield plan" note; still render all three tiers |
| `plan` mode: `--format md` requested | Use `planToMarkdown(plan)` exported from `templates/index.js`; default is HTML via `templates/index.html` |
| `plan` mode: `--horizon <duration>` not provided | Default to 30d for the inner tier; reflect the chosen horizon in the header |
| `plan` mode: `--tiers` excludes one or more tiers | Render the excluded section with a single "— excluded via --tiers —" line; keep nav anchors stable |
| `plan` mode: `--out` directory not writable | Surface the underlying error, suggest `~/.claude/plans/<project>/` |
| `plan` mode: user asks the skill to pick calendar dates | Refuse — propose T+Nd offsets and let the user pin them to a calendar |
| `plan` mode: 30d milestone without a 90d theme parent | Refuse to render — ask the user to clarify the roll-up before writing the file |
| `plan` mode: long-term bet without kill criteria | Refuse to render — ask the user to add a kill criteria before writing the file |
| User asks for a curated CTO / interview / design pattern reading list | This skill no longer bundles those indexes. Say so explicitly and suggest a dedicated skill rather than fabricating recommendations |
| Mode is genuinely ambiguous | Ask the user to pick a mode rather than guessing |

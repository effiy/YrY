# Engineering Planning Checklist — Workflow

> Generate an engineering planning checklist across three time
> horizons — **30 days (sprint-tier)**, **90 days (quarter-tier)**,
> and **long-term (6-12 months, strategic-tier)** — for a local
> project. Each tier carries its own milestones, work breakdown,
> risk mitigations, team allocation, and definition-of-done. Reads
> git + filesystem, proposes a draft plan, writes a self-contained
> HTML page (default) or markdown file to
> `~/.claude/plans/<project>/<YYYY-MM-DD>-plan.{html,md}`.

## Three-horizon model

| Tier | Window | Purpose | Granularity | Max milestones |
|------|--------|---------|-------------|----------------|
| **30d**  | T+0d → T+30d  | Sprint-tier execution — what ships in the next month | Fine: S/M/L work items, named files, concrete DoD | 3 |
| **90d**  | T+0d → T+90d  | Quarter-tier commitments — what completes by end of quarter | Medium: themes, epics, exit criteria | 4 |
| **Long-term** | T+90d → T+365d (or beyond) | Strategic-tier direction — bets, platform shifts, north stars | Coarse: themes, north-star metrics, decision points | 3 |

The three tiers are nested: 30d milestones roll up into 90d
themes, and 90d themes roll up into long-term bets. Each tier's
exit criteria must trace to a parent item in the next tier up.

If the user passes `--horizon`, it overrides the **inner** tier
only (30d default). The 90d and long-term tiers are always
rendered unless `--focus` excludes them.

## Inputs

| Arg | Required | Meaning |
|-----|----------|---------|
| `--project <path>` | yes | Absolute path to the project repo (must contain `.git`) |
| `--out <dir>` | no | Override for output directory (default `~/.claude/plans/<project>/`) |
| `--horizon <duration>` | no | Inner-tier window (default `30d`; accepts `14d`, `30d`, `45d`) |
| `--tiers <list>` | no | Comma-separated subset of `30d,90d,long` (default: all three) |
| `--format <html\|md>` | no | Output format (default `html`) |
| `--focus <area>` | no | One of `milestones`, `wbs`, `risk`, `team`, `dod`, `all` (default `all`) |
| `--open` | no | Open the rendered file in the default browser when done |

If `--project` is missing, ask. If the path is not a git repo,
refuse with a clear error.

## What the plan covers

The CTO / tech-lead lens — not the IC lens. Skip line-level task
breakdown and surface the decisions, sequencing, risks, and
acceptance criteria that a planner needs to commit a sprint,
quarter, or strategic bet.

### 1. Context (always)

- **Project identity** — name, top-level path, last commit hash + subject
- **Current state snapshot** — active branches, open TODO/FIXME count,
  test-to-src LOC ratio, dependency footprint
- **Recent velocity** — median commits/day over the lookback window
  (default last 14 days), top 3 contributors
- **One-paragraph framing** — what the project does, where it is in
  its lifecycle (greenfield / scaling / maintenance), and the
  planning thrust for each tier (e.g. "30d: stabilize auth; 90d:
  ship multi-tenant; long-term: platformize")

### 2. 30-day tier (always when `--tiers` includes `30d`)

Sprint-tier execution. The horizon where the plan is most concrete
and most likely to be wrong in specifics.

- 2-3 milestones, each ≤ 2 weeks
- Each milestone has:
  - **ID** (30d-M1, 30d-M2, …) and **Name** (verb + object)
  - **Relative window** — `T+0d → T+10d` (never a calendar date)
  - **Exit criteria** — 1-3 bullets
  - **Dependencies** — prior 30d milestones only
  - **DoD checklist** — ≥ 1 acceptance criterion
- 3-7 work items per milestone, each with:
  - **Size** — S (≤ 1d) / M (1-3d) / L (3-5d) / XL (> 5d, split)
  - **Owner placeholder** — `<unassigned>` is valid
  - **Files likely touched** — inferred from churn + TODO density
  - **Risk tag** — `low` / `medium` / `high` / `unknown`

### 3. 90-day tier (always when `--tiers` includes `90d`)

Quarter-tier commitments. Themes and epics, not tasks.

- 2-4 themes (e.g. "Multi-tenant ready", "Test coverage ≥ 80%"),
  each with:
  - **ID** (90d-T1, 90d-T2, …) and **Name** (noun + qualifier)
  - **Exit criteria** — 1-3 bullets, measurable (metrics, not vibes)
  - **Roll-up** — which 30d milestones feed this theme
  - **Owner placeholder** — theme owner, not task owner
  - **North-star metric** — the one number that moves
- 2-4 epics per theme, each with a size estimate (XL or larger)
- Risks that span multiple 30d milestones (sequencing, capacity,
  external dependencies)

### 4. Long-term tier (always when `--tiers` includes `long`)

Strategic-tier direction. Bets, not commitments.

- 1-3 bets, each with:
  - **ID** (LT-B1, LT-B2, …) and **Name** (short phrase)
  - **Hypothesis** — one sentence ("We believe that …")
  - **Roll-up** — which 90d themes feed this bet
  - **North-star metric** — the one number that proves the bet
  - **Kill criteria** — what signal would invalidate this bet
  - **Decision point** — when we commit / pivot / kill (T+Nd)
- 1-2 platform / architectural shifts anticipated
- 1-2 north-star metrics for the project overall (not per bet)

### 5. Risk mitigations (always when `--focus` includes `risk`)

Risks are tagged with the tier they threaten (30d / 90d / long):

- **Risk** — one sentence
- **Tier** — 30d / 90d / long
- **Likelihood** — low / medium / high
- **Impact** — low / medium / high
- **Mitigation** — one concrete action
- **Owner placeholder** — `<unassigned>` is valid
- **Trigger** — what signal would escalate

### 6. Team allocation (always when `--focus` includes `team`)

- **Roster** — distinct authors from the lookback window + commit share
- **30d allocation** — work-item → suggested owner (git-blame draft)
- **90d allocation** — theme → owner (draft)
- **Bus-factor flags** — single-author files touched by 30d items
- **Reviewer pairing** — reviewer ≠ owner for every L / XL item

### 7. Definition-of-Done checklist (always when `--focus` includes `dod`)

A flat checklist that applies to the whole plan, tagged by tier:

**30d DoD**
- [ ] All 30d milestone exit criteria met
- [ ] All L / XL items have a reviewer assigned
- [ ] Test-to-src LOC ratio did not decrease vs baseline
- [ ] No new TODO/FIXME without a linked issue

**90d DoD**
- [ ] All 90d theme exit criteria met (north-star metrics moved)
- [ ] Every 30d milestone traces to a 90d theme
- [ ] Cross-team dependencies resolved or documented
- [ ] Capacity plan reviewed vs actual velocity

**Long-term DoD**
- [ ] Every 90d theme traces to a long-term bet
- [ ] Each bet has a kill criteria + decision point
- [ ] Platform shifts have a migration sketch (not a full plan)
- [ ] North-star metrics reviewed quarterly

### 8. Assumptions register (always unless `--focus` excludes `assumptions`)

Every load-bearing belief the plan rests on. See
`references/plan-assumptions.md` for the full model.

- **ID** (A1, A2, …) and **Assumption** (one sentence)
- **Tier** — which tier this assumption threatens (30d / 90d / long)
- **Validation** — `T+Nd` date the assumption gets checked
- **Signal** — the concrete metric / event that proves or disproves it
- **Consequence** — what happens if invalidated (re-plan / cut /
  defer / kill / escalate — never "re-evaluate")
- **Owner** — `<unassigned>` is valid
- **Status** — open / validated / invalidated

Inferred assumptions are tagged `[inferred]` so the user can
review them before sharing the plan.

### 9. Decision log (always unless `--focus` excludes `decisions`)

Every explicit choice (cut, override, tier exclusion, scope change)
recorded with rationale + alternatives. See
`references/plan-decisions.md` for the full model.

- **ID** (DL1, DL2, …) and **Date** (`T+0d` for this plan)
- **Decision** — one sentence
- **Rationale** — why this choice, not "because"
- **Alternatives considered** — ≥ 1 alternative with rejection reason
- **Reversibility** — reversible / hard to reverse / irreversible
- **Tier** — which tier this decision binds (30d / 90d / long)
- **Owner** — `<unassigned>` is valid
- **Status** — made / superseded / reversed

Inferred decisions are tagged `[inferred]`. Irreversible decisions
must link to an assumption and carry ≥ 3 sentences of rationale.

### 10. Plan diff vs prior (always unless `--no-diff`)

Compares today's plan against the most recent prior plan in
`~/.claude/plans/<project>/`. See `references/plan-diff.md` for
the full model.

- **Drift verdict** — stable / minor drift / major drift (RED if
  any assumption moved `open → invalidated`)
- **Counts** — stable / changed / added / removed items
- **Changed items** — field-level diffs with `→` notation
- **Added items** — new IDs with a `+` prefix
- **Removed items** — cut IDs with a reason in parentheses
  (cut / deferred / completed / orphaned)

Use `--diff-vs <path>` to compare against a specific prior plan
instead of the most recent one.

### 11. Traceability matrix (always)

One row per 30d work item, tracing up through the tiers. The
contract that makes roll-up integrity checkable at a glance.

| 30d work item | 30d milestone | 90d theme | Long-term bet | North-star metric |
|---------------|---------------|-----------|---------------|-------------------|

No `— ORPHAN —` cells. If any cell is orphaned, validation rule
R6 refuses to write the file — fix the roll-up gap first.

### 12. Capacity vs demand (always unless `--focus` excludes `capacity`)

Green / amber / red verdict based on (committers × working days ×
focus factor) vs (work item sizes + meeting/oncall overhead + 15%
buffer). See `references/plan-capacity.md` for the full model.

- **Available** — person-days the team actually has
- **Demand** — person-days the plan asks for
- **Verdict** — GREEN (slack) / AMBER (tight) / RED (overcommitted)
- **Suggested cuts** — when RED, ordered by dependency depth

RED refuses to write unless `--allow-overcommit` (adds `OVERCOMMITTED`
tag alongside `DRAFT`).

### 13. Human review checklist (always unless `--focus` excludes `review`)

The gate a planner walks through before sharing the plan. Distinct
from machine validation — this is human judgment, not rule-checking.
See `references/plan-review.md` for the full model.

- **Narrative** — context paragraph covers all three tiers
- **Roll-up integrity** — every tier traces up
- **Capacity** — verdict is green or amber
- **Assumptions** — every assumption has a consequence + signal
- **Risks** — every risk has a trigger
- **Sign-off** — author / peer reviewer / stakeholder placeholders

All checkboxes unchecked (a pre-checked review is a lie). Sits at
the bottom of the plan, after DoD.

### 14. Out of scope (do NOT include)

- Line-level task breakdown ("write function X in file Y")
- Calendar dates (use T+Nd offsets)
- Performance benchmarks
- Any data that requires running the project (the plan is offline)
- Named owners (use placeholders + git-blame suggestions labeled as draft)

## Data collection

Same offline contract as `report` mode — no API calls, no CI
integration. Everything comes from local git + filesystem reads.

```bash
# Project identity
git -C <project> rev-parse --show-toplevel
git -C <project> log -1 --format='%H %s'

# Recent velocity (median commits/day over the lookback window)
git -C <project> log --since='<window>' --pretty=format:'%ad' --date=short | sort | uniq -c

# Active branches
git -C <project> for-each-ref --format='%(refname:short)|%(committerdate:iso)|%(authorname)' refs/heads

# Top contributors
git -C <project> shortlog -sn --since='<window>'

# File churn (informs 30d WBS file guesses)
git -C <project> log --since='<window>' --pretty=format: --name-only | sort | uniq -c | sort -rn | head -10

# Single-author files (bus-factor for team allocation)
git -C <project> ls-files | while read f; do n=$(git -C <project> log --since='<window>' --pretty=format:'%an' -- "$f" | sort -u | wc -l); echo "$n $f"; done | awk '$1==1' | head -20

# TODO / FIXME density (DoD baseline)
git -C <project> grep -nE 'TODO|FIXME|XXX' | wc -l

# Test / src ratio (DoD baseline)
find <project> -type d \( -name node_modules -o -name .git -o -name dist -o -name build -o -name target -o -name .venv \) -prune -o -type f -print | grep -Ei '/(test|tests|__tests__|spec)/' | wc -l
find <project> -type d \( -name node_modules -o -name .git -o -name dist -o -name build -o -name target -o -name .venv \) -prune -o -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.py' -o -name '*.go' -o -name '*.rs' \) -print | wc -l
```

If `git` is unavailable or the path is not a repo, stop with a
single-line error and exit code 2.

## Template usage

The plan output is rendered from the 4-file template
(`YiDoc/templates/daily/index.html` + `data.js` + `index.css` + `index.js`),
not invented inline.

1. Read `YiDoc/templates/daily/index.html` (the page shell) and
   `YiDoc/templates/daily/data.js` (the schema + defaults + example).
2. The Vue 3 app in `YiDoc/templates/daily/index.js` reads
   `window.PLAN_DATA` and renders the page client-side. The
   shape of the data is documented in the JSDoc block at
   the top of `data.js` (`@data_shape`). The same shape is
   used by `planToMarkdown()` for the markdown output.
3. For granularity calibration, read `references/plan-examples.md`
   — the worked `billing-service` example shows exactly how fine
   30d work items should be vs 90d epics vs long-term bets.
4. Write to `~/.claude/plans/<project>/<YYYY-MM-DD>-plan.{html,md}`.
5. If `--open` was passed, open the file in the default browser.

Do not reinvent the structure. If any of the four files is
missing, exit with a one-line error pointing at `YiDoc/templates/daily/`
— do not fall back to an inline structure. The 4-file layout
is the source of truth for the renderer.

## Tier roll-up rules

| Rule | Why |
|------|-----|
| Every 30d milestone traces to exactly one 90d theme | A 30d milestone without a parent theme is orphan work |
| Every 90d theme traces to at least one long-term bet | A theme without a bet is a side quest |
| Long-term bets have a kill criteria + decision point | Bets without kill criteria are sunk-cost magnets |
| 30d granularity is S/M/L; 90d granularity is XL+; long-term is "bet / no bet" | Granularity matches the horizon — finer than that is theater |
| The inner tier (30d) is the only one with file-level guesses | 90d and long-term files are unknowable; don't pretend |

## Milestone / WBS / DoD rules

| Rule | Why |
|------|-----|
| Every milestone (any tier) has ≥ 1 DoD acceptance criterion | A milestone without DoD is a wish, not a plan |
| Every 30d work item has a size estimate (S / M / L / XL) | Unestimated tasks are the #1 reason plans rot |
| Every work item has an owner placeholder | `<unassigned>` is valid; inventing a name is not |
| Every L / XL item has a reviewer placeholder | Reviewer ≠ owner; bus-factor mitigation |
| Milestones use T+Nd offsets, never calendar dates | The skill does not know the user's calendar |
| Plan header is labeled "DRAFT — <YYYY-MM-DD>" | Plans that look final get shared prematurely |
| Max 3 milestones per 30d tier, 4 themes per 90d tier, 3 bets per long-term tier | More → the horizon is too long; split into phases |

## Risk heuristics (default thresholds)

Inherited from `report` mode, plus plan-specific signals:

| Signal | Tier | Threshold | Why |
|--------|------|-----------|-----|
| Hot file (churn) | 30d | ≥ 3 distinct authors in window | Collaboration cost — sequence, don't parallelize |
| Long-lived branch | 30d | > 7 days no merge | WIP risk — merge or defer |
| Single-author files | 30d | > 60% of files | Bus-factor risk — pair a reviewer |
| Dependency graph depth | 90d | > 5 layers deep | Sequencing risk — flatten or split |
| XL item count | 30d | > 2 per milestone | Estimation risk — split further |
| Unassigned items | 30d | > 40% of WBS | Ownership risk — staffing gap |
| TODO/FIXME growth | 90d | > +20% vs prior window | Tech-debt signal — add a paydown theme |
| North-star metric drift | long | metric moving away from target for 2 quarters | Bet-invalidation signal |
| Kill criteria missing | long | any bet without kill criteria | Sunk-cost risk — refuse to ship the plan |

Amber signals are shown inline; red signals add an "Action
suggested" tag and a one-line remediation hint.

## Writing the one-paragraph framing

The context section ends with a 3-5 sentence paragraph that
frames the plan across all three tiers. Cover:

1. What the project does (one sentence — assume the reader is a
   new tech lead, not the author)
2. Where it is in its lifecycle (greenfield / scaling / maintenance)
3. The 30d thrust (one phrase: ship / stabilize / refactor)
4. The 90d thrust (one phrase: what quarter commitment this rolls up to)
5. The long-term bet (one phrase: the north star the 90d work serves)
6. The single biggest assumption the plan makes (one sentence)

Tone: matter-of-fact, no marketing, no hedging. If the project
has no recent activity, say "no historical signal — falling back
to a greenfield plan" and proceed with a greenfield structure
across all three tiers.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| Empty repo / no commits in window | Render the plan with "no historical signal — greenfield plan" note; skip velocity + bus-factor sections; still render all three tiers |
| Monorepo | Treat top-level as the project; note sub-packages in the context, don't recurse |
| No `git` binary | Exit 2 with a one-line error |
| Path exists but is not a git repo | Exit 2 with "not a git repository" |
| `--out` directory not writable | Surface the underlying error, suggest `~/.claude/plans/<project>/` |
| `--format` is neither `html` nor `md` | Reject with usage hint before touching the filesystem |
| `--horizon` is invalid | Reject with usage hint; default to 30d for the inner tier |
| `--tiers` contains an unknown tier | Reject with usage hint; default to `30d,90d,long` |
| Template file missing | Exit 2 with a one-line error pointing at `YiDoc/templates/daily/`; do not fall back to inline structure |
| Stale `.git` lock (concurrent git op) | Wait 5s once, retry; surface if it persists |
| User asks the skill to pin calendar dates | Refuse — propose T+Nd offsets and let the user convert |
| User passes `--tiers long` only | Render only the long-term tier; still label as DRAFT |

## Privacy + data scope

- The plan reads **only** the project at `--project` and writes to
  the output dir. No network calls.
- Author emails appear in the team allocation section. If the user
  wants them redacted, pass `--redact-emails` (replaces the local
  part with `***`).
- The plan file is not encrypted. The user is responsible for
  where they share it.
- The default output dir is `~/.claude/plans/<project>/`. The user
  can `--out` elsewhere.

# plan-scenarios — Curated entry points for common planning situations

> Five ready-to-use planning scenarios. Each one names the
> situation, the recommended flags, the typical 30d / 90d /
> long-term thrust, and the signals that tell you you're in
> that scenario. Use these to invoke `/daily plan` with the
> right shape instead of starting from a blank prompt.

## How to use

1. Read the project's recent state (the `report` mode output is
   the best input — run `/daily report --project <path>` first
   if you haven't recently).
2. Match the project to one of the five scenarios below.
3. Invoke `/daily plan` with the recommended flags.
4. If two scenarios partially fit, pick the one whose "signals"
   column matches more closely — the plan can be re-run with
   different flags later.

## Scenario matrix

| # | Scenario | 30d thrust | 90d thrust | Long-term thrust | Recommended flags |
|---|----------|-----------|-----------|------------------|-------------------|
| 1 | Greenfield | Ship MVP | Validate PMF | Win the category | `--horizon 30d --tiers 30d,90d --focus milestones` |
| 2 | Scaling | Stabilize | Scale 10× | Platformize | `--horizon 30d --focus risk,team` |
| 3 | Maintenance | Pay down debt | Defend SLA | Extend runway | `--horizon 30d --focus risk,dod` |
| 4 | Incident response | Fix + RCA | Harden | Eliminate the class | `--horizon 14d --tiers 30d,90d --focus milestones,risk` |
| 5 | Pre-launch | Launch readiness | Launch + learn | Next version | `--horizon 14d --focus dod,risk` |

## Scenario 1 — Greenfield

**Signals**
- Repo is < 90 days old, or < 1000 LOC
- No production users yet, or < 10
- Test/src ratio is whatever the team's habit is (often low)
- No long-lived branches

**30d thrust: Ship MVP.** The goal is a thin vertical slice that
proves the core loop works end-to-end. Milestones should be
feature-shaped ("auth works", "first invoice generated",
"checkout completes"). Work items are S/M with file guesses —
the codebase is small enough that file-level guesses are accurate.

**90d thrust: Validate PMF.** The goal is signal, not scale.
Themes should be metric-shaped ("10 paying customers", "week-1
retention ≥ 40%"). Avoid infra themes ("rebuild the queue") —
they're premature. North-star metric is a user-facing adoption
number, not an engineering KPI.

**Long-term thrust: Win the category.** One bet: "We believe
this product becomes the default for <niche>." Kill criteria:
< 10 paying customers after 6 months of active selling.

**What to skip.** Don't render the long-term tier if the team
hasn't shipped yet — `--tiers 30d,90d` is enough. Long-term
bets before PMF are fiction.

## Scenario 2 — Scaling

**Signals**
- Production users in the 100s–10,000s
- Test/src ratio between 0.2 and 0.5 (ambitious but lagging)
- Hot files with 3+ authors in the last 14 days
- Bus-factor: > 40% single-author files
- TODO/FIXME count growing > 20% vs prior window

**30d thrust: Stabilize.** The goal is to stop the bleeding —
fix the flaky tests, close the incident cycle, add the missing
observability. Milestones are reliability-shaped ("webhook
success ≥ 99.5%", "p99 latency < 500ms"). Work items are M/L
with file guesses focused on the hot files from the report.

**90d thrust: Scale 10×.** Themes are capacity-shaped
("support 10× current volume", "multi-region ready"). Epics are
XL — this is where the architectural work lives. North-star
metric is a capacity or reliability number, not a feature count.

**Long-term thrust: Platformize.** One or two bets: "Extract
the core as a reusable primitive," "Become the system of record
for <domain>." Kill criteria: < 1 sibling product integrated
within 12 months.

**What to emphasize.** `--focus risk,team` — the risks are the
story (hot files, bus factor), and the team allocation is where
the hard conversations live.

## Scenario 3 — Maintenance

**Signals**
- Production users stable, growth flat or declining
- Test/src ratio > 0.5 (mature) or < 0.2 (neglected)
- Long-lived branches > 7 days are common
- TODO/FIXME count high and stable (not growing fast, not shrinking)
- Median commits/day < 2

**30d thrust: Pay down debt.** The goal is to reduce the
backlog without breaking what works. Milestones are
cleanup-shaped ("close 20 TODOs with tests", "delete 3 dead
features"). Work items are S/M — this is the scenario where
most items are small.

**90d thrust: Defend SLA.** Themes are reliability-shaped but
defensive, not offensive ("zero Sev-1 incidents", "dependency
upgrade wave"). North-star metric is incident count or MTTR.

**Long-term thrust: Extend runway.** One bet: "Keep this
product alive and revenue-neutral for 18 more months." Kill
criteria: revenue drops below break-even for 2 consecutive
quarters.

**What to emphasize.** `--focus risk,dod` — the risks are
slow-burn (deps rotting, knowledge concentration), and the DoD
is the contract that prevents the plan from becoming another
piece of abandoned documentation.

## Scenario 4 — Incident response

**Signals**
- A Sev-1 or Sev-2 incident in the last 7 days
- Hot files with 5+ authors in the last 3 days (war-room pattern)
- Long-lived branches created in the last 48 hours
- TODO/FIXME growth spike

**30d thrust: Fix + RCA.** The goal is to restore service and
write the RCA. Milestones are incident-shaped ("service
restored", "RCA published", "fix deployed"). Work items are
S/M with tight windows (T+1d, not T+10d). Use `--horizon 14d`
to narrow the inner tier.

**90d thrust: Harden.** Themes are defense-in-depth-shaped
("eliminate the class of bug", "add the missing alerting",
"run the game day"). North-star metric is "incidents of this
class" trending to zero.

**Long-term thrust: Eliminate the class.** One bet: "This
class of incident cannot happen again." Kill criteria: any
incident of the same class within 12 months.

**What to emphasize.** `--tiers 30d,90d --focus milestones,risk`
— the long-term tier is premature while the RCA is still open.
Risks are the story; everything else is secondary.

## Scenario 5 — Pre-launch

**Signals**
- A specific launch date is known (even if the skill won't pick one)
- Feature freeze is imminent or in effect
- Test/src ratio is the highest it's been (team is investing in QA)
- PR review coverage is high (> 80% of PRs have ≥ 1 reviewer)

**30d thrust: Launch readiness.** The goal is to pass the
launch checklist. Milestones are readiness-shaped ("bug count
< 10", "load test passes at 2× projected peak", "runbook
reviewed"). Work items are S/M — mostly verification, not
new feature work. Use `--horizon 14d` if the launch is < 2
weeks out.

**90d thrust: Launch + learn.** Themes are adoption-shaped
("10k signups in week 1", "day-7 retention ≥ 30%"). North-star
metric is a post-launch adoption number.

**Long-term thrust: Next version.** One bet: "The launch
validates the thesis; the next version doubles down." Kill
criteria: launch adoption < 50% of target after 30 days.

**What to emphasize.** `--focus dod,risk` — the DoD is the
launch checklist; the risks are the launch blockers. Everything
else is secondary.

## Anti-scenarios (when NOT to use plan mode)

- **The project is a single-file script.** A plan for a 200-line
  file is theater. Just edit the file.
- **The user wants a task list for today.** That's a todo list,
  not a three-horizon plan. Use a simpler tool.
- **The user wants a Gantt chart.** Plan mode produces T+Nd
  offsets, never calendar dates. If they need a Gantt, they
  need a project management tool, not this skill.
- **The user wants to commit to dates.** Plan mode refuses to
  pin calendar dates. This is by design, not a limitation.

## Combining with report mode

The best plan input is a fresh report. Run
`/daily report --project <path>` first, read the summary and
risk sections, then match to a scenario above. The report's
signals (hot files, bus factor, TODO growth) are exactly what
the scenario matrix keys off.

If the report is stale (> 7 days old), re-run it. Plans built
on stale signals are fiction.

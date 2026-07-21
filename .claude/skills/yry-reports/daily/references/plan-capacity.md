# plan-capacity — Capacity vs demand model

> The plan proposes work; capacity planning checks whether the
> team can actually do that work in the horizon. Without this
> step, a plan is aspirational — it lists what should happen,
> not what can happen. This reference defines the capacity model
> the `plan` mode renderer uses to fill the `{{CAPACITY}}`
> placeholder.

## The model

```
Available capacity (person-days) =
  active_committers
  × working_days_in_horizon
  × focus_factor

Demand (person-days) =
  Σ (work_item_size_estimate_in_days)
  + meeting_overhead
  + oncall_overhead
  + buffer
```

If demand > available capacity, the plan is over-committed. The
renderer flags it red and suggests cuts.

## Inputs

### active_committers

From the `report` mode data — the distinct authors who committed
in the lookback window. Use the 14-day window, not the horizon,
because the window reflects who's actually present. A committer
who appeared once 30 days ago but not in the last 14 days is
not active capacity for a 30d plan.

### working_days_in_horizon

Calendar days in the horizon minus weekends (and optionally
holidays, but the skill does not know the user's holiday
calendar — default to 5/7 of the horizon).

| Horizon | Working days |
|---------|-------------|
| 14d | 10 |
| 30d | 22 |
| 45d | 32 |
| 90d | 65 |

### focus_factor

The fraction of nominal capacity that actually goes to planned
work. The rest goes to meetings, email, code review, context
switching, production support, and the unplanned work that
always shows up.

| Team state | Focus factor | Why |
|-----------|-------------|-----|
| Single team, no oncall | 0.6 | Default — optimistic |
| Team with oncall rotation | 0.5 | Oncall steals 1-2 days/week from someone |
| Team in incident response | 0.3 | War-room conditions |
| Team in launch crunch | 0.4 | Launch readiness absorbs capacity |
| Maintenance-mode team | 0.5 | Low meeting load but high interrupt load |

The user can override with `--focus-factor <0..1>`. If they don't,
infer from the scenario (see `plan-scenarios.md`): incident
response → 0.3, pre-launch → 0.4, scaling → 0.5, default 0.6.

## Size estimates in days

The 30d WBS uses S / M / L / XL tags. Convert to person-days:

| Tag | Days | Notes |
|-----|------|-------|
| S | 0.5–1 | Trivial — a config change, a small fix |
| M | 1–3 | A normal work item — a feature, a test suite |
| L | 3–5 | A bigger feature — needs design + implementation + tests |
| XL | 5–10 | Should be split — but if kept, count as 7.5 (median) |

Use the median of each range when summing demand. The renderer
should expose the range in a tooltip so the user sees the
uncertainty.

## Overhead

### meeting_overhead

Default 0.5 person-days per committer per week (1 day/week of
meetings). Override with `--meeting-load <days/week>`.

### oncall_overhead

If the project has an oncall rotation (detected from
`.github/workflows/*oncall*` or a `docs/runbooks/` directory),
add 1 person-day per committer per week. Override with
`--oncall-load <days/week>`.

### buffer

Always add 15% buffer for unplanned work. This is non-negotiable
— the plan that has zero buffer is the plan that breaks.

## Demand calculation

```
demand =
  Σ size_estimate_days       # from 30d WBS
  + (active_committers × weeks_in_horizon × meeting_overhead_per_week)
  + (active_committers × weeks_in_horizon × oncall_overhead_per_week)
  × 1.15                      # buffer
```

## Capacity vs demand verdict

| Ratio | Verdict | Renderer behavior |
|-------|---------|-------------------|
| demand / capacity ≤ 0.85 | **Green** — plan is executable | Render capacity section with a green badge |
| 0.85 < ratio ≤ 1.0 | **Amber** — plan is tight | Render with amber badge; suggest cutting 1-2 items |
| ratio > 1.0 | **Red** — plan is over-committed | Render with red badge; refuse to write unless `--allow-overcommit` |

When red, the renderer should suggest specific cuts — the
lowest-priority work items by dependency depth (items with no
dependents can be cut).

## Edge cases

| Situation | Behavior |
|-----------|----------|
| No active committers in the window | Capacity = 0; demand is irrelevant; render "no team — cannot plan" and exit 2 |
| Single committer | Capacity = 1 × days × focus; flag bus-factor risk in the capacity section |
| `--focus-factor` out of (0, 1] | Reject with usage hint |
| Horizon is 0 or negative | Reject with usage hint |
| Demand is 0 (empty WBS) | Render "no work planned" — this is valid for a pure observation window |
| `--allow-overcommit` passed | Render red but write the file; header gets an "OVERCOMMITTED" tag alongside DRAFT |

## What the capacity section renders

```
Available capacity: 4 committers × 22 days × 0.5 focus = 44 person-days
Demand: 38 person-days (work items) + 8 (meetings) + 4 (oncall) × 1.15 buffer = 57.5
Verdict: RED — over-committed by 13.5 person-days (31%)
Suggested cuts (in dependency-depth order):
  - 30d-M3.4 — Load test at 3M/day (no dependents)
  - 30d-M2.3 — PDF watermark (no dependents)
```

The section is always rendered unless `--focus` excludes
`capacity`. It sits between the Traceability Matrix and the
Risks section — capacity is a risk, but it deserves its own
table because the numbers are the argument.

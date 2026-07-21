# plan-assumptions — Assumptions register

> Every plan is a bet on the future. The assumptions register
> makes those bets explicit — each assumption has a validation
> date (when we'll know if it's true) and an invalidation
> consequence (what happens to the plan if it's false). This is
> the single most valuable CTO artifact in the plan, because
> assumptions are what invalidate plans, and unnamed assumptions
> are what silently kill them.

## Why a register

The context paragraph names "the single biggest assumption." But
a real plan makes 5-15 assumptions:

- Volume assumptions (traffic stays under N)
- Team assumptions (headcount stays at N, no key departures)
- Vendor assumptions (provider stays available, pricing stable)
- Dependency assumptions (sibling team delivers X by T+Nd)
- Technical assumptions (the migration is reversible, the API
  contract won't break)
- Market assumptions (customer demand stays at current level)

Each one is a load-bearing wall. The register forces the planner
to name them, date them, and state the consequence — so when one
breaks, the plan has a documented response instead of a panic.

## Register schema

Each assumption has:

| Field | Meaning |
|-------|---------|
| **ID** | A1, A2, … |
| **Assumption** | One sentence — what we believe is true |
| **Tier** | Which tier this assumption threatens (30d / 90d / long) |
| **Validation date** | `T+Nd` — when we'll know if it's true |
| **Validation signal** | The concrete metric or event that confirms/denies |
| **Invalidation consequence** | What happens to the plan if false (re-plan, cut, defer, kill) |
| **Owner** | `<unassigned>` is valid; the person who watches the signal |
| **Status** | `open` / `validated` / `invalidated` |

## How to surface assumptions

The renderer pulls assumptions from three sources:

1. **Explicit user input** — the user passes assumptions via
   `--assumption "We believe webhook volume stays under 2M/day"`
   flags. Each becomes a row.
2. **Inferred from the plan** — the renderer scans the 30d WBS
   and 90d themes for load-bearing claims and adds them as
   rows. For example, a 30d milestone that depends on a sibling
   team's API implies an assumption about that team's delivery.
3. **Inferred from the report** — the report mode data surfaces
   volume trends, dependency footprints, and contributor
   concentration. Each unstable signal becomes an assumption
   row.

Inferred assumptions are labeled `[inferred]` so the user can
review and either confirm or strike them.

## Validation cadence

| Tier | Validation cadence | Why |
|------|-------------------|-----|
| 30d | Weekly | 30d assumptions break fast — check every week |
| 90d | Bi-weekly | 90d assumptions break slower — check every 2 weeks |
| long | Quarterly | long-term assumptions are directional — quarterly review |

The register's `Validation date` field should reflect this
cadence — not just "someday" but a specific `T+Nd`.

## Invalidation consequences

The `Invalidation consequence` field is the most important. It
forces the planner to pre-commit to a response, so when the
assumption breaks, the team doesn't freeze. Common patterns:

| Pattern | Example |
|---------|---------|
| **Re-plan** | If volume exceeds 2M/day, re-plan the 90d scale theme around sharding |
| **Cut** | If the sibling team's API slips, cut 30d-M2 (invoice PDF) from the 30d tier |
| **Defer** | If a key committer leaves, defer 90d-T3 (usage-based pricing) to next quarter |
| **Kill** | If adoption < 20% after 2 quarters, kill LT-B2 (metered billing default) |
| **Escalate** | If the vendor's uptime drops below 99%, escalate to the backup provider decision |

A consequence that says "re-evaluate" is not a consequence —
it's a hedge. Force a concrete response.

## What the assumptions section renders

```
Assumptions register (5 open, 0 validated, 0 invalidated)

| ID | Assumption | Tier | Validation | Signal | Consequence | Owner | Status |
|----|-----------|------|-----------|--------|-------------|-------|--------|
| A1 | Webhook volume stays under 2M/day through the quarter | 90d | T+30d | 7-day rolling avg | Re-plan 90d-T1 around sharding | <unassigned> | open |
| A2 | Priya remains on the team through 90d-T1 | 90d | T+30d | HR check-in | Defer 90d-T1 to next quarter | <unassigned> | open |
| A3 | FX provider uptime stays ≥ 99.5% | 90d | T+14d | Provider status page | Escalate to backup provider decision | <unassigned> | open |
| A4 [inferred] | The billing-core extraction is reversible | long | T+90d | Migration rollback test | Kill LT-B1 | <unassigned> | open |
| A5 [inferred] | Customer demand for metered billing stays at current survey level | long | T+180d | Beta signup count | Kill LT-B2 | <unassigned> | open |
```

The section sits between Context and the 30d tier — assumptions
are the foundation, and reading them first frames the rest of
the plan.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| User passes no `--assumption` flags and report has no unstable signals | Render an empty register with a note: "no load-bearing assumptions detected — this is unusual, review manually" |
| An assumption's validation date is in the past | Flag it amber; ask the user to update the status |
| An assumption's consequence is "re-evaluate" | Refuse; force a concrete consequence |
| An assumption has no owner | Render with `<unassigned>`; warn |
| User marks an assumption `invalidated` | The renderer should prompt: "Assumption A2 is invalidated. Apply the consequence (defer 90d-T1)?" — but this requires a re-plan, which is a separate invocation |

## Relationship to risks

Assumptions and risks are related but distinct:

- A **risk** is something that might go wrong. It has a
  likelihood and a mitigation.
- An **assumption** is something we're treating as true to
  make the plan work. It has a validation date and an
  invalidation consequence.

Every assumption implies a risk (the risk that the assumption
is false), but not every risk is an assumption (some risks are
known-unknowns we're not betting on). The renderer should
cross-link: each assumption row links to its corresponding risk
row if one exists.

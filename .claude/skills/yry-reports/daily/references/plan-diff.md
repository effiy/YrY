# plan-diff — Compare two plans to catch scope drift

> When a plan is re-run (daily, or after a re-plan), the CTO's
> first question is "what changed?" The diff answers that. It
> compares the new plan against the most recent prior plan in
> `~/.claude/plans/<project>/`, classifies every milestone /
> theme / bet / work item as added / removed / changed / stable,
> and renders a drift summary at the top of the new plan.

## When to diff

The diff runs automatically when:

1. A prior plan file exists in `~/.claude/plans/<project>/`
   (same project, earlier date), AND
2. The user did NOT pass `--no-diff`.

If no prior plan exists, the diff section renders with a single
line: "no prior plan found — this is the first plan for
`<project>`" and the rest of the plan proceeds normally.

## What gets compared

The diff operates on **identities**, not text. Each item has an
identity key derived from its ID + tier:

| Item type | Identity key | Compared fields |
|-----------|-------------|-----------------|
| 30d milestone | `30d-M<N>` | Name, Window, Exit criteria, DoD |
| 30d work item | `30d-M<N>.<n>` | Title, Size, Owner, Dependencies, Files, Risk |
| 90d theme | `90d-T<N>` | Name, Exit criteria, Roll-up, Owner, North-star |
| 90d epic | `90d-T<N>.E<n>` | Title, Size, Dependencies, Risk |
| Long-term bet | `LT-B<N>` | Name, Hypothesis, Roll-up, North-star, Kill criteria, Decision point |
| Assumption | `A<N>` | Assumption text, Tier, Validation, Signal, Consequence, Status |
| Risk | `R<N>` | Risk text, Tier, Likelihood, Impact, Mitigation, Trigger |

If an ID appears in both plans, the item is **stable** (no field
changes) or **changed** (≥ 1 field differs). If an ID appears
only in the new plan, it's **added**. If only in the prior, it's
**removed**.

## Classification

| Class | Meaning | Visual |
|-------|---------|--------|
| `added` | New in this plan | Green `+` prefix |
| `removed` | Gone vs prior | Red `−` prefix, struck through |
| `changed` | ID stable, ≥ 1 field differs | Amber `~` prefix, diff shown |
| `stable` | ID stable, no field changes | Gray `=` prefix |

The diff section at the top of the plan shows counts + a
drift verdict, then the per-item changes inline in each tier's
table (the renderer tags each row with its class).

## Drift verdict

| Drift | Verdict | Trigger |
|-------|---------|---------|
| `stable` | GREEN — plan is consistent with prior | ≥ 80% of items stable, no removed milestones/bets |
| `minor drift` | AMBER — small scope change | < 30% items changed/added/removed, no removed bets |
| `major drift` | RED — significant scope change | ≥ 30% items changed, OR any long-term bet removed, OR ≥ 2 milestones removed |

Red drift should prompt the user to confirm before sharing —
major drift between consecutive plans usually means the plan is
reactive, not deliberate.

## Field diff display

For `changed` items, the diff shows the field-level change:

```
30d-M1.2 — Add exponential backoff
  Size:      M → L
  Owner:     <unassigned> → Priya
  Files:     src/webhooks/retry.ts → src/webhooks/retry.ts, src/webhooks/backoff.ts
```

The renderer uses `→` for scalar field changes and set
differences (added elements prefixed `+`, removed prefixed `−`)
for list fields like Files or Dependencies.

## Roll-up integrity under diff

A removed milestone can orphan its work items. A removed theme
can orphan its milestones. The diff validates roll-up integrity
across the change:

- If a 90d theme is removed, every 30d milestone that rolled up
  to it must either roll up to a different (existing) theme or
  be removed too. Otherwise: orphan.
- If a long-term bet is removed, every 90d theme that rolled up
  to it must find a new parent or be removed.

Orphans from a diff are flagged red and block the write (same
as the base roll-up rule R5/R6).

## What the diff section renders

```
Plan diff vs prior (2026-07-16)

Drift verdict: AMBER — minor drift
  18 items stable · 3 changed · 2 added · 1 removed

Changed items:
  30d-M1.2 — Size: M → L; Owner: <unassigned> → Priya
  90d-T2 — Exit criteria tightened (5 currencies → 5 currencies + finance sign-off)
  A1 — Validation: T+30d → T+21d (pulled forward)

Added items:
  + 30d-M3.3 — Add coverage gate to CI (M)
  + A6 [inferred] — Sibling team API stable through Q3

Removed items:
  − 30d-M2.3 — PDF watermark (cut — no dependents, capacity pressure)
```

The section sits at the very top, above Context — the CTO reads
the diff before re-reading the plan.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| No prior plan exists | Render "first plan for <project>" note; skip the rest of the diff |
| Prior plan is older than 30 days | Warn: "prior plan is N days old — diff may be noisy" |
| Prior plan is a different format (html vs md) | Parse both; the diff is format-agnostic |
| `--no-diff` passed | Skip the diff section entirely |
| `--diff-vs <path>` passed | Compare against the specified plan file instead of the most recent prior |
| Prior plan failed validation | Still diff — the diff is about content, not validity |
| Item IDs were renumbered between plans | Heuristic: match by Name + Tier before falling back to ID; flag matches below 0.7 similarity as "likely renumbered" |

## Relationship to validation

The diff runs **after** validation passes. If validation refuses
to write, the diff doesn't render — there's nothing to diff
against. The user fixes the validation failure first, then the
diff appears in the written file.

## Relationship to assumptions

The diff tracks assumption status changes specially:

- `open → validated` — the assumption was confirmed; render with
  a green check.
- `open → invalidated` — the assumption broke; this is the most
  important diff signal. Render with a red flag and prompt the
  user to apply the documented consequence.

An invalidated assumption in the diff should escalate the drift
verdict to RED regardless of the item-count thresholds — a broken
assumption is a structural change, not a minor drift.

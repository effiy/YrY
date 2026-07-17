# plan-decisions — Decision log

> Every plan is a sequence of decisions: cut this, defer that,
> accept this risk, reject that alternative. The decision log
> makes those choices explicit — each decision has a date, a
> rationale, and the alternatives considered. This is the
> artifact that prevents re-litigation: when someone asks "why
> did we cut the PDF watermark?" six weeks later, the answer is
> in the log, not in someone's memory.

## Why a decision log

Plans without decision logs get re-litigated. A stakeholder who
joins late sees the plan's current state but not the reasoning
behind it. They ask "why isn't feature X in the 30d tier?" and
the team re-opens a debate that was already settled. The
decision log ends that loop — the decision, the date, the
rationale, and the alternatives are all on the record.

## What counts as a decision

Not every plan element is a decision. A decision is a **choice
between alternatives** where the planner explicitly rejected at
least one other path. Examples:

| Decision | Alternatives considered |
|----------|------------------------|
| Cut PDF watermark from 30d-M2 | Keep it; defer to next 30d; move to 90d |
| Use exponential backoff (not linear) | Linear backoff; no retry; circuit breaker |
| Accept webhook volume assumption (2M/day) | Instrument first, then plan; plan for 5M/day |
| Single-provider FX (not dual) | Dual-provider; build our own FX aggregator |
| Extract billing-core as a bet (not a commitment) | Commit to extraction now; defer to next year; skip |

Items that are NOT decisions:

- Work items that were always going to be done (no alternative
  was rejected)
- Assumptions that are pure beliefs (no choice was made)
- Risks that are just acknowledged (no mitigation was chosen)

## Decision schema

Each decision has:

| Field | Meaning |
|-------|---------|
| **ID** | DL1, DL2, … |
| **Date** | `T+Nd` — when the decision was made |
| **Decision** | One sentence — the choice that was made |
| **Rationale** | 1-3 sentences — why this choice |
| **Alternatives considered** | ≥ 1 other path, with a one-line reason it was rejected |
| **Reversibility** | `reversible` / `hard to reverse` / `irreversible` |
| **Tier** | Which tier this decision affects (30d / 90d / long) |
| **Owner** | `<unassigned>` is valid; the decision-maker |
| **Status** | `made` / `superseded` / `reversed` |

## Reversibility

The reversibility field is the most important. It tells the
reader how much weight the decision carries:

| Level | Meaning | Example |
|-------|---------|---------|
| `reversible` | Can be undone in < 1 sprint at low cost | "Use exponential backoff" — can switch to linear |
| `hard to reverse` | Undoing costs 1+ sprints or has migration cost | "Single-provider FX" — switching providers is a sprint of work |
| `irreversible` | Cannot be undone without a rewrite or major loss | "Ship the extraction as a separate package" — once published, the contract is load-bearing |

Irreversible decisions deserve more scrutiny than reversible
ones. A plan with 5 irreversible decisions is a plan that's
betting heavily on its assumptions — the assumptions register
should reflect that.

## Status lifecycle

| Status | Meaning | When |
|--------|---------|------|
| `made` | The decision is active and load-bearing | Default when written |
| `superseded` | A later decision replaced this one | When a re-plan makes a new decision on the same topic |
| `reversed` | The decision was undone | When the team explicitly reverses course |

Superseded and reversed decisions stay in the log — they're the
audit trail. The diff (round 8) tracks content changes; the
decision log tracks the reasoning behind those changes.

## How decisions surface

The renderer pulls decisions from three sources:

1. **Explicit user input** — the user passes decisions via
   `--decision "Cut PDF watermark — capacity pressure, no dependents"`
   flags. Each becomes a row.
2. **Inferred from the plan** — the renderer scans for:
   - Removed items in the diff (each removal is a decision)
   - `--allow-overcommit` (accepting overcommit is a decision)
   - Tier exclusions via `--tiers` (excluding long-term is a decision)
   - Focus factor overrides (choosing 0.3 for incident response
     is a decision)
3. **Inferred from the assumptions** — every assumption with
   status `validated` or `invalidated` implies a decision was
   made about the plan's validity.

Inferred decisions are tagged `[inferred]` so the user can
review and confirm or expand them.

## What the decisions section renders

```
Decision log (7 made · 0 superseded · 0 reversed)

| ID | Date | Decision | Rationale | Alternatives | Reversibility | Tier | Owner | Status |
|----|------|----------|-----------|-------------|---------------|------|-------|--------|
| DL1 | T+0d | Cut PDF watermark from 30d-M2 | Capacity pressure; no dependents | Keep (rejected: capacity); Defer (rejected: blocks 90d-T1) | reversible | 30d | <unassigned> | made |
| DL2 | T+0d | Use exponential backoff with jitter | Industry standard; better than linear under load | Linear (rejected: thundering herd); No retry (rejected: poor UX) | reversible | 30d | <unassigned> | made |
| DL3 | T+0d | Accept webhook volume assumption (2M/day) | Current trajectory supports it; instrumenting first would cost a sprint | Instrument first (rejected: delays 30d); Plan for 5M (rejected: over-engineering) | hard to reverse | 90d | <unassigned> | made |
| DL4 [inferred] | T+0d | Single-provider FX | Dual-provider adds a sprint of integration work | Dual-provider (rejected: cost); Build aggregator (rejected: scope creep) | hard to reverse | 90d | <unassigned> | made |
```

The section sits between the Assumptions Register and the 30d
tier — decisions are the bridge between what we believe
(assumptions) and what we do (the tiers).

## Edge cases

| Situation | Behavior |
|-----------|----------|
| User passes no `--decision` flags and no decisions are inferable | Render an empty log with a note: "no explicit decisions detected — this is unusual, review the plan for implicit choices" |
| A decision's rationale is "because" or empty | Refuse; force a real rationale |
| A decision has no alternatives listed | Warn; decisions without alternatives are preferences, not choices |
| An irreversible decision has no linked assumption | Warn; irreversible decisions should rest on a documented assumption |
| `--decision` text has no `—` separator | Warn; expected format is `"<decision> — <rationale>"` |

## Relationship to other sections

| Section | Question it answers | Relationship to decisions |
|---------|---------------------|--------------------------|
| Assumptions | What do we believe? | Decisions often rest on assumptions; link them |
| Diff | What changed? | A superseded decision shows up as a changed item |
| Risks | What might go wrong? | Some decisions create risks; link them |
| Review | Did a human check this? | The review checklist includes a decision-log check |

## Decision hygiene

- **Every cut is a decision.** If you removed an item from the
  plan, log why. "Cut" without a rationale is a mystery.
- **Every override is a decision.** `--allow-overcommit`,
  `--no-validate`, `--tiers 30d,90d` — each is a choice that
  should be logged.
- **Irreversible decisions deserve more text.** The rationale
  for an irreversible decision should be 3+ sentences, not 1.
- **Decisions link to assumptions.** If a decision rests on an
  assumption, the assumption ID should appear in the rationale.

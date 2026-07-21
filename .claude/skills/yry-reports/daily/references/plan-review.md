# plan-review — Human review checklist

> The machine validation (`plan-validation.md`) checks structural
> integrity — roll-up, DoD, capacity math, date formats. The
> review checklist is different: it's the human gate the planner
> walks through before sharing the plan. Machine validation asks
> "is this well-formed?"; the review checklist asks "is this
> right?".

## Why a separate checklist

Machine validation can check that every assumption has a
consequence field. It cannot check whether the consequence is
the *right* consequence. It can check that the context paragraph
is 3-5 sentences. It cannot check whether the paragraph actually
frames the plan. The review checklist is the step where a human
reads the plan and asks the questions the machine can't.

## The 6 review groups

### 1. Narrative

- [ ] Context paragraph names the thrust for all three tiers
  (30d / 90d / long-term)
- [ ] No marketing language ("revolutionary", "game-changing")
- [ ] No hedging in exit criteria ("might", "could possibly")
- [ ] The single biggest assumption is named in the context
- [ ] The single biggest risk is named in the context

### 2. Roll-up integrity

- [ ] Every 30d milestone traces to a 90d theme
- [ ] Every 90d theme traces to a long-term bet
- [ ] Traceability matrix has no `— ORPHAN —` cells
- [ ] No 90d theme or long-term bet is an orphan (has children
  in the tier below)

### 3. Capacity

- [ ] Capacity verdict is green or amber (or `--allow-overcommit`
  is documented and justified)
- [ ] Buffer is 15% of (work + meeting + oncall)
- [ ] Focus factor matches the scenario (see plan-scenarios.md)
- [ ] Active committer count reflects reality (not stale)
- [ ] If verdict is amber, the slack is real, not theoretical

### 4. Assumptions

- [ ] Every assumption has a concrete consequence (not
  "re-evaluate" or "monitor")
- [ ] Every assumption has a validation date in `T+Nd` form
- [ ] Every assumption has a checkable signal
- [ ] Inferred assumptions are tagged `[inferred]` and reviewed
- [ ] No assumption's validation date is in the past without a
  status update

### 5. Risks

- [ ] Every risk has a trigger signal (not just "likelihood: high")
- [ ] Tier tags are present (30d / 90d / long)
- [ ] Amber and red risks have mitigations
- [ ] The highest-impact risk has a named owner
- [ ] No risk is duplicated across tiers without explanation

### 6. Sign-off

- [ ] Author: `<name>` (the person who wrote the plan)
- [ ] Peer reviewer: `<name>` (a second set of eyes)
- [ ] Stakeholder: `<name>` (the person who cares about the outcome)
- [ ] Review date: `T+0d` (before sharing)
- [ ] Next review date: `T+Nd` (when the plan gets revisited)

## Sign-off roles

| Role | Who | Why |
|------|-----|-----|
| Author | The planner | Owns the plan's content |
| Peer reviewer | A second engineer/lead | Catches what the author missed |
| Stakeholder | The person who cares about the outcome | Confirms the plan serves the goal |

All three are `<unassigned>` until the user fills them in. A
plan shared without a sign-off block is a draft that pretends to
be final.

## When to review

- **Before sharing** — always. The review checklist is the gate.
- **After a re-plan** — if the diff shows major drift, re-review
  from scratch, not just the changed items.
- **At each assumption validation date** — when an assumption's
  validation date arrives, the owner reviews it and updates the
  status.

## Relationship to machine validation

The review checklist runs **after** machine validation passes.
Machine validation is the compiler; the review checklist is the
code review. Both are required — neither is sufficient alone.

| Machine validation | Review checklist |
|--------------------|-----------------|
| "Does every assumption have a consequence?" | "Is the consequence the right one?" |
| "Is the context 3-5 sentences?" | "Does the context actually frame the plan?" |
| "Is the capacity verdict green?" | "Is the focus factor honest for this team?" |
| "Are all checkboxes unchecked?" | "Did a human actually walk through them?" |

## What the review section renders

The review section is a flat checklist grouped by the 6 groups
above. All checkboxes are unchecked — the review hasn't happened
yet. The sign-off block has three role placeholders. The section
sits at the bottom of the plan, after DoD — it's the last gate.

When the user passes `--reviewed`, the checkboxes remain
unchecked but the sign-off block is filled with the user's name
and the review date. This does not check the boxes — the boxes
are for the reviewer to check manually, not for the tool to
pre-fill.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| `--focus` excludes `review` | Skip the section (rare — the review is usually always wanted) |
| User passes `--reviewed` | Fill the sign-off block with the user's identity + T+0d date; do not check boxes |
| A checkbox is pre-checked in the template | Refuse (validation rule V3) — a pre-checked review is a lie |
| Sign-off block has no author | Refuse (validation rule V4) — at minimum the author must be named |
| Plan is re-run after review | The review section resets to unchecked; the prior review is in the diff |

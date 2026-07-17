# plan-validation — Self-check for the rendered plan

> A checklist the skill runs against its own output before
> declaring the plan done. If any check fails, refuse to write
> the file and surface a one-line error pointing at the failing
> rule. The user can override with `--no-validate`, but the
> default is to enforce.

## When to run

After template substitution, before writing to
`~/.claude/plans/<project>/<YYYY-MM-DD>-plan.{html,md}`.

## Required checks

### Structural

| # | Check | Failure behavior |
|---|-------|------------------|
| S1 | Header contains `DRAFT — <YYYY-MM-DD>` tag | Refuse; add the tag |
| S2 | All three tiers present (unless `--tiers` excludes one) | Refuse; render the missing tier |
| S3 | Excluded tiers render as `— excluded via --tiers —`, not dropped | Refuse; restore the placeholder |
| S4 | Nav anchors match section ids (`#context`, `#tier-30d`, `#tier-90d`, `#tier-long`, `#risks`, `#team`, `#dod`) | Refuse; fix the anchor |

### Roll-up integrity

| # | Check | Failure behavior |
|---|-------|------------------|
| R1 | Every 30d milestone has a `Roll-up` field naming a 90d theme | Refuse; ask the user to clarify the parent theme |
| R2 | Every 90d theme has a `Roll-up` field naming a long-term bet (or explicitly "—") | Refuse; ask the user to clarify the parent bet |
| R3 | Every long-term bet has a `Kill criteria` field (non-empty) | Refuse; ask the user to add kill criteria |
| R4 | Every long-term bet has a `Decision point` in `T+Nd` form | Refuse; ask the user to add a decision point |
| R5 | No orphan 30d milestone (one whose parent theme doesn't exist in the 90d tier) | Refuse; either add the parent theme or drop the milestone |
| R6 | Traceability matrix has one row per 30d work item, with no `— ORPHAN —` cells | Refuse; fix the roll-up gap before writing |

### DoD coverage

| # | Check | Failure behavior |
|---|-------|------------------|
| D1 | Every milestone (any tier) has ≥ 1 DoD acceptance criterion | Refuse; add a criterion |
| D2 | DoD checklist is grouped by tier (30d / 90d / long-term) | Refuse; regroup |
| D3 | DoD checkboxes are unchecked (`<input type="checkbox">` without `checked`, or `- [ ]` in markdown) | Refuse; uncheck — the plan is a draft |

### Owner + size

| # | Check | Failure behavior |
|---|-------|------------------|
| O1 | Every 30d work item has an owner placeholder (`<unassigned>` is valid) | Refuse; add the placeholder |
| O2 | Every 30d work item has a size tag (S / M / L / XL) | Refuse; add the size |
| O3 | Every L / XL item has a reviewer placeholder distinct from the owner | Warn (amber); render but flag |
| O4 | No owner field contains an invented name (only git-blame-sourced names or `<unassigned>`) | Refuse; replace with `<unassigned>` |

### Dates

| # | Check | Failure behavior |
|---|-------|------------------|
| T1 | All windows are `T+Nd → T+Md` form, never calendar dates | Refuse; convert to offsets |
| T2 | The inner tier's end matches `--horizon` (e.g. `T+30d` when horizon is `30d`) | Warn; reflect the chosen horizon |
| T3 | No `T+Nd` exceeds 365 unless the tier is `long` | Warn; long-term is the only tier allowed beyond a year |

### Granularity

| # | Check | Failure behavior |
|---|-------|------------------|
| G1 | 30d tier has ≤ 3 milestones | Warn; suggest splitting the horizon |
| G2 | 90d tier has ≤ 4 themes | Warn; suggest splitting the quarter |
| G3 | Long-term tier has ≤ 3 bets | Warn; suggest focusing |
| G4 | 30d work items do not list file paths for 90d or long-term items | Refuse; drop file guesses at longer horizons |

### Capacity

| # | Check | Failure behavior |
|---|-------|------------------|
| C1 | Capacity section is rendered (unless `--focus` excludes `capacity`) | Refuse; render the section |
| C2 | Capacity verdict is green or amber, OR `--allow-overcommit` is passed | Refuse if red and no override; suggest cuts |
| C3 | Every 30d work item's size tag maps to a person-day range (S/M/L/XL) | Refuse; fix the tag |
| C4 | Focus factor is in (0, 1] | Refuse; reject the override |
| C5 | When verdict is red, suggested cuts list ≥ 1 work item | Refuse; either suggest cuts or accept overcommit explicitly |
| C6 | Buffer is exactly 15% of (work + meeting + oncall) | Warn; recompute — buffer is non-negotiable |

### Assumptions

| # | Check | Failure behavior |
|---|-------|------------------|
| A1 | Assumptions section is rendered (unless `--focus` excludes `assumptions`) | Refuse; render the section |
| A2 | Every assumption has a non-empty `Consequence` field | Refuse; force a concrete consequence |
| A3 | No assumption's consequence is "re-evaluate" or "monitor" | Refuse; force a concrete response (re-plan / cut / defer / kill / escalate) |
| A4 | Every assumption has a `Validation` field in `T+Nd` form | Refuse; add a validation date |
| A5 | Every assumption has a `Signal` field (the concrete metric/event) | Warn; add a signal so the validation is checkable |
| A6 | No assumption's validation date is in the past unless status is `validated` or `invalidated` | Warn; update the status or the date |
| A7 | Inferred assumptions are tagged `[inferred]` | Warn; tag them so the user can review |

### Diff

| # | Check | Failure behavior |
|---|-------|------------------|
| X1 | Diff section is rendered unless `--no-diff` is passed | Refuse; render the section (or honor `--no-diff`) |
| X2 | If no prior plan exists, diff renders the "first plan" note instead of an empty section | Refuse; render the note |
| X3 | Drift verdict is one of `stable`, `minor drift`, `major drift` | Refuse; recompute |
| X4 | Every `changed` item lists ≥ 1 field-level diff (not just "changed") | Warn; show the fields that differ |
| X5 | Every `removed` item has a reason in parentheses (cut / deferred / completed / orphaned) | Warn; add the reason |
| X6 | If any assumption moved `open → invalidated`, drift verdict is RED regardless of item counts | Refuse; escalate the verdict |
| X7 | Removed 90d themes and long-term bets trigger orphan-check on their former children | Refuse; fix the orphaned children before writing |

### Review

| # | Check | Failure behavior |
|---|-------|------------------|
| V1 | Review section is rendered (unless `--focus` excludes `review`) | Refuse; render the section |
| V2 | Review checklist has the 6 required groups (narrative, roll-up, capacity, assumptions, risks, sign-off) | Refuse; restore missing groups |
| V3 | Review checkboxes are unchecked (the review hasn't happened yet — the plan is a draft) | Refuse; uncheck — a pre-checked review is a lie |
| V4 | Sign-off block has ≥ 1 role placeholder (author / peer reviewer / stakeholder) | Refuse; add at least the author placeholder |
| V5 | Review section sits at the bottom of the plan (after DoD) | Warn; move it — review is the last gate |

### Decisions

| # | Check | Failure behavior |
|---|-------|------------------|
| DL1 | Decision log section is rendered (unless `--focus` excludes `decisions`) | Refuse; render the section |
| DL2 | Every decision has a non-empty `Rationale` field | Refuse; force a real rationale (not "because") |
| DL3 | Every decision lists ≥ 1 alternative considered | Warn; decisions without alternatives are preferences, not choices |
| DL4 | Every decision's `Reversibility` is one of `reversible` / `hard to reverse` / `irreversible` | Refuse; fix the tag |
| DL5 | Every irreversible decision has ≥ 3 sentences of rationale | Warn; irreversible decisions deserve more scrutiny |
| DL6 | Every irreversible decision links to an assumption (assumption ID in rationale or alternatives) | Warn; irreversible decisions should rest on a documented assumption |
| DL7 | Inferred decisions are tagged `[inferred]` | Warn; tag them so the user can review |
| DL8 | No decision has status `made` with an empty `Date` field | Refuse; date the decision |

### Tone

| # | Check | Failure behavior |
|---|-------|------------------|
| N1 | The context paragraph is 3-5 sentences | Warn; trim or expand |
| N2 | No marketing language ("revolutionary", "game-changing", "best-in-class") | Refuse; rewrite |
| N3 | No hedging ("might", "could possibly", "perhaps") in exit criteria | Warn; commit to a measurable criterion |

## Override

`--no-validate` skips all checks. Use only when the user
explicitly accepts the risk; the output header should then be
labeled `DRAFT — UNVALIDATED — <YYYY-MM-DD>`.

## Failure surface

When a check fails:

1. Do not write the file.
2. Print one line per failure: `[VALIDATION] <rule-id>: <message>`.
3. Exit with code 2.
4. Suggest the fix (from the "Failure behavior" column) and
   mention `--no-validate` as the escape hatch.

## Self-test

Run the validation against `references/plan-examples.md` (the
worked `billing-service` example). The example should pass every
check. If it doesn't, either the example or the validation rules
need updating — do not ship one without the other.

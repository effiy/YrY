---
title: Quarterly tech debt governance process
aliases:
- quarterly-tech-debt-process
- tech-debt-governance
tags:
- process
- tech-debt
- quarterly-governance
- ADR
- strangler-fig
category: engineer/quality-security
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./tech-roadmap-review.md
- ./dependency-upgrade.md
- ./data-migration.md
- ../../oncall-sre/observability/tech-debt-inventory.md
tacit: false
---

# Quarterly tech debt governance process

> **As an** engineer, **I want to** quarterly tech debt, **so that** process followed predictably.

> Turn "refactor" from a verbal promise into a rhythmic, resourced, tracked engineering output.

## Summary

- Process purpose: avoid the debt list growing without repayment, business planning squeezing out refactors, the team not knowing what to repay next quarter.
- 4 roles: TL (maintain the list + set priorities) / PM (allocate repayment capacity) / developer (execute + verify) / architect (strategy-level debt review).
- Quarterly cadence: 3 weeks before quarter-end TL updates the list → 2 weeks before quarter-end PM+TL joint review → 1 week before quarter-end feed into next-quarter planning → repay 1-2 items per iteration → quarter-end re-review.
- Repayment capacity allocation: each iteration 15-20% to debt repayment, P0/P1 enter iteration planning, P2/P3 opportunistic repayment.
- Single debt repayment process: write ADR → estimate workload → enter iteration planning → develop + test + verify → post-launch monitor metric improvement → close the debt item.
- Repayment principles: incremental repayment (strangler fig pattern, not one-shot rewrite), align with business (repay when touching related code), verify effectiveness (watch monitoring after launch), record the process (ADR retains the decision).
- Measurement metrics: total debt / quarterly new / quarterly repaid / net debt (should net decrease) / high-severity debt count / repayment capacity ratio (goal 15-20%).

## Core viewpoints

- Repayment capacity is a commitment, not "when free" — PM does not treat repayment as "non-business", plans it alongside the business.
- Incremental repayment beats big-bang refactor — strangler fig pattern replaces gradually, not one-shot rewrite, reduces risk.
- Repayment must be verified as effective — watch monitoring metrics improve after launch, otherwise it equals not repaid.
- Must record current interest — without assessing interest you don't know what is urgent; interest (person-days / month) is the core of prioritization.
- Quarterly net debt should net decrease — if not decreasing, either repayment capacity is insufficient or new debt exceeds repayment.

## Key information

### Roles and responsibilities

| Role | Responsibility |
|---|---|
| TL | Maintain the debt list, set priorities |
| PM | Allocate repayment capacity |
| Developer | Execute repayment + verify |
| Architect | Strategy-level debt review |

### Quarterly cadence

| Timing | Item |
|---|---|
| 3 weeks before quarter-end | TL updates the debt list |
| 2 weeks before quarter-end | PM + TL joint review, set next-quarter repayment items |
| 1 week before quarter-end | Repayment items enter next-quarter planning |
| Each iteration | Repay 1-2 items |
| Quarter-end | Re-review the list, new / repaid / withdrawn |

### Debt list fields

(see [tech-debt-inventory-template](../../oncall-sre/observability/tech-debt-inventory.md))

- Domain classification (code / test / architecture / dependencies / data / documentation / deployment / monitoring)
- Severity (high / medium / low)
- Current interest (person-days / month)
- Repayment cost (person-days)
- Priority (P0-P3)
- Owner

### Quarterly update actions

- New: new debt discovered this quarter
- Repaid: debt already repaid
- Withdrawn: evaluated as no longer relevant
- Up/down-grade: adjust priority based on interest changes

### Repayment capacity allocation

**Recommended ratio**:
- Allocate 15-20% of capacity per iteration to debt repayment
- P0/P1 enter iteration planning
- P2/P3 opportunistic repayment

### Decision matrix

| Impact scope | Interest rate | Repayment cost | Priority |
|---|---|---|---|
| Blocks strategy theme | High | Low | P0 |
| Blocks strategy theme | High | High | P1 |
| Blocks daily development | High | Low | P1 |
| Blocks daily development | Medium | Medium | P2 |
| Single-point issue | Low | Low | P3 |
| Single-point issue | Low | High | Do not repay |

### Single debt repayment process

1. Write ADR: why repay, risk, rollback
2. Estimate workload
3. Enter iteration planning
4. Develop + test + verify
5. Post-launch monitoring: whether the debt-impacted metric improves
6. Close the debt item

### Repayment principles

- Incremental repayment (strangler fig pattern): not one-shot rewrite
- Align with business: repay together when touching related code
- Verify effectiveness: watch monitoring metrics after launch
- Record the process: ADR retains the decision

### Quarterly governance meeting

**Participants**: TL + PM + architect + key developers

**Agenda (90 minutes)**:
1. Last quarter repayment retrospective (20 minutes): planned to repay X items, actually repaid Y items; incomplete reasons; metric changes after repayment
2. New debt review (30 minutes): whether each new item enters the list
3. Priority adjustment (20 minutes): re-review existing debt priorities
4. Next-quarter repayment plan (20 minutes): pick P0/P1 for next quarter; capacity allocation

### Measurement and tracking

| Metric | Meaning |
|---|---|
| Total debt | Full list size |
| Quarterly new | Discovered this quarter |
| Quarterly repaid | Repaid this quarter |
| Net debt | Total - repaid (should stay net decreasing) |
| High-severity debt count | Should be repaid first |
| Repayment capacity ratio | Actual vs goal 15-20% |

### Applicable scenarios

- Teams whose debt list grows without repayment
- Business planning squeezing out refactors
- Team not knowing what to repay next quarter
- Quarterly tech debt governance standardization

## Action recommendations

1. TL maintains the debt list; each item must have current interest (person-days / month) + repayment cost + priority
2. 3 weeks before quarter-end TL updates the list (new / repaid / withdrawn / up-downgrade)
3. 2 weeks before quarter-end PM+TL joint review for 90 minutes, set next-quarter P0/P1 repayment items
4. Allocate 15-20% of capacity per iteration to debt repayment
5. Single debt repayment follows the 6-step process: ADR → estimate → enter planning → develop + test → launch monitoring → close
6. Incremental repayment (strangler fig pattern), not one-shot rewrite
7. After launch, must watch monitoring metrics improve, verify effectiveness
8. Quarterly watch the net debt trend; goal is net decrease

## Anti-patterns

- **Debt list grows without repayment.** When the tech debt inventory grows quarter after quarter with no items being repaid, the list becomes a graveyard of good intentions rather than a management tool. The quarterly net debt must trend downward, and every quarter with zero repayment is a quarter where the team has implicitly accepted the accumulated interest. Force capacity allocation of 15-20% per iteration to debt repayment.

- **Business priorities squeezing out all refactoring work.** When product managers treat tech debt repayment as "non-business" work that can be deferred indefinitely, the quarterly repayment count hits zero. Debt repayment must be planned alongside business features in iteration planning, not treated as something that happens "when there's free time" — because there is never free time.

- **No interest assessment on debt items.** Without recording the current interest (person-days per month) for each debt item, the team cannot prioritize which debts are most urgent. A debt item that costs 10 person-days per month in workarounds is far more critical than one costing 0.1 person-days, but without interest tracking, they look identical on the list.

- **Big-bang refactoring instead of incremental repayment.** Attempting to rewrite an entire system at once is high-risk and rarely succeeds. The strangler fig pattern — gradually replacing pieces of the old system while keeping it operational — reduces risk, allows course correction, and delivers value incrementally. One-shot rewrites that take months without delivering intermediate value are projects, not debt repayment.

- **Repaying debt without verifying the improvement.** When a debt item is repaid but no monitoring metrics are checked afterward, the team cannot confirm whether the repayment actually solved the problem. Post-repayment monitoring must verify that the impacted metric (latency, error rate, developer time saved) actually improved. Repayment without verification is indistinguishable from no repayment.

## Related

- Same class: [tech roadmap review summary](../process/tech-roadmap-review.md) (strategy theme alignment)
- upstream: [tech roadmap review summary](../process/tech-roadmap-review.md) (strategy theme alignment)
- downstream: repayment items in iteration planning, ADR, [dependency upgrade process](../engineering/dependency-upgrade.md), [data migration process](../infrastructure/data-migration.md)
- template: [tech-debt-inventory-template](../../oncall-sre/observability/tech-debt-inventory.md) / [summary](../../oncall-sre/observability/tech-debt-inventory.md)

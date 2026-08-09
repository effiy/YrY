---
title: Manage tech debt
aliases:
- i-want-to-manage-tech-debt
- tech-debt-journey
- tech-debt-management entry
- repayment-priority entry
tags:
- journeys
- tech-debt
- inventory
- interest
- repayment-priority
- quarterly
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- tech-lead
- engineer
benefit: Tech leads can trace the rationale and outcome of this decision, preventing repeated re-derivation
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./plan-tech-roadmap.md
- ../architecture/design-architecture-decision.md
- ../../oncall-sre/observability/README.md
- ../../engineer/quality-security/quarterly-tech-debt.md
review_cycle: quarterly
tacit: false
---

# I want to manage tech debt

> **As a** tech lead, **I want to** manage tech debt, **so that** outcome is traceable.

> "How to inventory tech debt + quantify interest + rank repayment priority + repay quarterly" reaches tech-debt-inventory + interest quantification + repayment priority + quarterly process within 2 hops.

## Summary

- Inventory via [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) + [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md)
- Quarterly process via [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md)
- Priority sorting via [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking](../../knowledge-curator/templates/thinking--second-order-thinking.md)
- Capacity and cost co-built via [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) (FinOps)

## Core viewpoints

**Debt interest compounds non-linearly, not linearly.** A 30-minute daily drag from one piece of tech debt does not just cost 30 minutes. It fragments focus, delays context-switching recovery, and erodes team morale. The real cost is the cumulative effect on throughput and psychological safety, not the isolated time sink.

**Not all debt deserves repayment.** Some tech debt is low-interest and self-resolving -- the module gets rewritten anyway in the next quarter. The discipline is not to repay everything but to identify what actually drags the team. Low-interest, low-impact debt should be explicitly accepted and documented as "accepted," not guilt-tripped over.

**Debt inventory without interest quantification is a wish list, not a plan.** Listing 50 items of tech debt without quantifying the daily drag on development time is performative. The inventory only becomes actionable when each item has a concrete interest number attached -- how many minutes per day, how many engineers affected, how many features blocked.

**The most dangerous debt is the one nobody sees.** Architecture debt -- wrong abstraction, missing boundary, coupled modules -- is invisible in daily work but compounds faster than code debt. It should be hunted proactively through architecture reviews and dependency analysis, not just reported when someone stumbles on it.

**Quarterly repayment is a negotiation, not a mandate.** The one-week-per-quarter rule only works if product and business stakeholders understand the trade-off. Frame debt repayment as "this unblocks X features and prevents Y incidents" rather than "we need to clean up." Repayment without business buy-in will be the first thing cut when deadlines tighten.

## Key info

- **Tech debt classification taxonomy (5 types with interest rates)**: (1) Architecture debt — wrong abstraction, missing boundary, coupled modules; highest interest rate because every feature built on top compounds the cost; detected via architecture reviews and dependency analysis; (2) Code debt — duplicated code, magic numbers, missing error handling; medium interest rate, localized to specific files; detected via static analysis (SonarQube, ESLint); (3) Test debt — missing tests, flaky tests, slow test suites; interest manifests as fear of refactoring and slow CI feedback; (4) Documentation debt — outdated READMEs, missing API docs, stale architecture diagrams; interest manifests as onboarding friction and incorrect assumptions; (5) Dependency debt — outdated packages, unpinned versions, unmaintained libraries; interest manifests as security vulnerabilities and blocked upgrades. The Yi-family projects use `tech-debt-inventory-template.md` to classify and score each debt item.
- **Debt interest quantification formula**: Daily drag (minutes) × engineers affected × workdays per year = annual interest in person-hours. Example: a flaky test that wastes 5 minutes/day for 4 engineers = 5 × 4 × 250 = 5,000 minutes (83 hours) per year. A missing index that adds 200ms to every page load for 50 DAU = negligible per-request but cumulatively 200ms × 50 × 365 = 61 hours of user waiting per year. The quantification converts abstract "this is annoying" into concrete cost that business stakeholders can evaluate against feature work. The threshold: < 10 hours/year = low interest (accept or defer), 10-100 hours/year = medium interest (quarterly repayment), > 100 hours/year = high interest (repay immediately).
- **Repayment priority matrix (4 quadrants)**: (1) High interest + high impact — repay immediately, no debate; these are the items blocking multiple teams or causing daily incidents; (2) High interest + low impact — repay quarterly; the drag is real but localized; (3) Low interest + high impact — evaluate for architecture evolution; the debt may become a bottleneck when the system scales; (4) Low interest + low impact — explicitly accept and document as "accepted debt"; do not waste guilt or capacity on these. The prioritization must be done with the full inventory visible, not one item at a time, to prevent the most recent complaint from dominating the ranking.
- **Quarterly debt repayment process (5 phases)**: (1) Inventory refresh — re-verify every debt item from the previous quarter; check if any were obsoleted by migrations or refactors (typically 15-20% of items are obsolete); (2) Interest re-quantification — re-measure daily drag; debt that was high-interest last quarter may have become low-interest due to workflow changes; (3) Prioritization — score all items against the 4-quadrant matrix; (4) Capacity negotiation — allocate 1 week per quarter minimum for repayment; frame as "this unblocks X features and prevents Y incidents"; (5) Execution and measurement — repay the top-priority items, measure before/after drag, report results to stakeholders. The Yi-family projects follow this process aligned with the quarterly roadmap review.
- **Debt prevention mechanisms (5 gates)**: (1) Architecture review gate — every significant feature must pass an architecture review that checks for abstraction quality and boundary integrity; (2) ADR requirement — any architectural trade-off that accepts short-term debt must be documented in an ADR with a repayment date; (3) Static analysis CI gate — linting, type checking, and complexity analysis block merges above configured thresholds; (4) Dependency audit gate — quarterly `pip-audit` / `npm audit` / `cargo audit` with blocking thresholds for critical vulnerabilities; (5) Documentation freshness check — automated check that README and architecture diagrams are updated within 90 days. The Yi-family projects have gates 1, 2, and 4 active; gates 3 and 5 are partially implemented.
- **Yi-family tech debt state (2026-08)**: YiAi — no lockfile (supply chain debt, high interest), no test infrastructure (test debt, medium interest), no RAG evaluation (quality debt, medium interest); YiVad — no test infrastructure (test debt, medium interest), aicr page not yet ported from YiWeb (feature gap, not debt — see BRD-2026-080); YiPet — stack migration completed (debt repaid: React 15 → 18.3, ESLint → Biome 2.5), chat.js bundle mode mismatch fixed (debt repaid). Cross-project: field name contract (`filter`/`target_file`) alignment is ongoing preventative maintenance; SSE parser shared across projects reduces duplication debt.

## Scenario

When tech debt accumulates to an unrepayable level / quarterly repayment / architecture evolution, tech owners + the architecture team need quantified inventory + interest calculation + repayment priority + quarterly process. This entry aggregates tech debt inventory template, interest quantification, repayment priority, and quarterly process to within a 2-hop path, avoiding "debt accumulating out of control / repaying by gut feel / high-interest debt dragging the team down".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `work/processes/` | [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [tech-roadmap-review-summary.md](../../engineer/process/tech-roadmap-review.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) · [shared-client-vendor-rollout.md](../../engineer/engineering/shared-client-vendor-rollout.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/engineering-patterns/` | [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) — repayment patterns |
| `lessons/wins/` | [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) · [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) — repayment success references |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) — references for debt-triggered incidents |
| `projects/` | each project's `adr-*` + `project-management-summary.md` §risk + §tech debt |
| `journeys/` | [../../engineer/infrastructure/roll-out-a-migration.md](../../engineer/infrastructure/roll-out-a-migration.md) — repayment landing + [./plan-tech-roadmap.md](./plan-tech-roadmap.md) — roadmap |

## Action recommendations

1. **Quantified inventory**: run the [tech-debt-inventory-template](../../oncall-sre/observability/tech-debt-inventory.md); for each debt record: type (architecture / code / test / documentation / dependency) + interest (daily drag on development time) + impact scope + repayment cost.
2. **Interest quantification**: high interest = daily drag > 30 min; high impact = blocks multiple teams; high repayment cost = > 1 sprint.
3. **Repayment priority**: high interest + high impact first (no debate); high interest + low impact next (quarterly); low interest + high impact evaluate (architecture evolution); low interest + low impact abandon (accept).
4. **Quarterly repayment**: follow the [quarterly-tech-debt-process](../../engineer/quality-security/quarterly-tech-debt.md); spend at least 1 week per quarter repaying high-interest debt.
5. **Thinking frameworks**: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) sets the skeleton (what is the essence of debt) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) "how to make debt accumulate faster" reverse reasoning + [second-order-thinking](../../knowledge-curator/templates/thinking--second-order-thinking.md) (second-order effects after repayment).
6. **Repayment patterns**: 1:1 mapping migration / staged port / supply chain hardening / evaluation set gate — see [engineering-patterns](../../engineer/architecture-design).
7. **Roadmap alignment**: align tech debt inventory with [tech-roadmap-review](../../engineer/process/tech-roadmap-review.md) + quarterly planning.
8. **Capacity cost alignment**: debt and capacity / cost co-built — via [capacity-and-cost](../../oncall-sre/observability/capacity-and-cost.md) FinOps.
9. **Risk reference**: scan [incident-postmortem](../../engineer/lessons/failure-incident-postmortem.md) to avoid debt-triggered incidents.

## Anti-patterns

- **Repaying debt by gut feel.** Prioritizing the loudest complaint or the most recent pain point rather than ranking by quantified interest times impact. Without a scored inventory, repayment becomes a popularity contest and high-interest debt that nobody complains about gets ignored.

- **Treating all debt as equally urgent.** Labeling everything as "must fix this quarter" dilutes focus and guarantees nothing meaningful gets done. The hard skill is saying "we explicitly accept this debt" for low-interest items and documenting the rationale.

- **Repaying debt without verifying it still exists.** Debt inventoried six months ago may have been obsoleted by a migration or refactor. Repaying phantom debt wastes capacity that could go to real blockers. Re-verify the inventory before each quarterly repayment cycle.

- **No post-repayment measurement.** After repaying a debt item, failing to measure whether the daily drag actually decreased. Without before-and-after measurement, you cannot prove the repayment was worth the cost or justify future repayment budget to stakeholders.

- **Confusing refactoring with debt repayment.** Refactoring for aesthetics -- rename, extract method, reformat -- when the debt is architectural -- wrong boundary, missing abstraction, coupled modules. Surface-level refactoring treats symptoms while the disease continues to compound.

## Related

- similar journey: [./plan-tech-roadmap.md](./plan-tech-roadmap.md) — roadmap
- similar journey: [../../engineer/infrastructure/roll-out-a-migration.md](../../engineer/infrastructure/roll-out-a-migration.md) — repayment landing
- similar journey: [../architecture/design-architecture-decision.md](../architecture/design-architecture-decision.md) — ADR decision
- upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit cadence

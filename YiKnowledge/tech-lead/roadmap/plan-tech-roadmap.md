---
title: Plan tech roadmap
aliases:
- I want to plan the tech roadmap
- tech-roadmap-journey
- capacity planning entry
tags:
- journeys
- tech-roadmap
- capacity
- FinOps
- quarterly-planning
- tech-debt
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
benefit: Tech leads can prioritize roadmap items with a structured framework, balancing business needs and technical debt
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../architecture/design-architecture-decision.md
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../../README.md
- ../../oncall-sre/observability/README.md
review_cycle: quarterly
tacit: false
---

# I want to plan tech roadmap

> **As a** tech lead, **I want to** plan tech roadmap, **so that** plan is prioritized.

> "How to plan the quarterly tech roadmap + how to inventory capacity / cost / tech debt" reach roadmap review + capacity & cost + tech debt inventory + quarterly planning process within 2 hops.

## Summary

- Roadmap review goes via [tech-roadmap-review-summary.md](../../engineer/process/tech-roadmap-review.md) + [tech-roadmap-review-template.md](../../engineer/process/tech-roadmap-review.md)
- Capacity & cost goes via [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) + [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) (FinOps)
- Tech debt inventory goes via [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) + [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md)
- Quarterly planning goes via [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) + [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md)

## Core viewpoints

**Capacity planning is the hard constraint on roadmap ambition.** A roadmap without capacity numbers is a wish list. Every roadmap item must have a capacity estimate -- people-weeks, compute, budget -- attached, and the total must fit within available capacity. Items that exceed capacity are not "stretch goals," they are unspoken commitments that will fail.

**Tech debt repayment must be a visible line item, not a side activity.** If tech debt repayment is not explicitly scheduled on the roadmap with an owner and a time allocation, it will not happen. The one-week-per-quarter rule only works when it appears as a non-negotiable line item that product stakeholders can see and understand.

**The roadmap is a negotiation document, not a commitment.** A quarterly roadmap is a hypothesis about what can be delivered given current information, not a promise. The most valuable roadmap reviews are the ones where items get removed because new information made them irrelevant, not because they "failed." Removing items is a sign of good planning, not poor execution.

**Cross-project dependencies are the number one roadmap killer.** A roadmap item that depends on another team's delivery without a shared timeline, explicit handoff criteria, and a named owner on both sides is already late. Cross-project items need a buffer that accounts for the other team's priorities and planning cycles.

**Every tech roadmap item should trace to a business outcome.** Each item should answer "what business metric does this move?" If the answer is "nothing directly," it should be framed as risk reduction -- "prevents X outage that would cost Y revenue" or "reduces Z toil that consumes W engineering hours per week."

## Key info

- **Roadmap item template**: `{ title, capacity (people-weeks), business outcome, risk if not done, dependencies, confidence (high/medium/low), phase (now/next/later) }`. Each item must have all 7 fields. An item without a capacity estimate is a wish; an item without a business outcome is a hobby; an item without a risk statement is an unarticulated liability. The `confidence` field is the most important planning signal: high-confidence items (well-understood, no unknowns) can be committed; low-confidence items (significant unknowns, new technology) need a spike or POC before commitment.
- **Capacity allocation rule of thumb**: 60% feature work (business-requested, directly moves metrics), 20% tech debt + reliability (risk reduction, toil elimination, architectural improvements), 10% learning + exploration (POCs, new technology evaluation, skill development), 10% buffer (unplanned work, urgent fixes, dependency delays). The 20% tech debt allocation is the minimum to prevent technical debt from growing faster than it's repaid. The 10% buffer is non-negotiable: a plan with 100% utilization is a plan that assumes nothing will go wrong.
- **Quarterly planning cadence**: Week 1 (capacity inventory: how many people-weeks available, what's the cost envelope), Week 2 (tech debt inventory: what's the current debt, what's the repayment plan), Week 3 (proposal: draft roadmap, review with stakeholders, negotiate trade-offs), Week 4 (commit: final roadmap, published, owners assigned). The capacity inventory in Week 1 is the most important step: without it, the roadmap is disconnected from reality. The Yi-family projects currently have no formal quarterly planning process.
- **Roadmap communication**: the roadmap should be a single-page document (or a single screen) that shows: now (committed, this quarter, high confidence), next (next quarter, medium confidence, being scoped), later (future quarters, low confidence, ideas). The now/next/later format is preferred over Gantt charts because it communicates uncertainty honestly. A Gantt chart with dates for "later" items creates false precision. The roadmap should be reviewed monthly with stakeholders; items in "now" that are at risk should be flagged by the second week of the month.
- **Cross-project dependency management**: for each dependency, create a shared document with: (1) what is needed from the other team, (2) by when, (3) what happens if it's late, (4) the named owner on the other team who has committed to the timeline, (5) the last check-in date. The document is updated weekly. If the other team's owner changes, the dependency is reassessed. The most common failure: the dependency is discussed once in a meeting and never followed up, and the delivering team's priorities shifted without notice.

## Scenario

At the end of each quarter / year, tech owners + architecture group need to plan the next quarter / next year tech roadmap = capacity estimation + cost optimization + tech debt inventory + quarterly priorities. This entry aggregates roadmap review, capacity & cost, tech debt inventory, quarterly planning process into a 2-hop path, to avoid "planning by gut feel / capacity shortage rollover / tech debt accumulating beyond repayability".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [tech-roadmap-review-summary.md](../../engineer/process/tech-roadmap-review.md) · [tech-roadmap-review-template.md](../../engineer/process/tech-roadmap-review.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) · [engineering-productivity-metrics-summary.md](../../engineer/process/engineering-productivity-metrics.md) · [org-productivity-diagnosis-summary.md](../../engineer/process/org-productivity-diagnosis.md) · [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md) |
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) |
| `projects/` | each project `project-management-summary.md` §iteration cadence + §cross-project coordination + §risk |
| `lessons/wins/` | [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) — quarterly outcome reference |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) — risk reference |
| `industry/reports/` | [ai-industry-report-summary.md](../../executive/industry/reports/ai-industry-report.md) — industry trend reference |
| `product/strategy/` | [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) — product roadmap alignment |

## Action recommendations

1. **Run roadmap review at quarter end**: scan [tech-roadmap-review-summary.md](../../engineer/process/tech-roadmap-review.md) + use [template.md](../../engineer/process/tech-roadmap-review.md) to go through 4 sections (current state / trends / priorities / risk).
2. **Capacity planning**: run [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) (CPU / GPU / memory / storage / QPS / latency / cost), optimize from a FinOps perspective.
3. **Tech debt inventory**: run [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md), quantify interest + repayment priority (high interest + high impact first).
4. **Priorities**: use [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking](../../knowledge-curator/templates/thinking/second-order-thinking.md) to rank priorities.
5. **Quarterly tech debt**: follow [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md); each quarter at least 1 week repaying high-interest debt.
6. **Cross-project coordination**: scan [shared-client-vendor-rollout](../../engineer/engineering/shared-client-vendor-rollout.md) + each project PM §cross-project coordination.
7. **Risk reference**: scan [incident-postmortem-summary](../../engineer/lessons/failure-incident-postmortem.md) + [ai-product-launch-lessons-summary](../../engineer/lessons/failure-ai-product-launch-lessons.md) to avoid repeating mistakes.
8. **Product alignment**: align with product roadmap ([now-next-later-roadmap](../../executive/strategy/now-next-later-roadmap.md)) = technology serves product strategy.

## Anti-patterns

- **Planning by gut feel without capacity data.** Assigning roadmap items based on "this feels like two weeks" without historical velocity data or capacity modeling. This produces plans that are optimistically off by two to three times and guarantees missed deadlines.

- **Filling the roadmap to 100% capacity.** Leaving no buffer for incidents, unplanned work, hiring delays, or estimation error. A realistic roadmap caps committed items at 60-70% of available capacity. The remaining 30-40% is not slack -- it is the buffer that absorbs reality.

- **The roadmap is a feature list, not a strategic document.** Listing features without articulating why each one matters, what trade-offs were made, and what was explicitly deferred. A roadmap should explain what was left out as clearly as what was included.

- **Ignoring tech debt inventory when planning.** Building the roadmap without cross-referencing the tech debt inventory. This creates a plan that assumes a clean foundation that does not exist, and the debt interest will consume the capacity allocated to new features.

- **Quarterly planning as a one-time event.** Writing the roadmap in week one and never revisiting it until the next quarter. A roadmap should be revisited at least monthly to adjust for new information, reprioritize based on emerging risks, and communicate changes to stakeholders.

## Related

- Same-class journey: [../architecture/design-architecture-decision.md](../architecture/design-architecture-decision.md) — roadmap landing stands up an ADR
- Same-class journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — capacity shortfall triggers incident
- Same-class journey: [../../engineer/process/run-iteration-meetings.md](../../engineer/process/run-iteration-meetings.md) — quarterly retrospective
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit cadence

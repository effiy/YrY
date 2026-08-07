---

title: I want to prepare a customer advocacy strategy
aliases:
- I want to prepare a customer advocacy strategy
- customer-advocacy-journey
- advocacy-journey
- advocate-program-journey
- customer advocacy entry
tags:
- journeys
- customer-advocacy
- advocate
- referral
- case-study
- testimonial
- nps-promoter
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-customer-success-plan.md
- ./prepare-a-loyalty-program-strategy.md
- ./prepare-a-referral-program-strategy.md
- ../../engineer/strategies/prepare-a-customer-success-strategy.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a customer advocacy strategy

> **As an** engineer, **I want to** prepare a customer advocacy, **so that** launch is safe.

> "advocacy + case + referral + NPS promoter + co-creation + speaking + governance + quarterly audit" reachable within 2 hops of process + thinking + case study.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing customer advocacy / advocate / case study / NPS promoter / co-creation / speaking / governance / reporting / promotion freeze / quarterly audit / retrospective, TL + CSM + marketing + sponsor need to look up process + thinking + case study. This entry aggregates customer-advocacy-related process + thinking + case study into a 2-hop path, avoiding "empty advocacy / scattered cases / missed promoter / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — advocacy intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion of empty · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [customer-success-summary.md](../../engineer/strategies/prepare-a-customer-success-strategy.md) · [customer-segmentation-summary.md](../../executive/strategy/prepare-a-market-segmentation-strategy.md) · [brand-strategy-summary.md](./prepare-a-brand-strategy.md) |
| `product/metrics/` | [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — advocacy reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — CSM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — advocacy incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — advocacy business |
| `projects/` | each project's `architecture-summary.md` §CSM + `adr-*` §advocacy |
| `journeys/` | [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) · [./prepare-a-loyalty-program-strategy.md](./prepare-a-loyalty-program-strategy.md) · [./prepare-a-referral-program-strategy.md](./prepare-a-referral-program-strategy.md) · [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) |

## Action recommendations

1. **first principles**: first ask "what advocacy solves / what happens if not done / ROI / business impact"; do not advocate for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "advocacy could go out of control (empty advocacy / scattered cases / missed promoter / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one adjustment → behaviour changes → another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest advocacy that satisfies the business wins; do not pile up rewards; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **NPS promoter**: must run NPS promoter identification + avoid gut call; follow [i-want-to-prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md).
6. **advocacy**: must run advocacy collection + avoid running naked.
7. **case study**: must run case study writing + avoid ambiguity.
8. **referral**: must run [i-want-to-prepare-a-referral-program-strategy.md](./prepare-a-referral-program-strategy.md) + avoid running naked.
9. **co-creation**: must run product co-creation / early access + avoid running naked.
10. **speaking**: must run customer speaking / conference sharing + avoid empty.
11. **loyalty**: must run [i-want-to-prepare-a-loyalty-program-strategy.md](./prepare-a-loyalty-program-strategy.md) + avoid running naked.
12. **brand**: must run [brand-strategy-summary.md](./prepare-a-brand-strategy.md) + avoid scattered.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) advocacy library + avoid multi-source.
14. **feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) gradual display.
15. **cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + avoid recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); CSM / marketing / TL / sponsor owner.
17. **freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not change advocacy.
18. **reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internal and external.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for advocacy count / promoter count alerts.
20. **retrospective**: after advocacy incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs).
21. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether advocacy is still accurate + whether cases are still reasonable.
22. **ADR**: advocacy decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **flywheel**: advocacy good → trust up → conversion up → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) — CSM
- Same-class journey: [./prepare-a-loyalty-program-strategy.md](./prepare-a-loyalty-program-strategy.md) — loyalty
- Same-class journey: [./prepare-a-referral-program-strategy.md](./prepare-a-referral-program-strategy.md) — referral
- Same-class journey: [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) — QBR
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

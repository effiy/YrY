---

title: I want to prepare a lead scoring strategy
aliases:
- I want to prepare a lead scoring strategy
- lead-scoring-journey
- lead-qualification-journey
- mql-sql-journey
- lead scoring entry
tags:
- journeys
- lead-scoring
- lead-qualification
- mql
- sql
- fit
- intent
- routing
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-a-lead-generation-strategy.md
- ./prepare-a-marketing-operations-strategy.md
- ./prepare-a-revenue-ops-strategy.md
- ./prepare-an-ideal-customer-profile-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a lead scoring strategy

> **As an** engineer, **I want to** prepare a lead scoring, **so that** launch is safe.

> "Fit + intent + threshold + MQL/SQL + routing + Governance + Quarterly audit" reaches Process + Thinking + Case study within 2 hops.

## Summary

- Process goes through [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking goes through [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform goes through [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies go through [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

Prepare lead scoring / fit / intent / threshold / MQL/SQL / routing / Governance / Communication / big-promo freeze / Quarterly audit / Retrospective, when TL + MOPS + marketing + sales + RevOps + sponsor need to look up Process + Thinking + Case study. This entry aggregates lead-scoring-related Process + Thinking + Case study into 2-hop paths, avoiding "scoring scattered / fit hollow / intent missing / routing chaos / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — scoring intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [growth-strategy-summary.md](./prepare-a-growth-strategy.md) · [go-to-market-summary.md](../../product-manager/frameworks/prepare-a-go-to-market.md) · [customer-segmentation-summary.md](../../executive/strategy/prepare-a-market-segmentation-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — scoring Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — MOPS matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — scoring incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — scoring business |
| `projects/` | Each project `architecture-summary.md` § MOPS + `adr-*` § scoring |
| `journeys/` | [./prepare-a-lead-generation-strategy.md](./prepare-a-lead-generation-strategy.md) · [./prepare-a-marketing-operations-strategy.md](./prepare-a-marketing-operations-strategy.md) · [./prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) · [./prepare-an-ideal-customer-profile-strategy.md](./prepare-an-ideal-customer-profile-strategy.md) · [./prepare-a-sales-playbook-strategy.md](./prepare-a-sales-playbook-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what lead scoring to solve / what if not done / ROI / business impact"; do not score for scoring's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how scoring can fail (scoring scattered / fit hollow / intent missing / routing chaos / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one adjustment -> behavior changes -> another adjustment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest scoring that satisfies business wins; do not pile on dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Fit**: must do explicit fit scoring + no gut call; follow [i-want-to-prepare-an-ideal-customer-profile-strategy.md](./prepare-an-ideal-customer-profile-strategy.md).
6. **Intent**: must do implicit intent scoring + no scattering.
7. **Threshold**: must do MQL / SQL threshold + no gut call.
8. **Routing**: must do lead routing + no leakage; follow [i-want-to-prepare-a-marketing-operations-strategy.md](./prepare-a-marketing-operations-strategy.md).
9. **Lead generation**: must do [i-want-to-prepare-a-lead-generation-strategy.md](./prepare-a-lead-generation-strategy.md) + no naked run.
10. **RevOps**: must do [i-want-to-prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) + no naked run.
11. **Sales handbook**: must do [i-want-to-prepare-a-sales-playbook-strategy.md](./prepare-a-sales-playbook-strategy.md) + no naked run.
12. **Personalization**: must do [i-want-to-prepare-a-personalization-strategy.md](./prepare-a-personalization-strategy.md) + no one-size-fits-all.
13. **SSOT**: must do [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) scoring library + no multi-source.
14. **Contract test**: must do [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
15. **Cache**: must do [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
16. **RACI**: must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); MOPS / marketing / sales / RevOps owner.
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not move scoring.
18. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) internally and externally.
19. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) MQL/SQL conversion / scoring drift alerts.
20. **Retrospective**: after a scoring incident, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) Retrospective + Archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether dimensions are still accurate / whether thresholds are still reasonable.
22. **ADR**: scoring decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: scoring done well → routing accurate → conversion rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-lead-generation-strategy.md](./prepare-a-lead-generation-strategy.md) — lead generation
- Related journey: [./prepare-a-marketing-operations-strategy.md](./prepare-a-marketing-operations-strategy.md) — MOPS
- Related journey: [./prepare-a-revenue-ops-strategy.md](./prepare-a-revenue-ops-strategy.md) — RevOps
- Related journey: [./prepare-an-ideal-customer-profile-strategy.md](./prepare-an-ideal-customer-profile-strategy.md) — ICP
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

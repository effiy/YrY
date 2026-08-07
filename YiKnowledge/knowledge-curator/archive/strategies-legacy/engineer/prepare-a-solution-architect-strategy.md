---

title: I want to prepare a solution architect strategy
aliases:
- i-want-to-prepare-a-solution-architect-strategy
- solution-architect-journey
- sa-journey
- solution-architect-entry
tags:
- journeys
- solution-architect
- sa
- pre-sales
- sre
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
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
- prepare-a-pre-sales-strategy.md
- ./prepare-a-sales-engineering-strategy.md
- ./prepare-a-sdr-strategy.md
- ./prepare-a-professional-services-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a solution architect strategy

> **As an** engineer, **I want to** prepare a solution architect, **so that** launch is safe. 

> "Solution architect + pre-sales + review + governance + quarterly audit" reachable within 2 hops across process + thinking + case studies.

## Summary

- Process: see [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: see [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies: see [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing solution architect / pre-sales / review / governance / big-promo freeze / quarterly audit / retrospective, TL + sales + pre-sales + product + sponsor need to look up process + thinking + case studies. This entry aggregates solution-architect-related process + thinking + case studies into 2-hop paths, avoiding "scattered solutions / missed reviews / lost-deal risk / chaotic closed loop / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of the architect · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion on scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | solution-architect · sa · pre-sales · solution-design |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | sa-runtime · solution-store · review-engine · audit-log |
| `tech/ai-foundations/` | sa-patterns · solution-suite · review-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — SA notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — SA failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — SA business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §SA |
| `journeys/` | [./i-want-to-prepare-a-pre-sales-strategy.md](./prepare-a-pre-sales-strategy.md) · [./prepare-a-sales-engineering-strategy.md](./prepare-a-sales-engineering-strategy.md) · [./prepare-a-sdr-strategy.md](./prepare-a-sdr-strategy.md) · [./prepare-a-professional-services-strategy.md](./prepare-a-professional-services-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does a solution architect solve / what happens if not done / ROI / business impact"; do not architect for the sake of architecting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "how SA could go out of control (scattered solutions / missed reviews / lost-deal risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one architecture → behavior changes → another architecture; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest solution that meets business needs wins; do not pile up solutions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Solution**: must run solution / template / review + no dispersion. 
6. **Review**: must run review / risk / fallback + no omissions. 
7. **Observable**: must run observable / traceable / audit + no omissions. 
8. **Closed loop**: must run closed loop / retrospective / archive + no omissions. 
9. **Pre-sales**: must run [i-want-to-prepare-a-pre-sales-strategy.md](./prepare-a-pre-sales-strategy.md) + no bare run. 
10. **Sales engineering**: must run [i-want-to-prepare-a-sales-engineering-strategy.md](./prepare-a-sales-engineering-strategy.md) + no bare run. 
11. **SDR**: must run [i-want-to-prepare-a-sdr-strategy.md](./prepare-a-sdr-strategy.md) + no bare run. 
12. **Professional services**: must run [i-want-to-prepare-a-professional-services-strategy.md](./prepare-a-professional-services-strategy.md) + no bare run. 
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no bare run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) solution library + no multi-source. 
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no bare run. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / pre-sales / sales / TL owner. 
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move solution templates. 
18. **Notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal and external notification. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) SA exception alerts. 
20. **Retrospective**: after SA failures must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md); scan whether solutions are still accurate / whether reviews are still reasonable. 
22. **ADR**: SA decisions must land as ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: SA works well → win rate rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-class journey: [./i-want-to-prepare-a-pre-sales-strategy.md](./prepare-a-pre-sales-strategy.md) — pre-sales
- Same-class journey: [./prepare-a-sales-engineering-strategy.md](./prepare-a-sales-engineering-strategy.md) — sales engineering
- Same-class journey: [./prepare-a-sdr-strategy.md](./prepare-a-sdr-strategy.md) — SDR
- Same-class journey: [./prepare-a-professional-services-strategy.md](./prepare-a-professional-services-strategy.md) — professional services
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

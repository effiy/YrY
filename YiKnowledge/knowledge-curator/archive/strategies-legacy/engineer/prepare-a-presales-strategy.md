---

title: I want to prepare a presales strategy
aliases:
- I want to prepare a presales strategy
- presales-journey
- pre-sales-journey
- presales entry
tags:
- journeys
- presales
- pre-sales
- solutioning
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
- ./prepare-a-solution-architect-strategy.md
- ./prepare-a-proposal-management-strategy.md
- ./prepare-a-value-based-selling-strategy.md
- ./prepare-a-sales-process-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a presales strategy

> **As an** engineer, **I want to** prepare a presales, **so that** launch is safe. 

> "Presales + solution + POC + governance + quarterly audit" reach process + thinking + case study within 2 hops. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing presales / solution / POC / governance / promotion freeze / quarterly audit / retrospective, TL + presales + sales + product + sponsor need to look up process + thinking + case study. This entry aggregates presales-related process + thinking + case study into a 2-hop path, avoiding "solution scattered / POC missing / lost-deal risk / closure messy / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — presales intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion bias · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | presales · pre-sales · solutioning · poc |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | presales-runtime · solution-store · poc-engine · audit-log |
| `tech/ai-foundations/` | presales-patterns · solution-suite · poc-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — presales reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — presales incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — presales business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §presales |
| `journeys/` | [./prepare-a-solution-architect-strategy.md](./prepare-a-solution-architect-strategy.md) · [./prepare-a-proposal-management-strategy.md](./prepare-a-proposal-management-strategy.md) · [./prepare-a-value-based-selling-strategy.md](./prepare-a-value-based-selling-strategy.md) · [./prepare-a-sales-process-strategy.md](./prepare-a-sales-process-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does presales solve / what happens if not done / ROI / business impact"; do not sell for selling's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first think "presales could go out of control (solution scattered / POC missing / lost-deal risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one presales pass -> behavior change -> another pass; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest presales that satisfies business wins; do not pile up phases; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Solution**: must run solution / template / review + avoid scattered. 
6. **POC**: must run POC / scope / acceptance + avoid missing. 
7. **Observability**: must run observability / traceability / audit + avoid missing. 
8. **Closure**: must run closure / retrospective / archive + avoid missing. 
9. **SA**: must run [i-want-to-prepare-a-solution-architect-strategy.md](./prepare-a-solution-architect-strategy.md) + avoid naked run. 
10. **Proposal**: must run [i-want-to-prepare-a-proposal-management-strategy.md](./prepare-a-proposal-management-strategy.md) + avoid naked run. 
11. **Value-based selling**: must run [i-want-to-prepare-a-value-based-selling-strategy.md](./prepare-a-value-based-selling-strategy.md) + avoid naked run. 
12. **Sales process**: must run [i-want-to-prepare-a-sales-process-strategy.md](./prepare-a-sales-process-strategy.md) + avoid naked run. 
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + avoid naked run. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) solution store + avoid multi-source. 
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + avoid naked run. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / presales / sales / product owners. 
17. **Freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change solution templates. 
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal and external reporting. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for presales exception alerts. 
20. **Retrospective**: after presales incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: see [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether solution templates still accurate / POC still reasonable. 
22. **ADR**: presales decisions must be recorded in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: presales well -> win rate up -> trust up -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- same category journey: [./prepare-a-solution-architect-strategy.md](./prepare-a-solution-architect-strategy.md) — SA
- same category journey: [./prepare-a-proposal-management-strategy.md](./prepare-a-proposal-management-strategy.md) — proposal
- same category journey: [./prepare-a-value-based-selling-strategy.md](./prepare-a-value-based-selling-strategy.md) — value-based selling
- same category journey: [./prepare-a-sales-process-strategy.md](./prepare-a-sales-process-strategy.md) — sales process
- upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

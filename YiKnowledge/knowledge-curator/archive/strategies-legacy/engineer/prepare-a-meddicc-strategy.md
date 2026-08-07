---

title: I want to prepare a MEDDICC strategy
aliases:
- I want to prepare a MEDDICC strategy
- meddicc-journey
- meddpicc-journey
- MEDDICC entry
tags:
- journeys
- meddicc
- meddpicc
- qualification
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
- ./prepare-a-sales-process-strategy.md
- ./prepare-a-deal-review-strategy.md
- ./prepare-a-lead-scoring-strategy.md
- ./prepare-a-sales-pipeline-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a MEDDICC strategy

> **As an** engineer, **I want to** prepare a meddicc, **so that** launch is safe. 

> "MEDDICC + qualification + win criteria + governance + quarterly audit" reaches process + thinking + case study within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing MEDDICC / qualification / win criteria / governance / promotion freeze / quarterly audit / retrospective, TL + sales + pre-sales + sponsor need to look up process + thinking + case study. This entry aggregates MEDDICC-related process + thinking + case study into 2-hop paths, avoiding "scattered qualification / missing win criteria / misjudgment risk / messy closed loops / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of MEDDICC · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | meddicc · meddpicc · qualification · win-criteria |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | meddicc-runtime · qual-store · score-engine · audit-log |
| `tech/ai-foundations/` | meddicc-patterns · qual-suite · score-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — MEDDICC reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — MEDDICC failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — MEDDICC business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §MEDDICC |
| `journeys/` | [./prepare-a-sales-process-strategy.md](./prepare-a-sales-process-strategy.md) · [./prepare-a-deal-review-strategy.md](./prepare-a-deal-review-strategy.md) · [./prepare-a-lead-scoring-strategy.md](./prepare-a-lead-scoring-strategy.md) · [./prepare-a-sales-pipeline-strategy.md](./prepare-a-sales-pipeline-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does MEDDICC solve / what happens if not done / ROI / business impact"; don't score for the sake of scoring; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First think "how could MEDDICC go out of control (scattered qualification / missing win criteria / misjudgment risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: One scoring pass → behavior changes → another scoring pass; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest MEDDICC that satisfies the business wins; don't pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Qualification**: Must run qualification / M / E / D + no scatter. 
6. **Win criteria**: Must run win criteria / decision / red lines + no omissions. 
7. **Observability**: Must run observability / traceability / audit + no omissions. 
8. **Closed loop**: Must run closed loop / retrospective / archive + no omissions. 
9. **Sales process**: Must follow [i-want-to-prepare-a-sales-process-strategy.md](./prepare-a-sales-process-strategy.md) + no naked run. 
10. **Deal review**: Must follow [i-want-to-prepare-a-deal-review-strategy.md](./prepare-a-deal-review-strategy.md) + no naked run. 
11. **Lead scoring**: Must follow [i-want-to-prepare-a-lead-scoring-strategy.md](./prepare-a-lead-scoring-strategy.md) + no naked run. 
12. **Sales pipeline**: Must follow [i-want-to-prepare-a-sales-pipeline-strategy.md](./prepare-a-sales-pipeline-strategy.md) + no naked run. 
13. **Security**: Must follow [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run. 
14. **SSOT**: Must follow [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for the qualification library + no multi-source. 
15. **Contract test**: Must follow [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
16. **RACI**: Must follow [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / sales / pre-sales owner. 
17. **Freeze period**: During promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — don't change qualification dimensions. 
18. **Reporting**: Must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report inside and outside. 
19. **Monitoring**: Must follow [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for MEDDICC exception alerts. 
20. **Retrospective**: After MEDDICC failures must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether qualification dimensions are still accurate / win criteria still reasonable. 
22. **ADR**: MEDDICC decisions must be captured in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: Accurate MEDDICC → higher win rate → higher trust → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-category journey: [./prepare-a-sales-process-strategy.md](./prepare-a-sales-process-strategy.md) — sales process
- Same-category journey: [./prepare-a-deal-review-strategy.md](./prepare-a-deal-review-strategy.md) — deal review
- Same-category journey: [./prepare-a-lead-scoring-strategy.md](./prepare-a-lead-scoring-strategy.md) — lead scoring
- Same-category journey: [./prepare-a-sales-pipeline-strategy.md](./prepare-a-sales-pipeline-strategy.md) — sales pipeline
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

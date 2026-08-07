---

title: I want to prepare a flexible spending account strategy
aliases:
- I want to prepare a flexible spending account strategy
- flexible-spending-account-journey
- fsa-journey
- flexible spending account entry
tags:
- journeys
- flexible-spending-account
- fsa
- benefits
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
- ./prepare-a-benefits-strategy.md
- ./prepare-a-healthcare-benefits-strategy.md
- ./prepare-a-401k-strategy.md
- ./prepare-a-total-rewards-strategy.md
- ./prepare-a-security-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a flexible spending account strategy

> **As an** engineer, **I want to** prepare a flexible spending account, **so that** launch is safe. 

> "FSA + filing + reimbursement + governance + quarterly audit" process + thinking + cases reachable within 2 hops. 

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing for FSA / filing / reimbursement / governance / big-promo freeze / quarterly audit / retrospective, TL + HR + finance + business + sponsor need to look up process + thinking + cases. This entry aggregates FSA-related process + thinking + cases into 2-hop paths to avoid "scattered filing / missed reimbursement / forfeiture risk / chaotic closed loop / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — FSA essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking on scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chains · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | flexible-spending-account · fsa · pre-tax · reimbursement |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | fsa-runtime · claim-store · reimburse-engine · audit-log |
| `tech/ai-foundations/` | fsa-patterns · claim-suite · reimburse-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — FSA notifications |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — FSA incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — FSA business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §FSA |
| `journeys/` | [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) · [./prepare-a-healthcare-benefits-strategy.md](./prepare-a-healthcare-benefits-strategy.md) · [./prepare-a-401k-strategy.md](./prepare-a-401k-strategy.md) · [./prepare-a-total-rewards-strategy.md](./prepare-a-total-rewards-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what FSA solves / what happens if not done / ROI / business impact"; don't set it up for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "FSA could go out of control (scattered filing / missed reimbursement / forfeiture risk / trust collapse) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one filing → behavior change → another filing; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest FSA that meets business needs wins; don't pile up process; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Filing**: must run filing / quota / election + guard against scattering. 
6. **Reimbursement**: must run reimbursement / verification / audit trail + guard against misses. 
7. **Observable**: must run observable / traceability / audit + guard against misses. 
8. **Closed loop**: must run closed loop / retrospective / archive + guard against misses. 
9. **Benefits**: must run [i-want-to-prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) + guard against running naked. 
10. **Healthcare**: must run [i-want-to-prepare-a-healthcare-benefits-strategy.md](./prepare-a-healthcare-benefits-strategy.md) + guard against running naked. 
11. **401k**: must run [i-want-to-prepare-a-401k-strategy.md](./prepare-a-401k-strategy.md) + guard against running naked. 
12. **Total rewards**: must run [i-want-to-prepare-a-total-rewards-strategy.md](./prepare-a-total-rewards-strategy.md) + guard against running naked. 
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + guard against running naked. 
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) for the FSA library + guard against multiple sources. 
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + guard against running naked. 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / finance / business owners. 
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — don't touch filing windows. 
18. **Notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify internal and external. 
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for FSA exception alerts. 
20. **Retrospective**: after an FSA incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: via [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether filing is still accurate / reimbursement still reasonable. 
22. **ADR**: FSA decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: good FSA → participation up → trust up → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-class journey: [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) — benefits
- Same-class journey: [./prepare-a-healthcare-benefits-strategy.md](./prepare-a-healthcare-benefits-strategy.md) — healthcare benefits
- Same-class journey: [./prepare-a-401k-strategy.md](./prepare-a-401k-strategy.md) — 401k
- Same-class journey: [./prepare-a-total-rewards-strategy.md](./prepare-a-total-rewards-strategy.md) — total rewards
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

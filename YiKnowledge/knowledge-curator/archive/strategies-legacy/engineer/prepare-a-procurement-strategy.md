---

title: I want to prepare a procurement strategy
aliases:
- procurement-journey
- sourcing-journey
- purchasing-journey
- procurement-entry
tags:
- journeys
- procurement
- sourcing
- purchasing
- vendor-selection
- contract-negotiation
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
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-vendor-risk-management-strategy.md
- ./prepare-an-rfp.md
- ./prepare-a-contract-management-strategy.md
- ./prepare-a-buy-vs-build-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a procurement strategy

> **As an** engineer, **I want to** prepare a procurement, **so that** launch is safe.

> "Sourcing + evaluation + negotiation + contract + governance + quarterly audit" — reach process + thinking + case studies within 2 hops.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies follow [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing for procurement / sourcing / evaluation / negotiation / contract / governance / reporting / big-event freeze / quarterly audit / retrospective, TL + procurement + legal + finance + sponsor need to find process + thinking + case studies. This entry aggregates procurement-related process + thinking + case studies into 2-hop paths, avoiding "sourcing scattered / evaluation superficial / negotiation missed / contract chaos / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — procurement intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking on dispersion · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effect · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [business-model-summary.md](../../executive/strategy/business-model-canvas.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) · [security-strategy-summary.md](../../engineer/strategies/prepare-a-cybersecurity-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — procurement reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — procurement matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — procurement incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — procurement business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §procurement |
| `journeys/` | [./prepare-a-vendor-risk-management-strategy.md](./prepare-a-vendor-risk-management-strategy.md) · [./prepare-an-rfp.md](./prepare-an-rfp.md) · [./prepare-a-contract-management-strategy.md](./prepare-a-contract-management-strategy.md) · [./prepare-a-buy-vs-build-strategy.md](./prepare-a-buy-vs-build-strategy.md) · [./prepare-a-budget.md](./prepare-a-budget.md) |

## Action recommendations

1. **First principles**: First ask "what does procurement solve / what happens if not done / ROI / business impact"; do not procure for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "how procurement could go out of control (sourcing scattered / evaluation superficial / negotiation missed / contract chaos / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One procurement → behavior change → another procurement; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest procurement that satisfies business wins; do not pile up process; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Sourcing**: must run sourcing / RFQ + prevent dispersion; follow [i-want-to-prepare-an-rfp.md](./prepare-an-rfp.md).
6. **Evaluation**: must run vendor evaluation + prevent gut call; follow [i-want-to-prepare-a-vendor-risk-management-strategy.md](./prepare-a-vendor-risk-management-strategy.md).
7. **Negotiation**: must run negotiation / business terms + prevent misses.
8. **Contract**: must run [i-want-to-prepare-a-contract-management-strategy.md](./prepare-a-contract-management-strategy.md) + no bare run.
9. **Buy or build**: must run [i-want-to-prepare-a-buy-vs-build-strategy.md](./prepare-a-buy-vs-build-strategy.md) + no bare run.
10. **Budget**: must run [i-want-to-prepare-a-budget.md](./prepare-a-budget.md) + prevent overspend.
11. **Security questionnaire**: must run [i-want-to-prepare-a-security-questionnaire-strategy.md](./prepare-a-security-questionnaire-strategy.md) + prevent misses.
12. **Compliance**: must run [i-want-to-prepare-a-compliance-strategy.md](./prepare-a-compliance-strategy.md) + prevent misses.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) procurement library + prevent multi-source.
14. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no bare run.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + prevent recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); procurement / legal / finance / TL owners.
17. **Freeze period**: Big events follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change procurement.
18. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for procurement duration / savings / risk alerts.
20. **Retrospective**: After procurement incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether vendor is still accurate / contract is still reasonable.
22. **ADR**: Procurement decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: Good procurement → cost down → risk down → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [./prepare-a-vendor-risk-management-strategy.md](./prepare-a-vendor-risk-management-strategy.md) — vendor risk
- similar journey: [./prepare-an-rfp.md](./prepare-an-rfp.md) — RFP
- similar journey: [./prepare-a-contract-management-strategy.md](./prepare-a-contract-management-strategy.md) — Contract
- similar journey: [./prepare-a-buy-vs-build-strategy.md](./prepare-a-buy-vs-build-strategy.md) — Buy or build
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry

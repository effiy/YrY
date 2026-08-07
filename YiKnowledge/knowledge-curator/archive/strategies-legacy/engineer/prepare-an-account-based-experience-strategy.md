---

title: I want to prepare an account-based experience strategy
aliases:
- i-want-to-prepare-an-account-based-experience-strategy
- abx-journey
- account-based-experience-journey
- coordinated-engagement-journey
- ABX entry
tags:
- journeys
- abx
- account-based-experience
- coordinated-engagement
- post-sale
- account-journey
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
- ./prepare-an-account-based-marketing-strategy.md
- ./prepare-a-key-account-strategy.md
- ./prepare-a-customer-success-plan.md
- ./prepare-a-partner-success-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an account-based experience strategy

> **As an** engineer, **I want to** prepare an account based experience, **so that** launch is safe.

> "Coordinated reach + cross-functional linkage + post-sale continuity + data + personalization + governance + quarterly audit" reachable within 2 hops to process + thinking + cases.

## Summary

- Process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Cases via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing ABX / account experience / coordinated reach / sales-marketing-CSM linkage / post-sale continuity / governance / reporting / big-promo freeze / quarterly audit / retrospective, TL + ABM + sales + CSM + sponsor need to look up process + thinking + cases. This entry aggregates ABX-related process + thinking + cases into a 2-hop path, avoiding "reach dispersion / hollow linkage / post-sale break / data chaos / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — ABX intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert for dispersion · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [opportunity-solution-tree-summary.md](../../engineer/strategies/prepare-an-opportunity-solution-tree-strategy.md) |
| `product/strategy/` | [customer-success-summary.md](../../engineer/strategies/prepare-a-customer-success-strategy.md) · [customer-journey-summary.md](./../../product-manager/discovery/ux/README.md) · [retention-summary.md](./prepare-a-retention-strategy.md) |
| `product/metrics/` | [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — ABX reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — ABX matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — ABX incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — ABX business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §ABX |
| `journeys/` | [./prepare-an-account-based-marketing-strategy.md](./prepare-an-account-based-marketing-strategy.md) · [./prepare-a-key-account-strategy.md](./prepare-a-key-account-strategy.md) · [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) · [./prepare-a-partner-success-strategy.md](./prepare-a-partner-success-strategy.md) · [./prepare-a-personalization-strategy.md](./prepare-a-personalization-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does ABX solve / what happens if not done / ROI / business impact"; do not coordinate for the sake of coordinating; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "ABX could go out of control (reach dispersion / hollow linkage / post-sale break / data chaos / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one coordination → behavior changes → another coordination; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest ABX that meets business needs wins; do not pile up roles; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Coordinated reach**: must run cross-functional linkage (sales / marketing / CSM) + no dispersion.
6. **Post-sale continuity**: must run post-sale experience continuity + no break; via [i-want-to-prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md).
7. **ABM**: must run [i-want-to-prepare-an-account-based-marketing-strategy.md](./prepare-an-account-based-marketing-strategy.md) + no bare run.
8. **Key account**: must run [i-want-to-prepare-a-key-account-strategy.md](./prepare-a-key-account-strategy.md) + no bare run.
9. **Personalization**: must run [i-want-to-prepare-a-personalization-strategy.md](./prepare-a-personalization-strategy.md) + no one-size-fits-all.
10. **Data**: must run data governance (CRM / CDP) + no multi-source; via [data-governance-summary.md](../../ai-engineer/data/data-governance.md).
11. **JTBD**: must run [i-want-to-prepare-a-jobs-to-be-done-strategy.md](../../product-manager/frameworks/prepare-a-jobs-to-be-done-strategy.md) + no bare run.
12. **Partner**: must run [i-want-to-prepare-a-partner-success-strategy.md](./prepare-a-partner-success-strategy.md) + no bare run.
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) account view + no multi-source.
14. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no bare run.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); ABM / sales / CSM / TL owner.
17. **Freeze period**: big-promo via [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not change ABX cadence.
18. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) account health / reach / linkage alerts.
20. **Retrospective**: after ABX incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: via [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether account list is still accurate / reach still reasonable.
22. **ADR**: ABX decision must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good ABX → better experience → higher retention → more expansion; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [./prepare-an-account-based-marketing-strategy.md](./prepare-an-account-based-marketing-strategy.md) — ABM
- similar journey: [./prepare-a-key-account-strategy.md](./prepare-a-key-account-strategy.md) — KAM
- similar journey: [./prepare-a-customer-success-plan.md](./prepare-a-customer-success-plan.md) — CSM
- similar journey: [./prepare-a-partner-success-strategy.md](./prepare-a-partner-success-strategy.md) — partner
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) - strategy leaf entry

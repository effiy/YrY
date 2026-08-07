---

title: I want to prepare a critical illness insurance strategy
aliases:
- I want to prepare critical illness insurance strategy
- critical-illness-journey
- critical-illness-insurance-journey
- critical illness insurance entry
tags:
- journeys
- critical-illness
- critical-illness-insurance
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
- ./prepare-a-life-insurance-strategy.md
- ./prepare-a-disability-insurance-strategy.md
- ./prepare-a-security-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a critical illness insurance strategy

> **As an** engineer, **I want to** prepare a critical illness insurance, **so that** launch is safe.

> "Critical illness + underwriting + claims + governance + quarterly audit" reach process + thinking + case within 2 hops.

## Summary

- process via [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- platform via [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- case via [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing critical illness / underwriting / claims / governance / big promo freeze / quarterly audit / retrospective, TL + HR + Finance + Business + sponsor need to look up process + thinking + case. This entry aggregates critical illness related process + thinking + case into 2-hop paths, avoiding "underwriting scattered / claims missed / lapsed insurance / closed loop chaotic / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — critical illness essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking for scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | critical-illness · critical-illness-insurance · illness · coverage |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | illness-runtime · policy-store · claim-engine · audit-log |
| `tech/ai-foundations/` | illness-patterns · policy-suite · claim-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — critical illness communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — critical illness failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — critical illness business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §critical illness |
| `journeys/` | [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) · [./prepare-a-healthcare-benefits-strategy.md](./prepare-a-healthcare-benefits-strategy.md) · [./prepare-a-life-insurance-strategy.md](./prepare-a-life-insurance-strategy.md) · [./prepare-a-disability-insurance-strategy.md](./prepare-a-disability-insurance-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does critical illness insurance solve / what happens if not done / ROI / business impact"; do not enroll just to enroll; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "critical illness could go out of control (underwriting scattered / claims missed / lapsed insurance / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one enrollment → behavior change → another enrollment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest critical illness that meets business needs wins; do not pile up insurance types; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Underwriting**: must run underwriting / insurance type / selection + avoid scatter.
6. **Claims**: must run claims / verification / trace + avoid missing.
7. **observable**: must run observable / trace / audit + avoid missing.
8. **Closed loop**: must run closed loop / retrospective / archive + avoid missing.
9. **Benefits**: must run [i-want-to-prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) + avoid running blind.
10. **Healthcare**: must run [i-want-to-prepare-a-healthcare-benefits-strategy.md](./prepare-a-healthcare-benefits-strategy.md) + avoid running blind.
11. **Life insurance**: must run [i-want-to-prepare-a-life-insurance-strategy.md](./prepare-a-life-insurance-strategy.md) + avoid running blind.
12. **Disability insurance**: must run [i-want-to-prepare-a-disability-insurance-strategy.md](./prepare-a-disability-insurance-strategy.md) + avoid running blind.
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + avoid running blind.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) critical illness library + avoid multi-source.
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + avoid running blind.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / finance / business owner.
17. **Freeze period**: Big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) don't move underwriting window.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for critical illness exception alerts.
20. **retrospective**: After critical illness failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether underwriting is still accurate / whether claims still reasonable.
22. **ADR**: critical illness decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: critical illness good → participation rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./prepare-a-benefits-strategy.md](./prepare-a-benefits-strategy.md) — benefits
- Same-category journey: [./prepare-a-healthcare-benefits-strategy.md](./prepare-a-healthcare-benefits-strategy.md) — healthcare benefits
- Same-category journey: [./prepare-a-life-insurance-strategy.md](./prepare-a-life-insurance-strategy.md) — life insurance
- Same-category journey: [./prepare-a-disability-insurance-strategy.md](./prepare-a-disability-insurance-strategy.md) — disability insurance
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

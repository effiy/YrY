---

title: I want to prepare a service template strategy
aliases:
- I want to prepare a service template strategy
- service-template-journey
- scaffolding-journey
- Service template entry
tags:
- journeys
- service-template
- scaffolding
- starter
- platform-engineering
- boilerplate
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
- ./prepare-a-golden-path-strategy.md
- ./prepare-a-platform-engineering-strategy.md
- ./prepare-an-infrastructure-as-code-strategy.md
- ./bootstrap-a-new-project.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a service template strategy

> **As an** engineer, **I want to** prepare a service template, **so that** launch is safe.

> "Template + scaffolding + defaults + governance + quarterly audit" — 2-hop reachability for process + thinking + cases.

## Summary

- Process path: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking path: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform path: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case path: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing service templates / scaffolding / starters / defaults / governance / promo freeze / quarterly audit / retrospective, TL + platform + algorithm + data + sponsor need to consult process + thinking + cases. This entry aggregates template-related process + thinking + cases onto a 2-hop path, avoiding "scattered templates / missed scaffolding / drift / broken closed loop / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — template essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — think backwards · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | service-template · scaffolding · starter · boilerplate |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | template-runtime · scaffold-store · default-engine · audit-log |
| `tech/ai-foundations/` | template-patterns · scaffold-suite · starter-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — template reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — template crash archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — template business |
| `projects/` | Each project's `architecture-summary.md` §PM + `adr-*` §template |
| `journeys/` | [./prepare-a-golden-path-strategy.md](./prepare-a-golden-path-strategy.md) · [./prepare-a-platform-engineering-strategy.md](./prepare-a-platform-engineering-strategy.md) · [./prepare-an-infrastructure-as-code-strategy.md](./prepare-an-infrastructure-as-code-strategy.md) · [./bootstrap-a-new-project.md](./bootstrap-a-new-project.md) · [./prepare-a-developer-portal-strategy.md](./prepare-a-developer-portal-strategy.md) |

## Action recommendations

1. **First principles**: first ask "template — what to solve / what happens if not done / ROI / business impact"; do not template for the sake of templating; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "templates could go out of control (scattered templates / missed scaffolding / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one template → behavior change → another template; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest template that meets business needs wins; do not pile up options; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Template**: must run template / version / compatibility + must not miss.
6. **Scaffolding**: must run scaffolding / generation / embedding + must not miss.
7. **Defaults**: must run defaults / safety / governance + must not miss.
8. **Guardrails**: must run guardrails / strategy / evaluation + must not miss.
9. **Golden path**: must run [i-want-to-prepare-a-golden-path-strategy.md](./prepare-a-golden-path-strategy.md) + must not run naked.
10. **Platform engineering**: must run [i-want-to-prepare-a-platform-engineering-strategy.md](./prepare-a-platform-engineering-strategy.md) + must not run naked.
11. **IaC**: must run [i-want-to-prepare-an-infrastructure-as-code-strategy.md](./prepare-an-infrastructure-as-code-strategy.md) + must not run naked.
12. **New project bootstrap**: must run [i-want-to-bootstrap-a-new-project.md](./bootstrap-a-new-project.md) + must not run naked.
13. **Developer portal**: must run [i-want-to-prepare-a-developer-portal-strategy.md](./prepare-a-developer-portal-strategy.md) + must not run naked.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) template library + must not multi-source.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + must not run naked.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / algorithm / data / TL owner.
17. **Freeze period**: during promos, follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change templates.
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) to alert on template drift.
20. **Retrospective**: after a template crash, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether templates are still accurate / whether scaffolding is still reasonable.
22. **ADR**: template decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good templates → speed rises → trust rises → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-golden-path-strategy.md](./prepare-a-golden-path-strategy.md) — golden path
- Same-class journey: [./prepare-a-platform-engineering-strategy.md](./prepare-a-platform-engineering-strategy.md) — platform engineering
- Same-class journey: [./prepare-an-infrastructure-as-code-strategy.md](./prepare-an-infrastructure-as-code-strategy.md) — IaC
- Same-class journey: [./bootstrap-a-new-project.md](./bootstrap-a-new-project.md) — new project bootstrap
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

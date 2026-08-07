---

title: I want to prepare a feature retirement strategy
aliases:
- I want to prepare a feature retirement strategy
- feature-retirement-journey
- sunset-journey
- deprecation-journey
- feature retirement entry
tags:
- journeys
- feature-retirement
- sunset
- deprecation
- end-of-life
- migration
- eol
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
- ../../product-manager/frameworks/prepare-a-product-launch-strategy.md
- ./prepare-a-customer-communications-strategy.md
- prepare-a-migration-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a feature retirement strategy

> **As an** engineer, **I want to** prepare a feature retirement, **so that** launch is safe. 

> "Retirement / deprecation / migration + notification + governance + quarterly audit" — reach Process + Thinking + Case study within 2 hops. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing feature retirement / deprecation / migration / notification / governance / big-promo freeze / quarterly audit / retrospective, TL + PM + PMM + sales + CSM + sponsor need to look up Process + Thinking + Case study. This entry aggregates feature retirement-related Process + Thinking + Case study into 2-hop paths, avoiding "scattered deprecation / migration gaps / hollow notification / chaotic closed loop / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — retirement intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion think scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [opportunity-solution-tree-summary.md](../../engineer/strategies/prepare-an-opportunity-solution-tree-strategy.md) |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [customer-success-summary.md](../../engineer/strategies/prepare-a-customer-success-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — retirement notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — PM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — retirement incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — retirement business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §retirement |
| `journeys/` | [./prepare-release-notes.md](./prepare-release-notes.md) · [../../product-manager/frameworks/prepare-a-product-launch-strategy.md](../../product-manager/frameworks/prepare-a-product-launch-strategy.md) · [./prepare-a-customer-communications-strategy.md](./prepare-a-customer-communications-strategy.md) · [./i-want-to-prepare-a-migration-strategy.md](./prepare-a-migration-strategy.md) · [./prepare-a-customer-education-strategy.md](./prepare-a-customer-education-strategy.md) |

## Action recommendations

1. **First principles**: first ask "retirement what to solve / what happens if not done / ROI / business impact"; do not retire for retirement's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first think "retirement could go out of control (scattered deprecation / migration gaps / hollow notification / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one retirement → behavior changes → another retirement; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest retirement that satisfies the business wins; do not pile up processes; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Deprecation**: must run deprecation policy / timeline + no scattering. 
6. **Migration**: must run migration path / tools / documentation + no leakage; follow [i-want-to-prepare-a-migration-strategy.md](./prepare-a-migration-strategy.md). 
7. **Customer notification**: must run [i-want-to-prepare-a-customer-communications-strategy.md](./prepare-a-customer-communications-strategy.md) + no leakage. 
8. **Customer education**: must run [i-want-to-prepare-a-customer-education-strategy.md](./prepare-a-customer-education-strategy.md) + no naked run. 
9. **Release notes**: must run [i-want-to-prepare-release-notes.md](./prepare-release-notes.md) announcement + no leakage. 
10. **Publish**: must run [i-want-to-prepare-a-product-launch-strategy.md](../../product-manager/frameworks/prepare-a-product-launch-strategy.md) complementary + no naked run. 
11. **Usage monitoring**: must run [observability-pattern.md](../../engineer/patterns/observability.md) see impact surface + no gut call. 
12. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) gradual retirement. 
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) retirement store + no multi-source. 
14. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run. 
15. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); PM / PMM / CSM / TL owner. 
16. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) no retirement changes. 
17. **Notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) notify internally and externally. 
18. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) migration rate / residual alerts. 
19. **Retrospective**: after retirement incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
20. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) scan residuals / whether timeline is still accurate. 
21. **ADR**: retirement decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
22. **Flywheel**: clean retirement → trust rises → complexity drops → faster iteration; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Same-class journey: [./prepare-release-notes.md](./prepare-release-notes.md) — release notes
- Same-class journey: [../../product-manager/frameworks/prepare-a-product-launch-strategy.md](../../product-manager/frameworks/prepare-a-product-launch-strategy.md) — publish
- Same-class journey: [./prepare-a-customer-communications-strategy.md](./prepare-a-customer-communications-strategy.md) — customer notification
- Same-class journey: [./i-want-to-prepare-a-migration-strategy.md](./prepare-a-migration-strategy.md) — migration
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

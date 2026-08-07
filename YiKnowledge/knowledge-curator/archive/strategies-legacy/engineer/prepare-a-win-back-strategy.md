---

title: I want to prepare a win-back strategy
aliases:
- I want to prepare a churn-recovery strategy
- win-back-journey
- reactivation-journey
- win-back-strategy-journey
- churn-recovery entry
tags:
- journeys
- win-back
- reactivation
- churn-recovery
- lapsed-customer
- win-back-playbook
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
- ./prepare-a-churn-reduction-strategy.md
- ./prepare-a-customer-marketing-strategy.md
- ./prepare-a-customer-segmentation-strategy.md
- ../../product-manager/discovery/metrics/retention-and-churn.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a win-back strategy

> **As an** engineer, **I want to** prepare a win back, **so that** launch is safe.

> "Churned customer + win-back motion + trigger + personalization + ROI + governance + quarterly audit" within 2 hops reach process + thinking + cases.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing churn-recovery / win-back / reactivation / trigger / personalization / ROI / governance / reporting / promo freeze / quarterly audit / retrospective, TL + CSM + marketing + sponsor need to look up process + thinking + cases. This entry aggregates churn-recovery-related process + thinking + cases to within 2 hops, avoiding "trigger missed / motion hollow / personalization scattered / no quarterly audit".

## 2-hop reachability paths

| hop 1 (class/leaf) | hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — win-back intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-find gaps · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `product/strategy/` | [customer-success-summary.md](../../engineer/strategies/prepare-a-customer-success-strategy.md) · [customer-segmentation-summary.md](../../executive/strategy/prepare-a-market-segmentation-strategy.md) · [pricing-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-pricing-strategy.md) |
| `product/metrics/` | [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) · [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — win-back reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — CSM matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — win-back failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — win-back business |
| `projects/` | each project's `architecture-summary.md` §CSM + `adr-*` §win-back |
| `journeys/` | [./prepare-a-churn-reduction-strategy.md](./prepare-a-churn-reduction-strategy.md) · [./prepare-a-customer-marketing-strategy.md](./prepare-a-customer-marketing-strategy.md) · [./prepare-a-customer-segmentation-strategy.md](./prepare-a-customer-segmentation-strategy.md) · [./prepare-a-customer-onboarding-strategy.md](./prepare-a-customer-onboarding-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does win-back solve / what happens if not done / ROI / business impact"; don't do win-back for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "win-back could go out of control (trigger missed / motion hollow / personalization scattered / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one adjustment → behavior changes → another adjustment; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest win-back that meets the business wins; don't pile up touches; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Segmentation**: must segment churned customers (high-value / voluntary / involuntary); don't treat all the same; see [i-want-to-prepare-a-customer-segmentation-strategy.md](./prepare-a-customer-segmentation-strategy.md).
6. **Trigger**: must pick the right trigger timing (just churned / dormant); don't miss.
7. **Motion**: must run a win-back motion; don't run naked.
8. **Personalization**: must personalize win-back (cause / product / price); don't treat all the same; see [i-want-to-prepare-a-personalization-strategy.md](./prepare-a-personalization-strategy.md).
9. **ROI**: must evaluate ROI; don't gut call.
10. **Churn cause**: must analyze churn cause; don't be vague; see [i-want-to-prepare-a-churn-reduction-strategy.md](./prepare-a-churn-reduction-strategy.md).
11. **Customer marketing**: must run [i-want-to-prepare-a-customer-marketing-strategy.md](./prepare-a-customer-marketing-strategy.md); don't run naked.
12. **Onboarding**: must run [i-want-to-prepare-a-customer-onboarding-strategy.md](./prepare-a-customer-onboarding-strategy.md); don't run naked (re-onboard the customer).
13. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) win-back library; don't use multiple sources.
14. **Feature flag**: must run [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) to gray-release the motion.
15. **Cache**: must run [caching-pattern.md](../../engineer/patterns/caching.md); don't recompute.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); CSM / marketing / TL / sponsor as owner.
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); don't move the motion.
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal and external reporting.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for win-back rate / ROI alerts.
20. **Retrospective**: after a win-back failure must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective and archive in [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the motion is still accurate + whether segmentation is still reasonable.
22. **ADR**: win-back decisions must be recorded as an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: win-back done well → revenue returns → CAC lowered → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journeys: [./prepare-a-churn-reduction-strategy.md](./prepare-a-churn-reduction-strategy.md) — churn
- Same-class journeys: [./prepare-a-customer-marketing-strategy.md](./prepare-a-customer-marketing-strategy.md) — customer marketing
- Same-class journeys: [./prepare-a-customer-segmentation-strategy.md](./prepare-a-customer-segmentation-strategy.md) — segmentation
- Same-class journeys: [./prepare-a-customer-onboarding-strategy.md](./prepare-a-customer-onboarding-strategy.md) — onboarding
- Upstream: [../../product-manager/discovery/metrics/README.md](../../product-manager/discovery/metrics/README.md) — metrics leaf entry

---

title: I want to prepare a candidate experience strategy
aliases:
- I want to prepare a candidate experience strategy
- candidate-experience-journey
- candidate-journey-strategy
- candidate experience entry
tags:
- journeys
- candidate-experience
- candidate-journey
- recruitment
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
- ./prepare-a-recruitment-marketing-strategy.md
- ./prepare-a-pre-boarding-strategy.md
- ./prepare-a-talent-acquisition-strategy.md
- ./prepare-a-sourcing-strategy.md
- ./prepare-a-security-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a candidate experience strategy

> **As an** engineer, **I want to** prepare a candidate experience, **so that** launch is safe.

> Reach process + thinking frameworks + case studies within 2 hops for "candidate experience + interview + feedback + governance + quarterly audit".

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing candidate experience / interview / feedback / governance / big-sale freeze / quarterly audit / retrospective, TL + HR + recruitment + business + sponsor need to look up process + thinking + case studies. This entry aggregates candidate experience related process + thinking + case studies into a 2-hop path, avoiding "process scattered / feedback missed / failure risk / closed-loop broken / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — experience essence · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse thinking on dispersion · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | candidate-experience · candidate-journey · interview · feedback |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | candidate-runtime · feedback-store · interview-engine · audit-log |
| `tech/ai-foundations/` | candidate-patterns · feedback-suite · interview-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — experience reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — experience failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — experience business |
| `projects/` | Each project `architecture-summary.md` §PM + `adr-*` §experience |
| `journeys/` | [./prepare-a-recruitment-marketing-strategy.md](./prepare-a-recruitment-marketing-strategy.md) · [./prepare-a-pre-boarding-strategy.md](./prepare-a-pre-boarding-strategy.md) · [./prepare-a-talent-acquisition-strategy.md](./prepare-a-talent-acquisition-strategy.md) · [./prepare-a-sourcing-strategy.md](./prepare-a-sourcing-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: First ask "what does candidate experience solve / what happens if not done / ROI / business impact"; do not experience for the sake of experiencing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First think "how experience could go out of control (process scattered / feedback missed / failure risk / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One experience → behavior change → another experience; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest experience that meets business needs wins; do not pile up stages; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Process**: must run process / touchpoints / feedback + no dispersion.
6. **Interview**: must run interview / evaluation / trace + no omissions.
7. **Observability**: must run observability / traceability / audit + no omissions.
8. **Closed loop**: must run closed loop / retrospective / archive + no omissions.
9. **Recruitment marketing**: must run [i-want-to-prepare-a-recruitment-marketing-strategy.md](./prepare-a-recruitment-marketing-strategy.md) + no naked runs.
10. **Pre-boarding**: must run [i-want-to-prepare-a-pre-boarding-strategy.md](./prepare-a-pre-boarding-strategy.md) + no naked runs.
11. **Talent acquisition**: must run [i-want-to-prepare-a-talent-acquisition-strategy.md](./prepare-a-talent-acquisition-strategy.md) + no naked runs.
12. **Sourcing**: must run [i-want-to-prepare-a-sourcing-strategy.md](./prepare-a-sourcing-strategy.md) + no naked runs.
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked runs.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) experience library + no multiple sources.
15. **Contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked runs.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); platform / HR / recruitment / business owner.
17. **Freeze period**: During big sales, follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not change interview process.
18. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for experience exception alerts.
20. **Retrospective**: After an experience failure, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive to [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether process is still accurate / feedback is still reasonable.
22. **ADR**: Experience decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: Experience done well → acceptance rate rises → trust grows → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [./prepare-a-recruitment-marketing-strategy.md](./prepare-a-recruitment-marketing-strategy.md) — recruitment marketing
- Same-category journey: [./prepare-a-pre-boarding-strategy.md](./prepare-a-pre-boarding-strategy.md) — pre-boarding
- Same-category journey: [./prepare-a-talent-acquisition-strategy.md](./prepare-a-talent-acquisition-strategy.md) — talent acquisition
- Same-category journey: [./prepare-a-sourcing-strategy.md](./prepare-a-sourcing-strategy.md) — sourcing
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

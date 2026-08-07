---

title: I want to prepare a synthetic check strategy
aliases:
- i-want-to-prepare-a-synthetic-check-strategy
- synthetic-check-journey
- proactive-monitoring-journey
- synthetic check entry
tags:
- journeys
- synthetic-check
- proactive-monitoring
- multi-region
- business-flow
- uptime
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
- ../../oncall-sre/incident-response/prepare-an-observability-strategy.md
- ./prepare-an-alerting-strategy.md
- ../../tech-lead/roadmap/prepare-an-slo-strategy.md
- ./prepare-a-real-user-monitoring-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a synthetic check strategy

> **As an** engineer, **I want to** prepare a synthetic check, **so that** launch is safe.

> "Probing + multi-region + business flow + proactive + governance + quarterly audit" — reach process + thinking + cases within 2 hops.

## Summary

- process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing synthetic checks / multi-region / business flow / proactive / governance / promotion freeze / quarterly audit / retrospective, TL + platform + SRE + algorithm + sponsor need to look up process + thinking + cases. This entry aggregates synthetic-check-related process + thinking + cases to 2-hop paths, avoiding "scattered probes / multi-region gaps / drift / chaotic closed loop / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of probing · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-thinking of scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | synthetic-check · proactive-monitoring · multi-region · business-flow-probe |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | probe-runtime · multi-region-runner · flow-replayer · alert-runtime |
| `tech/ai-foundations/` | probe-patterns · flow-suite · multi-region-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — probe notification |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — SRE matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — probe incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — probe business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §probe |
| `journeys/` | [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) · [./prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md) · [../../tech-lead/roadmap/prepare-an-slo-strategy.md](../../tech-lead/roadmap/prepare-an-slo-strategy.md) · [./prepare-a-real-user-monitoring-strategy.md](./prepare-a-real-user-monitoring-strategy.md) · [./prepare-an-error-budget-strategy.md](./prepare-an-error-budget-strategy.md) |

## Action recommendations

1. **first principles**: first ask "what does probing solve / what happens if not done / ROI / business impact"; don't probe for probing's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "how probing could go out of control (scattered probes / multi-region gaps / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one probe → behavior change → another probe; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest probe that satisfies business wins; don't pile up probes; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **business flow**: must run business flow / key path / multi-step + no scatter.
6. **multi-region**: must run multi-region / area / carrier + no gaps.
7. **frequency**: must run frequency / interval / jitter + no gaps.
8. **proactive alert**: must run proactive / earlier than users / notification + no gaps.
9. **observable**: must run [i-want-to-prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) + no naked run.
10. **alert**: must run [i-want-to-prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md) + no naked run.
11. **SLO**: must run [i-want-to-prepare-an-slo-strategy.md](../../tech-lead/roadmap/prepare-an-slo-strategy.md) + no naked run.
12. **RUM**: must run [i-want-to-prepare-a-real-user-monitoring-strategy.md](./prepare-a-real-user-monitoring-strategy.md) + no naked run.
13. **error budget**: must run [i-want-to-prepare-an-error-budget-strategy.md](./prepare-an-error-budget-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) probe library + no multi-source.
15. **contract test**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); SRE / platform / algorithm / TL owner.
17. **freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — don't change probes.
18. **notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify inside and outside.
19. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for probe failure alerts.
20. **retrospective**: after a probe incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs).
21. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to sweep whether business flow is still accurate / whether frequency is still reasonable.
22. **ADR**: probe decisions must be recorded in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **flywheel**: probing good → early discovery → trust grows → more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- same-category journey: [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) — observable
- same-category journey: [./prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md) — alerting
- same-category journey: [../../tech-lead/roadmap/prepare-an-slo-strategy.md](../../tech-lead/roadmap/prepare-an-slo-strategy.md) — SLO
- same-category journey: [./prepare-a-real-user-monitoring-strategy.md](./prepare-a-real-user-monitoring-strategy.md) — RUM
- upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

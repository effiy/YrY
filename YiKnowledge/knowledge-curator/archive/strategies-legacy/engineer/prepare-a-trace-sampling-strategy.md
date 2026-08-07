---

title: I want to prepare a trace sampling strategy
aliases:
- I want to prepare a trace sampling strategy
- trace-sampling-journey
- sampling-journey
- trace-sampling-entry
tags:
- journeys
- trace-sampling
- sampling
- distributed-tracing
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-a-distributed-tracing-strategy.md
- ./prepare-an-otel-collector-strategy.md
- ../../oncall-sre/incident-response/prepare-an-observability-pipeline-strategy.md
- ../../tech-lead/roadmap/prepare-an-slo-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a trace sampling strategy

> **As an** engineer, **I want to** prepare a trace sampling, **so that** launch is safe.

> "Trace sampling + head/tail + quota + Governance + Quarterly audit" reach within 2 hops Process + Thinking + Case study.

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing trace sampling / head / tail / quota / Governance / promotion freeze / Quarterly audit / Retrospective, TL + Platform + algorithm + data + sponsor need to look up Process + Thinking + Case study. This entry aggregates trace-sampling-related Process + Thinking + Case study into a 2-hop path, avoiding "scattered sampling / missing key / cost explosion / chaotic closed loop / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of sampling · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — Inversion on scatter · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | trace-sampling · head-sampling · tail-sampling · quota |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [compliance-strategy-summary.md](../../engineer/strategies/prepare-an-audit-compliance-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | sampling-runtime · rule-store · decide-engine · audit-log |
| `tech/ai-foundations/` | sampling-patterns · rule-suite · decide-baseline |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — sampling Communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — Platform matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — sampling Incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — sampling business |
| `projects/` | each project `architecture-summary.md` § PM + `adr-*` § sampling |
| `journeys/` | [./prepare-a-distributed-tracing-strategy.md](./prepare-a-distributed-tracing-strategy.md) · [./prepare-an-otel-collector-strategy.md](./prepare-an-otel-collector-strategy.md) · [../../oncall-sre/incident-response/prepare-an-observability-pipeline-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-pipeline-strategy.md) · [../../tech-lead/roadmap/prepare-an-slo-strategy.md](../../tech-lead/roadmap/prepare-an-slo-strategy.md) · [./prepare-a-security-strategy.md](./prepare-a-security-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does trace sampling solve / what happens if not done / ROI / business impact"; do not sample for the sake of sampling; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "sampling could go out of control (scattered sampling / missing key / cost explosion / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one-shot sampling -> row variation -> and one-shot sampling; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: satisfy business with the simplest sampling that wins; do not pile up rules; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Head/tail**: must run head / tail / quota + no scatter.
6. **Rules**: must run rules / filter / enforce + no omission.
7. **Observable**: must run observable / trace / audit + no omission.
8. **Closed loop**: must run closed loop / Retrospective / Archive + no omission.
9. **Distributed tracing**: must run [i-want-to-prepare-a-distributed-tracing-strategy.md](./prepare-a-distributed-tracing-strategy.md) + no naked run.
10. **OTel Collector**: must run [i-want-to-prepare-an-otel-collector-strategy.md](./prepare-an-otel-collector-strategy.md) + no naked run.
11. **Observability pipeline**: must run [i-want-to-prepare-an-observability-pipeline-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-pipeline-strategy.md) + no naked run.
12. **SLO**: must run [i-want-to-prepare-an-slo-strategy.md](../../tech-lead/roadmap/prepare-an-slo-strategy.md) + no naked run.
13. **Security**: must run [i-want-to-prepare-a-security-strategy.md](./prepare-a-security-strategy.md) + no naked run.
14. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) rules library + no multi-source.
15. **Contract QA**: must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); Platform / algorithm / data / TL owner.
17. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) do not touch sampling rules.
18. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) Communication inside and outside.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) sampling anomaly alert.
20. **Retrospective**: sampling Incident after must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) Retrospective + Archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) sweep rules whether still accurate / quota whether still reasonable.
22. **ADR**: sampling Decision must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: sampling good -> cost drop -> trust rise -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-distributed-tracing-strategy.md](./prepare-a-distributed-tracing-strategy.md) — distributed tracing
- Related journey: [./prepare-an-otel-collector-strategy.md](./prepare-an-otel-collector-strategy.md) — OTel Collector
- Related journey: [../../oncall-sre/incident-response/prepare-an-observability-pipeline-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-pipeline-strategy.md) — observability pipeline
- Related journey: [../../tech-lead/roadmap/prepare-an-slo-strategy.md](../../tech-lead/roadmap/prepare-an-slo-strategy.md) — SLO
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

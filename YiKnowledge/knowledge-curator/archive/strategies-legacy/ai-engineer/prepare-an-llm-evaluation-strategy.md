---

title: I want to prepare an LLM evaluation strategy
aliases:
- I want to prepare LLM assessment strategy
- llm-evaluation-journey
- llm-eval-journey
- LLM assessment entry
tags:
- journeys
- llm-evaluation
- llm-eval
- evals
- golden-set
- human-eval
category: ai-engineer/foundations
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- ai-engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ./prepare-a-rag-evaluation-strategy.md
- ../../oncall-sre/incident-response/prepare-an-observability-strategy.md
- ../../product-manager/frameworks/prepare-a-product-telemetry-strategy.md
- ../../engineer/architecture-design/ssot-view-layer.md
- ../../knowledge-curator/diagrams/directory-blueprint.md
- ../../knowledge-curator/diagrams/user-journey.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an LLM evaluation strategy

> **As an** ai engineer, **I want to** prepare an llm evaluation, **so that** launch is safe.

> Reach Process + Thinking + Case study within 2 hops for "assessment set + auto + manual + online + Governance + Quarterly audit".

## Summary

- Process: go [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: go [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: go [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [caching-pattern.md](../../engineer/patterns/caching.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study: go [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing LLM assessment / assessment set / auto / manual / online / Governance / big-promo freeze / Quarterly audit / Retrospective, TL + algorithm + Platform + data + sponsor need to look up Process + Thinking + Case study. This entry aggregates LLM assessment related Process + Thinking + Case study into a 2-hop path, avoiding "assessment scattered / golden drift / online hollow / closed-loop chaos / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — assessment intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion imagine scattering · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/pm-frameworks/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [pirate-funnel-summary.md](../../engineer/strategies/prepare-a-pirate-funnel-strategy.md) · [growth-loops-summary.md](../../engineer/strategies/prepare-a-growth-experiment-strategy.md) |
| `methodology/ai-specific/` | rag-evaluation · llm-eval · prompt-engineering · model-routing |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [data-strategy-summary.md](../../engineer/strategies/prepare-a-data-product-strategy.md) · [ai-strategy-summary.md](../../engineer/strategies/prepare-an-ai-strategy-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `tech/ai-platform/` | model-serving · evals-platform · golden-set · ab-testing |
| `tech/ai-foundations/` | rag-baseline · prompt-patterns · agent-loop |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — assessment communication |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — algorithm matrix |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — assessment incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [scenarios](../../brd/) · [reference](../../brd/) — assessment business |
| `projects/` | each project `architecture-summary.md` §PM + `adr-*` §assessment |
| `journeys/` | [./prepare-a-rag-evaluation-strategy.md](./prepare-a-rag-evaluation-strategy.md) · [./i-want-to-prepare-an-experiment-strategy.md](../../engineer/quality-security/run-an-experiment.md) · [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) · [../../product-manager/frameworks/prepare-a-product-telemetry-strategy.md](../../product-manager/frameworks/prepare-a-product-telemetry-strategy.md) · [./prepare-a-prompt-engineering-strategy.md](./prepare-a-prompt-engineering-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does assessment solve / what if not done / ROI / business impact"; do not assess for the sake of assessing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how assessment can fail (golden drift / auto hollow / online missed / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one assessment -> model changes -> another assessment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam's razor**: the simplest assessment that satisfies business wins; do not pile up metrics; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **golden set**: must do golden set / annotation / version + no scattering.
6. **auto assessment**: must do LLM-as-judge / rule / rubric + no leakage.
7. **manual assessment**: must do manual / double-blind / consistency + no leakage.
8. **online assessment**: must do online / A/B / feedback closed loop + no leakage.
9. **RAG assessment**: must do [i-want-to-prepare-a-rag-evaluation-strategy.md](./prepare-a-rag-evaluation-strategy.md) + no naked run.
10. **experiment**: must do [i-want-to-prepare-an-experiment-strategy.md](../../engineer/quality-security/run-an-experiment.md) A/B + no naked run.
11. **observability**: must do [i-want-to-prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) + no naked run.
12. **telemetry**: must do [i-want-to-prepare-a-product-telemetry-strategy.md](../../product-manager/frameworks/prepare-a-product-telemetry-strategy.md) likes / feedback + no naked run.
13. **prompt engineering**: must do [i-want-to-prepare-a-prompt-engineering-strategy.md](./prepare-a-prompt-engineering-strategy.md) + no naked run.
14. **SSOT**: must do [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) assessment library + no multi-source.
15. **contract test**: must do [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + no naked run.
16. **RACI**: must do [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); algorithm / data / Platform / TL owner.
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move the golden set.
18. **Communication**: must do [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) communicate internally and externally.
19. **Monitoring**: must do [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) scoring drift alerts.
20. **Retrospective**: after assessment incidents, must do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) Retrospective + Archive [bugs/](../../engineer/lessons/failures/bugs).
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether golden is still fresh / metric is still accurate.
22. **ADR**: assessment decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good assessment -> model improves -> experience improves -> more budget; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Related journey: [./prepare-a-rag-evaluation-strategy.md](./prepare-a-rag-evaluation-strategy.md) — RAG assessment
- Related journey: [./i-want-to-prepare-an-experiment-strategy.md](../../engineer/quality-security/run-an-experiment.md) — experiment
- Related journey: [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) — observability
- Related journey: [../../product-manager/frameworks/prepare-a-product-telemetry-strategy.md](../../product-manager/frameworks/prepare-a-product-telemetry-strategy.md) — telemetry
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) — strategy leaf entry

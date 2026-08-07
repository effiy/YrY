---

title: I want to prepare an evaluation driven development strategy
aliases:
- I want to prepare an evaluation driven development strategy
- eval-driven-journey
- eval-first-journey
- evaluation-driven-development-journey
- evaluation driven entry
tags:
- journeys
- eval-driven
- evaluation-driven-development
- eval-first
- golden-set
- regression-eval
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../../ai-engineer/foundations/prepare-an-agent-evaluation-strategy.md
- ../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md
- ../projects/build-an-eval-harness.md
- ../../engineer/engineering/evaluation-driven-development.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an evaluation driven development strategy

> **As an** engineer, **I want to** prepare an evaluation driven development, **so that** launch is safe. 

> "Golden set + metric + regression + threshold + dashboard + defect injection + quarterly audit" reach process + thinking + case study within 2 hops. 

## Summary

- Process follows [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [eval-driven-pattern.md](../../engineer/engineering/evaluation-driven-development.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case study follows [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario description

When preparing an evaluation-driven development strategy / eval driven / golden set / metric / regression / threshold / dashboard / defect injection / eval gate / eval communication / eval promotion freeze / quarterly eval audit / eval retrospective, TL + AI + Platform + sponsor need to look up process + thinking + case study. This entry aggregates eval-driven-related process + thinking + case study into a 2-hop path, avoiding "golden set hollow / metric messy / regression missing / gate missing / no quarterly audit". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/ai-specific/` | [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) |
| `methodology/engineering-patterns/` | [eval-driven-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [feature-flag-pattern.md](../../engineer/patterns/feature-flag.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — eval intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion bias · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `tech/ai-foundations/` | [transformer-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [rlhf-dpo-summary.md](../../ai-engineer/foundations/rlhf-dpo-alignment.md) · [long-context-summary.md](../../ai-engineer/foundations/long-context-techniques.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — eval communication |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) — eval north star |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — eval incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [scenarios](../../brd/) — eval business |
| `projects/` | each project `architecture-summary.md` §AI + `adr-*` §eval |
| `journeys/` | [../../ai-engineer/foundations/prepare-an-agent-evaluation-strategy.md](../../ai-engineer/foundations/prepare-an-agent-evaluation-strategy.md) · [../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md](../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md) · [../projects/build-an-eval-harness.md](../projects/build-an-eval-harness.md) · [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) |

## Action recommendations

1. **First principles**: first ask "what does eval driven solve / what happens if not done / ROI / business impact"; don't eval-but-eval; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first think "eval driven could go out of control (hollow high / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one-shot weight tuning -> row format change -> another one-shot tuning; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest eval that satisfies business wins; do not pile up metrics; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Golden set**: must run golden set + must be manually labeled + avoid auto-generated. 
6. **Metric**: must run multi-dimension (accuracy / recall / faithfulness / safety) + avoid accuracy-only. 
7. **Regression**: must run regression suite + avoid drift; see [i-want-to-handle-a-model-drift.md](../../ai-engineer/foundations/handle-a-model-drift.md). 
8. **Threshold**: must run threshold + must gate + avoid free pass. 
9. **Dashboard**: must run eval dashboard + avoid silo; see [observability-pattern.md](../../engineer/patterns/observability.md). 
10. **Defect injection**: must run fault injection + avoid blind run; see [i-want-to-run-a-chaos-engineering-experiment.md](../../oncall-sre/incident-response/run-a-chaos-engineering-experiment.md). 
11. **Eval gate**: must run CI gate + avoid naked merge; see [eval-driven-pattern.md](../../engineer/engineering/evaluation-driven-development.md). 
12. **LLM-as-judge**: must run LLM-as-judge + must be human-calibrated + avoid auto-only; see [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md). 
13. **Harness**: must run [i-want-to-build-an-eval-harness.md](../projects/build-an-eval-harness.md) + avoid scattered scripts. 
14. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); AI / Platform / TL / sponsor owners. 
15. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not bypass eval gate. 
16. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) for internal/external communication. 
17. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for sample drift / pass rate alerts. 
18. **Retrospective**: after eval incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
19. **Quarterly audit**: see [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether golden set still accurate + threshold still reasonable. 
20. **ADR**: eval decisions must be recorded in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
21. **Flywheel**: eval driven well -> faster iteration -> quality rise -> more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- Related journey: [../../ai-engineer/foundations/prepare-an-agent-evaluation-strategy.md](../../ai-engineer/foundations/prepare-an-agent-evaluation-strategy.md) — agent eval
- Related journey: [../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md](../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md) — RAG eval
- Related journey: [../projects/build-an-eval-harness.md](../projects/build-an-eval-harness.md) — eval harness
- Related journey: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — LLM eval
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) — patterns leaf entry

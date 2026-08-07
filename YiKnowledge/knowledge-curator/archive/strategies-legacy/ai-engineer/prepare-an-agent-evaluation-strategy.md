---

title: I want to prepare an agent evaluation strategy
aliases:
- i-want-to-prepare-an-agent-evaluation-strategy
- agent-eval-journey
- agent-evaluation-journey
- trajectory-eval-journey
- agent-evaluation-entry
tags:
- journeys
- agent-evaluation
- trajectory-eval
- tool-use-eval
- agent-benchmark
- multi-turn-eval
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
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../../engineer/projects/build-an-eval-harness.md
- ./prepare-a-rag-evaluation-strategy.md
- ./prepare-a-multi-agent-strategy.md
- ../../ai-engineer/methodology/llm-evaluation-methods.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an agent evaluation strategy

> **As a** an ai engineer, **I want to** prepare an agent evaluation, **so that** launch is safe. 

> "Trajectory + tool selection + task success + sub-goals + self-reflection + multi-turn + benchmark + quarterly audit" reachable within 2 hops across process + thinking + case studies.

## Summary

- Process: see [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md)
- Thinking: see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: see [eval-driven-pattern.md](../../engineer/engineering/evaluation-driven-development.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies: see [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md)

## Scenario

When preparing an agent evaluation strategy / agent eval / trajectory evaluation / tool selection / task success / sub-goals / self-reflection / multi-turn / benchmark / agent eval notification / quarterly agent eval audit / agent eval retrospective, TL + AI + platform + sponsor need to look up process + thinking + case studies. This entry aggregates agent-eval-related process + thinking + case studies into 2-hop paths, avoiding "hollow trajectory / missed tool / missing multi-turn / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/ai-specific/` | [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) |
| `methodology/engineering-patterns/` | [eval-driven-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [observability-pattern.md](../../engineer/patterns/observability.md) · [caching-pattern.md](../../engineer/patterns/caching.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of evaluation · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion on bias · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `tech/ai-foundations/` | [transformer-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [long-context-summary.md](../../ai-engineer/foundations/long-context-techniques.md) · [moe-summary.md](../../ai-engineer/foundations/moe-architecture.md) · [multimodal-summary.md](../../ai-engineer/foundations/multimodal-fusion.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — eval notification |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — agent eval failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [scenarios](../../brd/) — agent business |
| `projects/` | each project `architecture-summary.md` §AI + `adr-*` §eval |
| `journeys/` | [../../engineer/projects/build-an-eval-harness.md](../../engineer/projects/build-an-eval-harness.md) · [./prepare-a-rag-evaluation-strategy.md](./prepare-a-rag-evaluation-strategy.md) · [./prepare-a-multi-agent-strategy.md](./prepare-a-multi-agent-strategy.md) · [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) |

## Action recommendations

1. **First principles**: first ask "what does agent eval solve / what happens if not done / ROI / business impact"; do not eval for the sake of eval; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first imagine "how agent eval could go out of control (vanity high / deviation / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one weight tweak → behavior changes → another tweak; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest metric that meets business needs wins; do not pile up dimensions; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Trajectory evaluation**: must run trajectory collection + step-level + avoid terminal-state-only. 
6. **Tool selection**: must run tool accuracy + parameter fill + avoid selection-only. 
7. **Task success**: must run end-to-end success rate + avoid single-step. 
8. **Sub-goals**: must run sub-goal achievement rate + avoid end-only. 
9. **Self-reflection**: must run self-reflection rate + avoid no-reflection. 
10. **Multi-turn**: must run multi-turn context + avoid single-turn. 
11. **Benchmark**: must run agent benchmark (AgentBench / ToolEval / τ-bench) + avoid self-reporting. 
12. **Human-class annotation**: must run golden set + avoid pure LLM-as-judge; see [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md). 
13. **Regression**: must run regression suite + avoid drift; see [i-want-to-handle-a-model-drift.md](./handle-a-model-drift.md). 
14. **Eval harness**: must run [i-want-to-build-an-eval-harness.md](../../engineer/projects/build-an-eval-harness.md) + avoid scattered scripts. 
15. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); AI / platform / TL / sponsor owner. 
16. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move eval metrics. 
17. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
18. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) success rate / tool failure alerts. 
19. **Retrospective**: after eval failures must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs). 
20. **Quarterly audit**: run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md); scan whether metrics are still accurate + whether benchmarks are still reasonable. 
21. **ADR**: eval decisions must land as ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
22. **Flywheel**: eval works well → faster iteration → quality rises → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- similar journey: [../../engineer/projects/build-an-eval-harness.md](../../engineer/projects/build-an-eval-harness.md) — eval harness
- similar journey: [./prepare-a-rag-evaluation-strategy.md](./prepare-a-rag-evaluation-strategy.md) — RAG eval
- similar journey: [./prepare-a-multi-agent-strategy.md](./prepare-a-multi-agent-strategy.md) — multi-agent
- similar journey: [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) — LLM eval
- upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — ai-specific leaf entry

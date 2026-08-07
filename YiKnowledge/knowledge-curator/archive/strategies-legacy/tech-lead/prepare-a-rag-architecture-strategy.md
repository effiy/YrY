---

title: I want to prepare a RAG architecture strategy
aliases:
- I want to prepare a RAG architecture strategy
- rag-architecture-journey
- hybrid-rag-journey
- agentic-rag-journey
- RAG architecture entry
tags:
- journeys
- rag-architecture
- hybrid-rag
- agentic-rag
- graph-rag
- self-rag
- corrective-rag
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- tech-lead
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- file names are descriptive verb-phrases, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../../engineer/strategies/prepare-a-context-engineering-strategy.md
- ../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md
- ../../ai-engineer/platform/pick-a-vector-database.md
- ../../ai-engineer/methodology/rag-design-patterns.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a RAG architecture strategy

> **As a** tech lead, **I want to** prepare a rag architecture, **so that** launch is safe.

> "Retrieve + rerank + generate + citation + hybrid + agentic + graph + self-RAG + quarterly audit" within 2 hops reach process + thinking + cases.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [release-freeze-process.md](../../oncall-sre/release/release-freeze.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [eval-driven-pattern.md](../../engineer/engineering/evaluation-driven-development.md) + [inline-citation-rag-pattern.md](../../engineer/patterns/inline-citation-rag.md) + [caching-pattern.md](../../engineer/patterns/caching.md)
- Cases: [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/wins/yiai-rag-hybrid-retrieval.md) + [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md)

## Scenario description

When preparing a RAG architecture strategy / retrieval-augmented generation / hybrid / agentic / graph-rag / self-RAG / corrective RAG / fusion / HyDE / RAG comms / RAG big-promo freeze / quarterly RAG audit / RAG retrospective, TL + AI + platform + sponsor need to look up process + thinking + cases. This entry aggregates RAG-architecture-related process + thinking + cases into 2-hop paths, avoiding "architecture by gut feel / retrieval hollow / rerank missing / no quarterly audit."

## 2-hop reachable paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `methodology/engineering-patterns/` | [eval-driven-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [inline-citation-rag-pattern.md](../../engineer/patterns/inline-citation-rag.md) · [caching-pattern.md](../../engineer/patterns/caching.md) · [rate-limiting-pattern.md](../../engineer/patterns/rate-limiting.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — RAG intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert what to lose · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) |
| `tech/ai-foundations/` | [transformer-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [long-context-summary.md](../../ai-engineer/foundations/long-context-techniques.md) · [moe-summary.md](../../ai-engineer/foundations/moe-architecture.md) · [kv-cache-summary.md](../../ai-engineer/foundations/kv-cache-inference-optimization.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — RAG comms |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/wins/yiai-rag-hybrid-retrieval.md) · [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) |
| `lessons/failures/` | [ai-product-launch.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — RAG failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [scenarios](../../brd/) — RAG business |
| `projects/` | each project's `architecture-summary.md` §AI + `adr-*` §RAG |
| `journeys/` | [../../engineer/strategies/prepare-a-context-engineering-strategy.md](../../engineer/strategies/prepare-a-context-engineering-strategy.md) · [../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md](../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md) · [../../ai-engineer/platform/pick-a-vector-database.md](../../ai-engineer/platform/pick-a-vector-database.md) · [../../ai-engineer/foundations/prepare-an-llm-ops-strategy.md](../../ai-engineer/foundations/prepare-an-llm-ops-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does RAG solve / what happens if not done / ROI / business impact"; do not do RAG for RAG's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "how RAG will go out of control (loss / noise / hallucination / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: one architecture tweak → behavior changes → another tweak; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest architecture that meets business wins; do not stack RAG patterns; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Basic RAG**: must go retrieve → rerank → generate + no skipping; see [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md).
6. **hybrid**: must do hybrid retrieval (vector + keyword + metadata) + no single mode.
7. **agentic RAG**: must do agent-decided retrieval + no fixed routing; see [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md).
8. **graph RAG**: complex relationships must use graph RAG + no vector-only.
9. **self-RAG**: must do self-reflection + no blind answer.
10. **corrective RAG**: must do correction + no direct return.
11. **fusion / HyDE**: must do query rewriting + no raw.
12. **rerank**: must use a reranker + no direct return.
13. **citation**: must do inline citation + no sourceless; see [inline-citation-rag-pattern.md](../../engineer/patterns/inline-citation-rag.md).
14. **cache**: must use [caching-pattern.md](../../engineer/patterns/caching.md) + no recompute.
15. **eval**: must use [i-want-to-prepare-a-rag-evaluation-strategy.md](../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md) + no self-report.
16. **context**: must use [i-want-to-prepare-a-context-engineering-strategy.md](../../engineer/strategies/prepare-a-context-engineering-strategy.md) + no stuffing full.
17. **RACI**: must use [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); AI / platform / TL / sponsor owners.
18. **Freeze window**: during big promos use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), do not change retrieval strategy.
19. **Comms**: must use [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to communicate internally and externally.
20. **Monitoring**: must use [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for recall / hit / latency alerts.
21. **Retrospective**: after RAG failures must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) and archive to [bugs/](../../engineer/lessons/failures/bugs).
22. **Quarterly audit**: use [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the architecture is still accurate + eval still reasonable.
23. **ADR**: RAG decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
24. **Flywheel**: good RAG → accurate recall → better experience → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-kind journey: [../../engineer/strategies/prepare-a-context-engineering-strategy.md](../../engineer/strategies/prepare-a-context-engineering-strategy.md) — context engineering
- Same-kind journey: [../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md](../../ai-engineer/foundations/prepare-a-rag-evaluation-strategy.md) — RAG eval
- Same-kind journey: [../../ai-engineer/platform/pick-a-vector-database.md](../../ai-engineer/platform/pick-a-vector-database.md) — vector store
- Same-kind journey: [../../ai-engineer/foundations/prepare-an-llm-ops-strategy.md](../../ai-engineer/foundations/prepare-an-llm-ops-strategy.md) — LLMOps
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — ai-specific leaf entry

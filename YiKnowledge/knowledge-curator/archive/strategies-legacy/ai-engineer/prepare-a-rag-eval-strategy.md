---
title: I want to prepare a RAG Eval strategy / Prepare a RAG Eval strategy
aliases: [i-want-to-prepare-a-rag-eval-strategy, rag-eval-strategy]
tags: [journey, methodology, ai, rag, evaluation, planning]
category: ai-engineer/foundations
created: 2026-08-04
updated: 2026-08-04
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [ai-engineer]
benefit: "launch is safe"
acceptance_criteria:
 - "frontmatter roles + benefit + acceptance_criteria present"
 - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
 - "body contains user story header + 7 fixed-order sections"
related:
 - ./prepare-a-rag-pipeline-strategy.md
 - ../../engineer/strategies/prepare-a-model-evaluation-strategy.md
 - ../../engineer/strategies/prepare-a-model-explainability-strategy.md
 - ../../engineer/strategies/prepare-a-model-monitoring-strategy.md
 - ./prepare-a-rag-observability-strategy.md
 - ../../knowledge-curator/templates/thinking/first-principles.md
 - ../../knowledge-curator/templates/thinking/inversion.md
 - ../../knowledge-curator/templates/thinking/second-order-thinking.md
 - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: RAG Eval is not just a part; it is a contract. dimension + data + method + Governance + Measurement — five dimensions; business-value driven; not one-shot; measurable
---

# I want to prepare a RAG Eval strategy

> **As an** ai engineer, **I want to** prepare a rag eval, **so that** launch is safe.

## Summary

- RAG Eval = contract; not just a part
- dimension + data + method + Governance + Measurement — five dimensions; no missing dimension
- business-value driven; not by feel
- covers retrieval / generation / faithfulness / relevance / safety — multiple types
- links with rag-pipeline + model-evaluation + model-explainability + model-monitoring + rag-observability
- publicly accessible; not hidden
- regular review; evolve and update
- first principles / inversion / second-order / Occam's razor

## Scenario description

RAG Eval is a contract; not just a part. This entry provides the RAG Eval full path, covering dimension + data + method + Governance + Measurement, business-value driven not by feel, covering retrieval / generation / faithfulness / relevance / safety multiple types, and links to prepare-a-rag-pipeline + prepare-a-model-evaluation + prepare-a-model-explainability + prepare-a-model-monitoring + prepare-a-rag-observability, publicly accessible, regular review, and links to RAGPipeline / ModelEvaluation / ModelExplainability / ModelMonitoring / RAGObservability and other leaves.

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | rag-pipeline | [./prepare-a-rag-pipeline-strategy.md](./prepare-a-rag-pipeline-strategy.md) |
| 1 hop | model-evaluation | [../../engineer/strategies/prepare-a-model-evaluation-strategy.md](../../engineer/strategies/prepare-a-model-evaluation-strategy.md) |
| 2 hops | model-explainability | [../../engineer/strategies/prepare-a-model-explainability-strategy.md](../../engineer/strategies/prepare-a-model-explainability-strategy.md) |
| 2 hops | model-monitoring | [../../engineer/strategies/prepare-a-model-monitoring-strategy.md](../../engineer/strategies/prepare-a-model-monitoring-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: dimension + data + method + Governance + Measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; no empty slogans
3. **dimension Dimension**: retrieval / generation / faithfulness; none missing
4. **data Dataset**: golden / synthetic / production; none missing
5. **method Method**: rule-based / llm-as-judge / human; none missing
6. **Governance**: owner / cadence / review / docs / drift; none missing
7. **Measure**: efficiency + trust + speed + risk + cost; none missing
8. **Not one-shot**: progressive from dimension → data → method → Governance → Measurement; no skipping levels
9. **Not report-only**: the evaluation report is only the starting point; not the endpoint
10. **No empty slogans**: every principle must have landed evidence; no ambiguity
11. **Versioned**: strategy has versions; evolution is traceable
12. **links with rag-pipeline**: RAGEval + RAGPipeline co-build
13. **links with model-evaluation**: RAGEval + ModelEvaluation co-build
14. **links with model-explainability**: RAGEval + ModelExplainability co-build
15. **links with model-monitoring**: RAGEval + ModelMonitoring co-build
16. **links with rag-observability**: RAGEval + RAGObservability co-build
17. **Toolchain**: Ragas / TruLens / DeepEval / Langfuse / Phoenix
18. **Publicly accessible**: strategy accessible to everyone; not hidden
19. **Regular review**: evolve and update; not one-shot
20. **First principles**: why RAG Eval is necessary; worst consequence of not doing it
21. **Inversion**: how much can manual sampling solve; if solvable, don't introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (efficiency / trust / speed / risk)
23. **Occam**: RAGEval — the simpler the better; cut redundant layers

## Related

- rag-pipeline: [./prepare-a-rag-pipeline-strategy.md](./prepare-a-rag-pipeline-strategy.md) — RAGPipeline co-build
- model-evaluation: [../../engineer/strategies/prepare-a-model-evaluation-strategy.md](../../engineer/strategies/prepare-a-model-evaluation-strategy.md) — ModelEvaluation co-build
- model-explainability: [../../engineer/strategies/prepare-a-model-explainability-strategy.md](../../engineer/strategies/prepare-a-model-explainability-strategy.md) — ModelExplainability co-build
- model-monitoring: [../../engineer/strategies/prepare-a-model-monitoring-strategy.md](../../engineer/strategies/prepare-a-model-monitoring-strategy.md) — ModelMonitoring co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)

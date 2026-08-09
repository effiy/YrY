---
title: I want to build a RAG evaluation strategy / Prepare a RAG evaluation strategy
aliases: [i-want-to-prepare-a-rag-evaluation-strategy, rag-evaluation-strategy, rag-eval-strategy]
tags: [journey, methodology, rag, evaluation, llm, ai-governance, planning]
category: ai-engineer/foundations
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [ai-engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ../../engineer/projects/build-a-rag-pipeline.md
  - ../platform/evaluate-an-llm-app.md
  - ./prepare-an-llm-ops-strategy.md
  - ./prepare-a-prompt-engineering-strategy.md
  - ../../engineer/processes/run-an-a-b-test.md
  - ../platform/pick-an-llm-provider.md
  - ../methodology/tune-prompts.md
  - ../../engineer/strategies/prepare-an-ai-governance-framework.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "RAG evaluation is not just ragas; it is a contract. Retrieval + generation + reference + end-to-end + cost five dimensions; business-value driven; not one-shot; measurable"
status: deprecated
---

# I want to build a RAG evaluation strategy

> **As an** ai engineer, **I want to** prepare a rag evaluation, **so that** launch is safe.

## Summary

- RAG evaluation = contract; not just ragas
- Retrieval + generation + reference + end-to-end + cost five dimensions; no missing dimension
- business-value driven; not by gut feel
- Covers offline + online + manual + automated + continuous monitoring layers
- Links with build-rag-pipeline + evaluate-llm-app + llm-ops + prompt-engineering + A/B + llm-provider + tune-prompts + ai-governance
- publicly queryable; not hidden
- periodic review; evolution updates
- first principles / inversion / second-order / Occam

## Scenario

RAG evaluation is a contract; not just ragas. This entry provides the RAG evaluation full path, covering retrieval + generation + reference + end-to-end + cost, business-value driven not by gut feel, covering offline + online + manual + automated + continuous monitoring layers, linking with build-a-rag-pipeline + evaluate-an-llm-app + prepare-an-llm-ops-strategy + prepare-a-prompt-engineering-strategy + run-an-a-b-test + pick-an-llm-provider + tune-prompts + prepare-an-ai-governance-framework, publicly queryable, periodic review, and links to build-a-rag-pipeline / evaluate-an-llm-app / prepare-an-llm-ops-strategy / prepare-a-prompt-engineering-strategy / run-an-a-b-test / pick-an-llm-provider / tune-prompts / prepare-an-ai-governance-framework and other leaves.

## 2-hop reachability paths

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | rag-pipeline | [../../engineer/projects/build-a-rag-pipeline.md](../../engineer/projects/build-a-rag-pipeline.md) |
| 1 hop | evaluate-llm-app | [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) |
| 2 hops | llm-ops | [./prepare-an-llm-ops-strategy.md](./prepare-an-llm-ops-strategy.md) |
| 2 hops | prompt-engineering | [./prepare-a-prompt-engineering-strategy.md](./prepare-a-prompt-engineering-strategy.md) |
| 2 hops | A/B | [../../engineer/processes/run-an-a-b-test.md](../../engineer/processes/run-an-a-b-test.md) |
| 2 hops | llm-provider | [../platform/pick-an-llm-provider.md](../platform/pick-an-llm-provider.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: retrieval + generation + reference + end-to-end + cost; no missing dimension
2. **business-value driven**: prioritize by scenario + user impact + evaluation metric + cost; not sloganeering
3. **Retrieval**: recall + precision + MRR + nDCG + context relevance; do not omit
4. **Generation**: faithfulness + answer relevancy + information density + fluency + safety; do not omit
5. **Reference**: citation accuracy + recall + consistency + clickability + scope filter; do not omit
6. **End-to-end**: user satisfaction + task completion rate + latency + cost + safety; do not omit
7. **Cost**: token + embedding + rerank + storage + inference; do not omit
8. **not one-shot**: progressive from single query → eval set → baseline → CI gate → continuous monitoring; no skipping
9. **not report-ized**: reports are only the start; not the end
10. **not sloganeering**: every principle must have landing evidence; not vague
11. **versioned**: strategy has versions; evolution is traceable
12. **Link with build-rag-pipeline**: evaluation + RAG co-build
13. **Link with evaluate-llm-app**: evaluation + LLM co-build
14. **Link with llm-ops**: evaluation + LLMOps co-build
15. **Link with prompt-engineering**: evaluation + prompt co-build
16. **Link with A/B**: evaluation + experiment co-build
17. **Link with llm-provider**: evaluation + provider co-build
18. **Toolchain**: ragas / RAGAS / TruLens / DeepEval / Langfuse / Phoenix / Arize
19. **publicly queryable**: strategy everyone can look up; not hidden
20. **periodic review**: evolution updates; not one-shot
21. **first principles**: why must RAG evaluation; worst consequence of not doing it
22. **inversion thinking**: how much can manual evaluation solve; if solvable, don't introduce a heavy strategy
23. **second-order thinking**: second-order consequences after strategy (cost / complexity / effect / business)
24. **Occam**: RAG evaluation the simpler the better; cut redundant steps

## Related

- rag-pipeline: [../../engineer/projects/build-a-rag-pipeline.md](../../engineer/projects/build-a-rag-pipeline.md) — RAG co-build
- evaluate-llm-app: [../platform/evaluate-an-llm-app.md](../platform/evaluate-an-llm-app.md) — LLM co-build
- llm-ops: [./prepare-an-llm-ops-strategy.md](./prepare-an-llm-ops-strategy.md) — LLMOps co-build
- prompt-engineering: [./prepare-a-prompt-engineering-strategy.md](./prepare-a-prompt-engineering-strategy.md) — prompt co-build
- A/B: [../../engineer/processes/run-an-a-b-test.md](../../engineer/processes/run-an-a-b-test.md) — experiment co-build
- llm-provider: [../platform/pick-an-llm-provider.md](../platform/pick-an-llm-provider.md) — provider co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)

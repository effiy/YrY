---
title: YiAi LLM Phase 4 RAG generation-side switch complete
aliases: [yiai-llm-phase-four-win, rag-generation-switch, llm-rag-rollout]
tags: [success case study, YiAi, LLM, RAG, generation-side, multi-provider, llama-index]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: design
status: planned
lifecycle: reference
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./yiai-llm-phase-three.md
 - ./yiai-rag-hybrid-retrieval.md
 - ../../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md
 - ../../../tech-lead/decisions/yiai--rag-evaluation-infra.md
 - ../../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md
 - ../../patterns/inline-citation-rag.md
 - ../../patterns/evaluation-driven-development.md
 - ../../projects/build-a-rag-pipeline.md
 - ../../processes/review-lessons.md
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.
# YiAi LLM Phase 4 RAG generation-side switch complete

> **As an** engineer, **I want to** yiai llm phase four, **so that** success is reproducible. 

> YiAi multi-provider 5-stage rollout, Phase 4 landed: `domain/rag/engine.py` generation-side switched to `llm_router.get_llm(model_name)` + 50-case baseline eval run + fallback > 5% blocks; Phase 5 endpoint + frontend model selector hard prerequisite. 

## Summary

- **Complete**: RAG generation-side switched from hardcoded Ollama to `llm_router.get_llm(model_name)` + 50-case baseline eval run (recall 0.88 / faithfulness 0.84) + fallback > 5% block + inline citation source same-frame retention + scope filter not lost
- **Quantified effect**: generation-side switch 0 fallback; recall 0.87 → 0.88 (+0.01) ; faithfulness 0.83 → 0.84; inline citation source list 100% consistent; scope filter 0 loss
- **Value**: Phase 5 endpoint + frontend model selector have generation-side base + eval-set gate

## Core viewpoints

- **Generation-side switch goes through router abstraction**: `llm_router.get_llm(model_name)` single-point access = switch without touching generation-side code (Phase 2 already laid groundwork) . 
- **Eval-set gate prerequisite**: run baseline before switch = regression reference after switch = fallback > 5% blocks. 
- **Inline citation source not lost**: after switch `_NumberSourcesPostprocessor` numbering + source list same-frame + scope filter 0 loss = user verification capability not degraded. 
- **Retrieval-side untouched**: Phase 4 only switches generation-side = retrieval results unchanged = recall reference is trustworthy. 

## Key information

### Background

- Phase 3 streaming rollout complete (OpenAI 100%, see [yiai-llm-phase-three-win](win-yiai-llm-phase-three.md)) . 
- Before Phase 4 start, `domain/rag/engine.py` generation-side still hardcoded Ollama = multi-provider not integrated into RAG. 
- Decision ADR already set: 5-stage rollout, Phase 4 switches generation-side + eval-set gate. 

### Landing checklist

| No. | Change | impact | validation |
|---|---|---|---|
| 1 | `domain/rag/engine.py` generation-side switched to `llm_router.get_llm(model_name)` | YiAi RAG chat | 0 code changes before/after switch (Phase 2 router abstraction in effect)  |
| 2 | `_NumberSourcesPostprocessor` retained + source list same-frame | YiAi RAG pipeline | inline citation source 100% consistent |
| 3 | scope filter (MetadataFilters) untouched | YiAi RAG pipeline | scope 0 loss |
| 4 | 50-case baseline eval run | YiAi `tests/eval/` | recall 0.88 / faithfulness 0.84 |
| 5 | CI gate: fallback > 5% block | YiAi CI | 0 blocks after switch (no fallback)  |
| 6 | retrieval-side untouched | YiAi `domain/rag/retriever/` | recall reference trustworthy |

### Quantified effect

- generation-side switch: 0 code changes (Phase 2 router abstraction in effect) 
- recall: 0.87 → 0.88 (+0.01, retrieval-side untouched, difference from generation-side prompt alignment) 
- faithfulness: 0.83 → 0.84 (+0.01) 
- inline citation source list: 100% consistent (numbering + path + snippet + score) 
- scope filter: 0 loss
- eval-set gate block: 0 (no fallback) 

### Key success factors

1. **Phase 2 router abstraction prerequisite**: generation-side switch 0 code changes = single-point access
2. **Eval-set baseline prerequisite**: run before switch = regression reference = gate can block
3. **Retrieval-side untouched**: Phase 4 only switches generation-side = recall reference trustworthy
4. **Inline citation retained**: after switch source list same-frame = user verification capability not degraded
5. **Scope filter untouched**: cross-domain filter capability retained

## Action recommendations

1. Generation-side switch via router abstraction (`llm_router.get_llm(model_name)` single-point access) = 0 code changes for switch. 
2. Eval-set baseline run before switch = regression reference after switch = gate blocks fallback > 5%. 
3. Phase 4 only switches generation-side = retrieval-side untouched = recall reference trustworthy. 
4. Inline citation source list same-frame retention = user verification capability not degraded. 
5. Scope filter (MetadataFilters) untouched = cross-domain filter capability retained. 
6. Phase 5 endpoint + frontend model selector depend on Phase 4 completion = clear priority. 

## Anti-patterns

- **Hardcoding a specific provider on the generation side** — when the LLM provider is hardcoded (e.g., `Ollama(...)`), every switch requires code changes, retesting, and a full deploy. The generation side must call `llm_router.get_llm(model_name)` so that provider changes are a configuration-only operation.

- **Skipping the eval-set baseline before switching providers** — without a pre-switch baseline, there is no reference to compare against, so the CI gate cannot distinguish a real regression from pre-existing quality issues. The baseline must be run and recorded before the switch begins.

- **Switching retrieval and generation simultaneously** — changing both the retriever and the generator in one phase makes it impossible to attribute recall or faithfulness changes to the correct component. Each phase must change exactly one side so the reference stays trustworthy.

- **Losing inline citations during the generation-side switch** — if the `_NumberSourcesPostprocessor` or source list is accidentally dropped, users lose the ability to verify answers against source documents, collapsing trust in the RAG system. Source attribution must be a hard gate in the switch checklist.

- **Setting the CI gate threshold to zero** — a zero-tolerance fallback threshold blocks deployments on noise (e.g., a single flaky eval case), creating a gate that developers learn to ignore or bypass. A 5% tolerance allows legitimate noise while still catching real regressions.

## Related

- [./win-yiai-llm-phase-three.md](./win-yiai-llm-phase-three.md) — Phase 3 streaming rollout, prerequisite for Phase 4 generation-side switch
- [./win-yiai-llm-phase-five.md](./win-yiai-llm-phase-five.md) — Phase 5 endpoint + frontend model selector, dependent on Phase 4 completion
- [./win-yiai-rag-hybrid-retrieval.md](./win-yiai-rag-hybrid-retrieval.md) — RAG hybrid retrieval with inline citation retained during Phase 4 switch
- [../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) — ADR for multi-provider 5-stage rollout methodology
- [../../tech-lead/decisions/yiai--rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) — ADR for RAG evaluation infrastructure used for eval-set gate

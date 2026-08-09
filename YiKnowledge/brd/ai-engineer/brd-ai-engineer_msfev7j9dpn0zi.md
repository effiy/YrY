---
title: RAG Design Patterns
lifecycle: active
key: brd_brd-ai-engineer_msfev7j9dpn0zi
tags:
- ai
- rag
- design-patterns
model: Claude Opus 4.7 + bge-m3 + Milvus
task_type: rag
framework: llama_index
dataset: YiKnowledge 50 bilingual docs
eval_metric: ragas 4 metrics
status: accepted
owner: AI Engineer
kb_path: ai-engineer/methodology/rag-design-patterns.md
context: "RAG landing needs selection: multi-route recall (vector + BM25) / top-k / reranker / citation display / hallucination detection."
methodology: "5 major design patterns: multi-route recall + reranker + citation traceability + key-number traceability + hallucination detection."
baseline: single-route vector recall MRR 0.78; recall rate 75%
target: multi-route recall (vector + BM25) MRR 0.85; recall rate 85%; reranker +5pp; citation 100% traceable
risks: 1. multi-route recall cost — top-k tuning; 2. reranker latency — use in key scenarios; 3. citation drift — key-number traceability must run
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# RAG Design Patterns

**Model**: Claude Opus 4.7 + bge-m3 + Milvus | **Task Type**: rag | **Framework**: llama_index
**Dataset**: YiKnowledge 50 bilingual docs | **Eval Metric**: ragas 4 metrics | **Status**: accepted | **Owner**: AI Engineer
**KB Source**: ai-engineer/methodology/rag-design-patterns.md

## Context
RAG landing needs selection: multi-route recall (vector + BM25) / top-k / reranker / citation display / hallucination detection.

## Methodology
5 major design patterns: multi-route recall + reranker + citation traceability + key-number traceability + hallucination detection.

## Baseline → Target
- **Baseline**: single-route vector recall MRR 0.78; recall rate 75%
- **Target**: multi-route recall (vector + BM25) MRR 0.85; recall rate 85%; reranker +5pp; citation 100% traceable

## Risks & Mitigations
1. multi-route recall cost — top-k tuning; 2. reranker latency — use in key scenarios; 3. citation drift — key-number traceability must run

## References
- **KB Source**: `YiKnowledge/ai-engineer/methodology/rag-design-patterns.md`

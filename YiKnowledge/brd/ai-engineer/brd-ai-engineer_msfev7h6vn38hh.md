---
title: Vector database comparison — Milvus / Qdrant / Weaviate / pgvector
lifecycle: active
key: brd_brd-ai-engineer_msfev7h6vn38hh
tags:
- ai
- vector-db
- milvus
- qdrant
model: Milvus / Qdrant / Weaviate / pgvector
task_type: rag
framework: llama_index.vector_stores.*
dataset: internal-eval-2026-08
eval_metric: QPS / latency / recall / cost
status: reviewed
owner: AI Engineer
kb_path: ai-engineer/platform/vector-db-comparison.md
context: YiAi RAG needs a vector database. Milvus (distributed) vs Qdrant (lightweight) vs Weaviate (built-in multimodal) vs pgvector (Postgres extension).
methodology: "4-dimension comparison: QPS / P99 latency / recall / cost (monthly). 100K + 1M + 10M vectors in three tiers of stress testing."
baseline: Milvus QPS 8000 / 50ms / 98%; Qdrant 6000 / 30ms / 97%; Weaviate 5000 /
  60ms / 96%; pgvector 2000 / 100ms / 95%
target: YiAi picks Milvus (extensible + high QPS); small scale uses Qdrant; pgvector only for PoC
risks: 1. Milvus ops complexity — K8s operator + monitoring; 2. Qdrant extension ceiling — switching to Milvus cost; 3. pgvector
  performance bottleneck — not for production
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Vector database comparison — Milvus / Qdrant / Weaviate / pgvector

**Model**: Milvus / Qdrant / Weaviate / pgvector  |  **Task Type**: rag  |  **Framework**: llama_index.vector_stores.*
**Dataset**: internal-eval-2026-08  |  **Eval Metric**: QPS / latency / recall / cost  |  **Status**: reviewed  |  **Owner**: AI Engineer
**KB Source**: ai-engineer/platform/vector-db-comparison.md

## Context
YiAi RAG needs a vector database. Milvus (distributed) vs Qdrant (lightweight) vs Weaviate (built-in multimodal) vs pgvector (Postgres extension).

## Methodology
4-dimension comparison: QPS / P99 latency / recall / cost (monthly). 100K + 1M + 10M vectors in three tiers of stress testing.

## Baseline → Target
- **Baseline**: Milvus QPS 8000 / 50ms / 98%; Qdrant 6000 / 30ms / 97%; Weaviate 5000 / 60ms / 96%; pgvector 2000 / 100ms / 95%
- **Target**: YiAi picks Milvus (extensible + high QPS); small scale uses Qdrant; pgvector only for PoC

## Risks & Mitigations
1. Milvus ops complexity — K8s operator + monitoring; 2. Qdrant extension ceiling — switching to Milvus cost; 3. pgvector performance bottleneck — not for production

## References
- **KB Source**: `YiKnowledge/ai-engineer/platform/vector-db-comparison.md`

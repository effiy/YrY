---
title: Embedding Model Selection — bge-m3 vs OpenAI
lifecycle: active
key: brd_brd-ai-engineer_msfev7gmzcrlix
tags:
- ai
- embedding
- bge-m3
- openai
model: bge-m3 / OpenAI text-embedding-3-large
task_type: embedding
framework: llama_index.embeddings.*
dataset: MTEB-zh / internal 50 documentation
eval_metric: MRR / nDCG / recall
status: accepted
owner: AI Engineer
kb_path: ai-engineer/platform/embedding-model-selection.md
context: YiAi RAG retrieval needs an embedding model. bge-m3 (open source, self-hosted) vs OpenAI (closed source, API). Need to compare recall + cost +
  latency. 
methodology: MTEB-zh standard benchmark + internal 50 documentation bilingual eval set + 4 metrics (MRR / nDCG / recall /
  latency). 
baseline: bge-m3 MRR 0.78; OpenAI MRR 0.82; bge-m3 latency 80ms; OpenAI latency 200ms
target: YiAi default bge-m3 (self-hosted + low latency); key scenarios use OpenAI fallback (recall +4pp)
risks: 1. bge-m3 Chinese recall drift — quarterly eval; 2. OpenAI cost — prompt caching + key scenarios; 3. dual provider
  drift — contract test co-built
review_cycle: quarterly
tacit: false
related: []
---

# Embedding Model Selection — bge-m3 vs OpenAI

**Model**: bge-m3 / OpenAI text-embedding-3-large  |  **Task Type**: embedding  |  **Framework**: llama_index.embeddings.*
**Dataset**: MTEB-zh / internal 50 documentation  |  **Eval Metric**: MRR / nDCG / recall  |  **Status**: accepted  |  **Owner**: AI Engineer
**KB Source**: ai-engineer/platform/embedding-model-selection.md

## Context
YiAi RAG retrieval needs an embedding model. bge-m3 (open source, self-hosted) vs OpenAI (closed source, API). Need to compare recall + cost + latency. 

## Methodology
MTEB-zh standard benchmark + internal 50 documentation bilingual eval set + 4 metrics (MRR / nDCG / recall / latency). 

## Baseline → Target
- **Baseline**: bge-m3 MRR 0.78; OpenAI MRR 0.82; bge-m3 latency 80ms; OpenAI latency 200ms
- **Target**: YiAi default bge-m3 (self-hosted + low latency); key scenarios use OpenAI fallback (recall +4pp)

## Risks & Mitigations
1. bge-m3 Chinese recall drift — quarterly eval; 2. OpenAI cost — prompt caching + key scenarios; 3. dual provider drift — contract test co-built

## References
- **KB Source**: `YiKnowledge/ai-engineer/platform/embedding-model-selection.md`

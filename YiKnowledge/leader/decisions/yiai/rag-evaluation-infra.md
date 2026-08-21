---
title: "ADR: RAG Evaluation Infrastructure"
tags: [adr, yiai, rag, evaluation, quality]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-03
source: internal
type: decision
status: accepted
lifecycle: planned
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the RAG evaluation strategy using ragas metrics and bilingual eval sets"
acceptance_criteria:
  - "evaluation framework, metrics, and dataset requirements are defined"
related:
  - ./pytest-introduction.md
  - ../../../engineer/learn/projects/yiai/README.md
---

# ADR: RAG Evaluation Infrastructure

> **Status**: Accepted (2026-08-03) — planned, not yet implemented

## Context

The RAG module (built 2026-07-31) has no automated quality evaluation. Changes to chunking, embedding models, or retrieval strategies have unknown impact on answer quality. Without evaluation, RAG quality can silently regress.

## Decision

**Build RAG evaluation infrastructure on `llama-datasets` + `ragas` with 4 metrics and a 50-document bilingual eval set.**

### Metrics (4 ragas metrics)

| Metric | What it measures |
|--------|-----------------|
| `faithfulness` | Is the answer grounded in retrieved context? |
| `answer_relevancy` | Does the answer address the question? |
| `context_precision` | Are retrieved chunks relevant? |
| `context_recall` | Are all relevant chunks retrieved? |

### Eval dataset

- 50 documents from YiKnowledge (bilingual: zh + en)
- Each document paired with 3-5 questions and expected answers
- Covers all 7 role directories

### CI integration

- Run on every PR that touches `domain/rag/` or `services/rag/`
- **Recall regression > 5% blocks merge**
- Results archived for trend analysis

## Rationale

- `ragas` is the standard RAG evaluation framework
- 4 metrics cover the full retrieval→generation pipeline
- 5% recall threshold is conservative enough to avoid false blocks while catching real regressions

## Consequences

- Eval dataset must be maintained as knowledge base grows
- Adding new content to YiKnowledge may require updating eval questions
- RAG index rebuilds should trigger eval re-runs
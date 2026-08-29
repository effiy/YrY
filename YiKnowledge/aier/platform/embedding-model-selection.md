---
title: Embedding Model Selection Guide
aliases: [embedding-model-selection, embedding-comparison, text-embedding]
tags: [aier, platform, embedding, vector, rag, selection]
category: aier/platform
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier, engineer]
benefit: "Engineers choose the right embedding model for their RAG pipeline based on language support, dimension, latency, and cost"
acceptance_criteria:
  - "comparison of 5+ embedding models with key dimensions"
  - "decision tree for choosing based on language and scale"
  - "covers YiAi's current embedding setup"
related:
  - ./llm-comparison.md
  - ./vector-db-selection.md
  - ../foundations/rag-patterns.md
  - ../foundations/llm-fundamentals.md
---

# Embedding Model Selection Guide

> **When to use:** When setting up RAG, semantic search, or any feature that converts text to vectors. The embedding model determines retrieval quality.

## Key Dimensions

| Dimension | What to evaluate |
|---|---|
| **Language support** | Does it support Chinese? Multilingual? |
| **Dimension** | Vector size (384, 768, 1536, 3072) — higher = more expressive, slower |
| **Max input length** | Max tokens per embedding (512, 8192, etc.) |
| **Latency** | Time to embed a document/query |
| **Throughput** | Documents per second |
| **Deployment** | Local (Ollama, sentence-transformers) or API |

## Comparison

| Model | Dimensions | Max tokens | Chinese | Local | Best for |
|---|---|---|---|---|---|
| **BGE-M3** | 1024 | 8192 | Yes | Yes | Chinese RAG — best overall for YiAi |
| **BGE-Large-zh** | 1024 | 512 | Yes | Yes | Chinese-only, shorter texts |
| **text-embedding-3-small** | 512/1536 | 8191 | Yes | API only | Cost-effective multilingual |
| **text-embedding-3-large** | 256/1024/3072 | 8191 | Yes | API only | High-quality multilingual |
| **all-MiniLM-L6-v2** | 384 | 256 | No | Yes | English-only, fast, lightweight |
| **nomic-embed-text** | 768 | 8192 | Partial | Yes | Long documents, English |
| **mxbai-embed-large** | 1024 | 512 | No | Yes | English, high quality |

## Decision Tree

```
What language are your documents?
├─ Primarily Chinese → BGE-M3 (local) or text-embedding-3-small (API)
├─ Primarily English → nomic-embed-text (local) or text-embedding-3-large (API)
└─ Mixed (Chinese + English) → BGE-M3 (best multilingual local)

How long are your documents?
├─ < 512 tokens → BGE-Large-zh (Chinese) or all-MiniLM-L6-v2 (English)
├─ 512-8192 tokens → BGE-M3, nomic-embed-text, or text-embedding-3
└─ > 8192 tokens → Chunk first, then embed with any model

Self-hosted or API?
├─ Self-hosted → BGE-M3 (via Ollama or sentence-transformers)
└─ API → text-embedding-3-small (cost) or text-embedding-3-large (quality)
```

## YiAi's Current Setup

YiAi uses **BGE-M3** via `llama_index` with local embeddings:

```python
# YiAi/src/domain/rag/settings.py
from llama_index.embeddings.ollama import OllamaEmbedding

embed_model = OllamaEmbedding(
    model_name="bge-m3",
    base_url="http://localhost:11434",
)
```

### Why BGE-M3 for YiAi

1. **Chinese-first** — YiKnowledge is primarily Chinese content
2. **Multilingual** — handles English technical terms within Chinese documents
3. **Long context** — 8192 token limit handles long YiKnowledge files
4. **Local** — runs on Ollama; no API costs; data stays on-premise
5. **1024 dimensions** — good balance of expressiveness and storage cost

### Chunking Strategy

YiAi chunks documents at 1024 tokens with 200-token overlap:

```python
# YiAi config.yaml
rag:
  chunk_size: 1024
  chunk_overlap: 200
  embedding_model: "bge-m3"
```

## Performance Benchmarks

| Model | Docs/sec (local) | Query latency | Memory (1024d × 100K) |
|---|---|---|---|
| BGE-M3 | ~50 | ~15ms | ~400 MB |
| all-MiniLM-L6-v2 | ~200 | ~5ms | ~150 MB |
| nomic-embed-text | ~40 | ~20ms | ~300 MB |

## Migration Triggers

| Trigger | Recommendation |
|---|---|
| Retrieval quality is poor for Chinese | Switch to BGE-M3 (better Chinese support) |
| Embedding latency > 50ms | Switch to a smaller model or add GPU |
| Vector storage cost too high | Reduce dimensions (BGE-M3 supports Matryoshka) |
| Need better multilingual retrieval | Evaluate text-embedding-3-large via API |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Using an English-only model for Chinese documents | Embeddings don't capture Chinese semantics; retrieval is noise | Use BGE-M3 for Chinese; test retrieval on your actual documents |
| Same chunk size for all documents | Short FAQ entries and long technical docs need different strategies | Use smaller chunks (512) for short docs, larger (1024-2048) for long docs |
| Embedding without chunking | Documents exceed model's max token limit; truncated embeddings lose information | Chunk documents to fit within the model's max input length |
| Never re-evaluating embeddings | New models are released; your current model may be obsolete | Re-evaluate annually; test new models on your retrieval benchmark |
---
title: RAG Design Patterns
tags: [aier, rag, patterns, retrieval, llama-index]
category: aier/基础
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier, engineer]
benefit: "AI engineers understand RAG patterns and choose the right retrieval strategy for their use case"
related:
  - ../../方法/智能体架构模式.md
  - ../../../engineer/learn/projects/yiai/README.md
  - ../../../leader/decisions/yiai/rag-evaluation-infra.md
---

# RAG Design Patterns

> **RAG (Retrieval-Augmented Generation) grounds LLM responses in external knowledge.** The pattern choices below are based on YiAi's RAG module built on llama_index.

## Retrieval strategies

| Strategy | How it works | Best for | YiAi support |
|----------|-------------|----------|-------------|
| **Vector only** | Embed query → cosine similarity search | Simple Q&A over homogeneous docs | Yes (default) |
| **BM25 only** | Sparse keyword retrieval | Exact term matching, code search | Yes |
| **Hybrid (vector + BM25)** | Combine dense + sparse results via `QueryFusionRetriever` | Most use cases — best of both | Yes (recommended) |
| **Hybrid + rerank** | Hybrid retrieval + `LLMRerank` post-processing | High-precision Q&A | Yes |

## Chunking strategies

| Strategy | Chunk size | Overlap | Best for |
|----------|-----------|---------|---------|
| **Fixed-size** | 512-1024 tokens | 10-20% | General purpose |
| **Sentence-aware** | Sentence boundary | 1-2 sentences | Natural language docs |
| **Markdown-section** | Per `##` section | None | Structured docs (YiKnowledge) |

YiAi config: chunk_size and overlap configured in `config.yaml` under `rag:` section.

## Citation patterns

| Pattern | How it works | UX impact |
|---------|-------------|-----------|
| **Inline numbering** | `[1]`, `[2]` in answer text | Clear source attribution |
| **Source list** | List of sources after answer | Verifiability |
| **Score display** | Show relevance score per source | Transparency |

YiAi uses `_NumberSourcesPostprocessor` for inline citation numbering.

## Scope filtering

| Scope | How it works | Use case |
|-------|-------------|----------|
| **Per-file** | Index single file, query against it | "What does this specific doc say?" |
| **Folder-scoped** | Filter by `file_path` substring | "What do all engineering docs say about X?" |
| **Full KB** | Query entire index | "Find everything about Y" |

## Anti-patterns

- **Chunking without overlap.** Context at chunk boundaries is lost. Always use 10-20% overlap.
- **Relying on vector-only retrieval for exact match queries.** "Find error code ERR_422" needs BM25, not embeddings.
- **No reranking for high-precision use cases.** Hybrid retrieval gets candidates; reranking picks the best ones.
- **Embedding model mismatch.** The embedding model used for indexing must match the one used for querying. Changing the embedding model requires a full re-index.
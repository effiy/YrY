---
title: Embedding model selection
aliases:
- embedding model selection
- BGE
- Voyage
- OpenAI embedding
tags:
- AI platform
- Embedding
- selection
- RAG
category: ai-engineer/platform
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- ai-engineer
benefit: platform reliable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- vector-db-comparison.md
- llm-comparison.md
- ../methodology/rag-design-patterns.md
tacit: false
---

# Embedding model selection

> **As a** an ai engineer, **I want to** embedding model selection, **so that** platform reliable. 

> RAG / semantic search / clustering first step — compress text into dense vectors; quality directly determines the recall ceiling. 

## Summary
- Embedding model quality directly determines the recall ceiling; subsequent rerankers and hybrid retrieval can only fine-rank within the recall pool
- Chinese + cross-lingual prefers bge-m3 (open source + multilingual + long text 8k) 
- English + SaaS + quality first -> voyage-3 or OpenAI text-embedding-3-large
- 1024 dimensions is the sweet spot; higher dimensions improve recall but increase memory and slow retrieval
- Do not only look at MTEB; must run recall@k on business evaluation set

## Core viewpoints

**The embedding model is the ceiling of your RAG system -- no amount of reranking or hybrid retrieval can recover what the embedding model missed.** If the embedding model fails to encode a relevant document as similar to the query, that document will never appear in the retrieval results. Rerankers can only reorder the candidates that the embedding model returns. Chunking strategies can only split the documents that the embedding model will encode. The embedding model is the foundation, and every other retrieval optimization builds on top of it.

**MTEB scores are a ranking of embedding models on academic benchmarks, not a prediction of their performance on your data.** The correlation between MTEB rank and production recall is weak and task-dependent. A model that ranks 5th on MTEB may rank 1st on your specific document type and query distribution. The only reliable way to select an embedding model is to build a business evaluation set (50-200 query-document pairs from your actual data) and benchmark candidate models on it.

**The embedding model's context window is more important than its dimension count.** If your documents are 2000 tokens but the embedding model's context window is 512 tokens, the model is embedding only the first 25% of each document. The result is a systematic recall failure on any information that appears after the first 512 tokens. The embedding model's context window must exceed your chunk size, and ideally exceed it by a factor of 2x to handle documents that are denser than expected.

**Multilingual embedding is not "English embedding that also works on other languages" -- it is a fundamentally different model capability.** An English-only embedding model will map Chinese queries and Chinese documents to different regions of the vector space, making cross-lingual retrieval impossible. A multilingual embedding model (like bge-m3) maps semantically equivalent content across languages to nearby vectors. If your application serves users in multiple languages, you need a multilingual embedding model, not a monolingual model with translation.

**The cost of changing embedding models is the cost of rebuilding the entire vector index -- plan for this from day one.** Embedding models improve over time, and you will eventually want to upgrade. The upgrade process requires: re-embedding all documents with the new model, building a new vector index, running both old and new retrieval in parallel, and validating that the new model meets quality targets. This process takes days to weeks for large indexes. The architecture should support dual-track operation from the start.


- **Embedding is the determiner of RAG recall ceiling** — subsequent reranker can only fine-rank within the recall pool
- **bge-m3 is the Chinese + cross-lingual first choice** — open source, strong Chinese, 8k long text, 100+ languages
- **1024 dimensions is the sweet spot** — higher dimensions improve recall but increase memory and slow retrieval
- **MTEB does not equal business performance** — must run recall@k on business evaluation set before launch
- **Changing embedding version requires rebuilding the entire database** — must plan data migration and dual-track run period

## Key information

### Concept breakdown

RAG / semantic search / clustering / dedup / anomaly detection first step is all about compressing text into dense vectors. Embedding model quality directly determines the recall ceiling; subsequent rerankers and hybrid retrieval can only fine-rank within the recall pool. 

### Key parameters / formulas / data

#### Mainstream model comparison (2026 view) 

| Model | Vendor | Dimensions | Open source | Chinese | Long text | MTEB avg |
|---|---|---|---|---|---|---|
| OpenAI text-embedding-3-large | OpenAI | 3072 (reducible) | No | average | 8k | 64.6 |
| OpenAI text-embedding-3-small | OpenAI | 1536 | No | average | 8k | 62.3 |
| Cohere embed-v3 | Cohere | 1024 | No | average | 512 | 64.5 |
| BAAI bge-m3 | Zhipuyuan | 1024 | Yes | strong | 8k (multilingual) | 65.0 |
| BAAI bge-large-zh-v1.5 | Zhipuyuan | 1024 | Yes | strong | 512 | Chinese 64+ |
| Alibaba GTE-large | Alibaba | 1024 | Yes | strong | 512 | 63.1 |
| nomic-embed-text | Nomic | 768 | Yes | weak | 8k | 62.3 |
| Voyage AI voyage-3 | Voyage | 1024 | No | strong | 32k | 66+ |
| jina-embeddings-v3 | Jina | 1024 | Yes | strong | 8k | 65.4 |

> MTEB scores are for reference only; correlation with business data is strong; must run recall rate on business evaluation set before launch. 

#### Selection decision dimensions

| Dimension | Key considerations |
|---|---|
| Chinese/English ratio | Chinese-major -> bge-m3 / GTE / jina; English-major -> OpenAI / Voyage |
| Context length | Long-doc RAG choose 8k+ (bge-m3, jina-v3, voyage-3) |
| Dimension size | Higher dims better recall but more memory and slower retrieval; 1024 is the sweet spot |
| Deployment | Self-deploy choose open source; SaaS choose OpenAI / Cohere / Voyage |
| Cost | SaaS charges per token; self-deploy by memory and throughput |
| Multilingual | bge-m3 supports 100+ languages, first choice for cross-lingual RAG |
| Instruction adaptation | Some models support task instruction prefix (e.g. jina-v3, bge-instruct) |

#### Selection decision tree

```
Chinese + cross-lingual?
├─ Yes -> bge-m3 (open source + multilingual + long text)
└─ No  -> Can use SaaS / cost sensitive?
        ├─ SaaS OK, quality first -> voyage-3 or OpenAI 3-large
        └─ Self-deploy preferred
           ├─ Chinese-major -> bge-large-zh-v1.5
           └─ English-major -> nomic-embed-text / bge-m3-en
```

#### Deployment and ops points

| Dimension | Recommendation |
|---|---|
| Batch inference | batch size 128-512, throughput an order of magnitude higher than LLM |
| Cache | Multiple embeddings of same text is waste; use Redis / local cache hash(text)->vector |
| Normalization | L2 normalize before storage; dot product equals cosine; faster retrieval |
| Quantization | 1024 float -> 1 byte, memory 1/4, recall loss <2% (Qdrant / Milvus built-in support) |
| Version management | embedding model version change requires full database rebuild; plan data migration and dual-track run period |
| Monitoring | embedding duration p99, empty recall rate (nearest neighbor score exceptionally low -> model not covering this domain) |

### Applicable scenarios
- RAG recall (semantic search) 
- Clustering / dedup / anomaly detection
- Cross-lingual search
- This team: YiAi knowledge search uses bge-m3 (Chinese + multilingual, open source self-deployed); SaaS backup voyage-3 (under evaluation, more stable recall for long-doc BRD); evaluation set 100 business query-doc pairs, monthly regression

## Action recommendations
1. Chinese + cross-lingual -> bge-m3 (open source + multilingual + 8k long text) 
2. English + SaaS + quality first -> voyage-3 or OpenAI text-embedding-3-large
3. Do not only look at MTEB; build business evaluation set: 50-200 manually labeled query-doc positive pairs + easy-to-confuse distractors
4. Run recall@k (k=1/5/10) and MRR, horizontally compare 3-5 candidate embeddings
5. A/B launch: pick top-2 models, observe real-query CTR / user feedback online
6. Batch inference batch size 128-512, throughput an order of magnitude higher than LLM
7. L2 normalize before storage; dot product equals cosine; faster retrieval
8. Plan data migration and dual-track run period for embedding upgrades

## Anti-patterns

**Selecting an embedding model based on MTEB scores without running a business evaluation set.** MTEB is a general-purpose benchmark that may not correlate with your specific retrieval task. The minimum viable evaluation is: 50-200 manually labeled query-document pairs from your production data, evaluated across 3-5 candidate embedding models, measuring recall@k (k=1, 5, 10) and MRR. The model with the highest MTEB score is not necessarily the model with the best recall on your data.

**Using the same embedding model for queries and documents without instruction prefixes.** Many modern embedding models (bge-m3, jina-v3, voyage-3) support task-specific instruction prefixes (e.g., "Represent this query for retrieval" vs "Represent this document for retrieval"). Without these prefixes, the model encodes queries and documents in the same way, which works for symmetric tasks (similarity comparison) but degrades performance on asymmetric tasks (query-document retrieval). Use instruction prefixes when the model supports them.

**Increasing embedding dimensions to improve recall without measuring the actual improvement.** Higher dimensions improve recall in theory but the improvement diminishes rapidly. The jump from 768 to 1024 typically improves recall by 1-2%, while the jump from 1024 to 3072 improves recall by less than 1% but triples memory and retrieval cost. Always measure the recall improvement at each dimension level before committing to a higher dimension.

**Embedding documents without L2 normalization when using cosine similarity for retrieval.** Unnormalized vectors have different magnitudes, which means cosine similarity and dot product are not equivalent. Normalizing all vectors to unit length (L2 norm = 1) makes dot product equivalent to cosine similarity, which is faster to compute. Most vector databases expect normalized vectors for optimal performance.

**Not caching repeated embeddings of the same text.** Common queries, system prompts, and frequently accessed documents should be embedded once and cached. Re-embedding the same text for every request wastes compute and adds latency. The caching key should be the hash of the text (not the text itself, to avoid storing sensitive data in the cache), and the cache should have a TTL aligned with the expected text change frequency.


- **Selecting model by MTEB score only** — strongly correlated with business relevance; must run business evaluation set
- **Higher dimensions the better** — memory and retrieval cost grow linearly; 1024 is the sweet spot
- **No normalization** — cosine retrieval is slow; after L2 normalization dot product is equivalent
- **Changing embedding model version without rebuilding index** — old and new vector spaces inconsistent; recall quality collapses
- **Not caching repeated embeddings** — multiple inferences of same text is waste
- **Not monitoring empty recall rate** — nearest neighbor score exceptionally low means model not covering this domain; need to add data or change model

## Related
- Same category: [vector-db-comparison-summary.md](./vector-db-comparison.md), [llm-comparison-summary.md](./llm-comparison.md)
- Upstream: [../foundations/transformer-architecture.md](../foundations/transformer-architecture.md) (base) 
- Downstream: [../methodology/rag-design-patterns.md](../methodology/rag-design-patterns.md)

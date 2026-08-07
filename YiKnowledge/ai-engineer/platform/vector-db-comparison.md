---
title: Vector database comparison (Qdrant / Milvus / pgvector / Weaviate)
aliases:
- vector database comparison
- Qdrant
- Milvus
- pgvector
- Weaviate
tags:
- AI platform
- vector database
- RAG
- comparison
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
- embedding-model-selection.md
- ../methodology/rag-design-patterns.md
- ../../engineer/projects/yiai/README.md
tacit: false
---

# Vector database comparison (Qdrant / Milvus / pgvector / Weaviate)

> **As an** ai engineer, **I want to** vector db comparison, **so that** platform reliable.

> Comparison of vector nearest-neighbor retrieval schemes for RAG / semantic search / recommendation recall.

## Summary
- Two categories of solutions: purpose-built vector databases (Qdrant / Milvus / Weaviate / Chroma) + relational database vector extensions (pgvector / Redis Vector)
- Core algorithms: HNSW (graph structure, fast query, large memory), IVF-PQ/SQ (clustering + compression), Flat (brute-force exact, small datasets)
- pgvector fastest to start (already have PG + data < 1M)
- Milvus suited for 100M+ scale (cloud-native distributed by design)
- Qdrant single-machine deploy, Rust single binary, lightweight low-ops
- Qdrant / Weaviate have built-in sparse-dense hybrid retrieval, no external ES needed

## Core viewpoints

**The vector database is the least important component of a RAG pipeline -- embedding quality and chunking strategy matter far more.** A mediocre vector database with a good embedding model and chunking strategy will outperform a state-of-the-art vector database with poor embeddings and naive chunking. The vector database is a storage and retrieval engine; it does not improve the quality of the vectors it stores. Invest your optimization effort in embedding model selection, chunking strategy, and reranking -- not in vector database tuning.

**pgvector is the right answer for 80% of teams because it eliminates the operational overhead of a separate database system.** The cost of a dedicated vector database is not the license fee or the compute -- it is the operational complexity: another system to deploy, monitor, back up, upgrade, and debug. pgvector runs inside the PostgreSQL instance you already have, which means you inherit all the operational investment you have already made in PostgreSQL. The performance gap between pgvector and purpose-built vector databases is real but irrelevant for most teams: if you have fewer than 1M vectors, the difference is measured in milliseconds, not user-perceptible latency.

**Hybrid retrieval (dense + sparse) is not optional -- it is the minimum viable retrieval strategy for any production RAG system.** Pure vector search fails on exact keyword matches, abbreviations, product codes, and named entities. Pure BM25 fails on semantic similarity, paraphrases, and conceptual queries. Hybrid retrieval combines both, and the quality improvement over either approach alone is typically 10-30% on recall@k. The question is not whether to use hybrid retrieval, but whether to implement it inside the vector database (Qdrant, Weaviate) or with an external search engine (Elasticsearch + vector database).

**The HNSW parameter defaults are optimized for benchmark performance, not for your specific recall-memory-latency tradeoff.** The default M=16, ef_construction=200, ef_search=50 values are reasonable starting points but should be tuned for your specific workload. Higher M and ef_construction values improve recall at the cost of memory and index build time. The tuning process should be: define your recall target (e.g., recall@10 > 0.95), find the minimum HNSW parameters that achieve it, and monitor memory and latency as the index grows.

**Vector database benchmarking is dominated by the "1M vectors at 1024 dimensions" scenario, which does not reflect production workloads.** Production workloads have: variable vector counts (from 10K to 1B), variable dimensions (from 384 to 3072), concurrent reads and writes, metadata filtering, and hybrid retrieval. A database that performs well on the standard benchmark may perform poorly on your specific workload profile. Always benchmark on a workload that matches your production characteristics: vector count, dimension, query pattern, filter complexity, and concurrency.


- **pgvector suits small-scale, already-on-PG scenarios** — same DB as business data, native transaction/ACID support
- **Milvus is the only choice for 100M+ scale** — cloud-native distributed by design
- **Qdrant is the lightweight single-machine first choice** — Rust single binary, low resource footprint, low ops cost
- **Built-in hybrid retrieval saves an ES** — Qdrant and Weaviate have built-in sparse-dense hybrid
- **Embedding upgrades require rebuilding the full index** — must plan data migration and dual-track run period

## Key information

### Concept breakdown

RAG, semantic search, recommendation recall all need "nearest-neighbor retrieval by vector". Common solutions fall into two categories:

- **Purpose-built vector DBs**: Qdrant, Milvus, Weaviate, Chroma
- **Relational DB + vector extension**: pgvector (PostgreSQL), Redis Vector

Core algorithms:
- **HNSW**: graph structure, fast query, large memory
- **IVF-PQ/SQ**: clustering + compression, lower memory, slightly slower query
- **Flat**: brute-force exact, for small datasets

### Key parameters / formulas / data

#### Dimension comparison

| Dimension | Qdrant | Milvus | pgvector | Weaviate |
|---|---|---|---|---|
| Implementation language | Rust | Go | C (PG extension) | Go |
| Deploy complexity | Low (single-file binary) | Medium (depends on etcd, minio, pulsar/kafka) | Very low (PG + extension) | Medium |
| Index algorithm | HNSW + quantization | HNSW, IVF, DiskANN, GPU index | HNSW + IVF | HNSW |
| Metadata filter | Strong (payload filter + field index) | Strong (scalar fields, partitioning) | SQL (native advantage) | Strong (GraphQL style) |
| Hybrid retrieval | Built-in sparse-dense + hybrid score fusion | Built-in BM25 + dense | Use ts_vector + ANN | Built-in hybrid |
| Distributed | Rust + Raft, native distributed | Cloud-native distributed | Citus / read replicas | Native distributed |
| Scale ceiling | Tens of millions single-node, 100M+ cluster | Billions (design goal) | Millions (recommended ceiling) | Tens of millions |
| Engineering barrier | Low | High | Very low (already have PG) | Medium |
| Ecosystem | OpenAI server protocol, full SDK | Full SDK | SQL ecosystem | GraphQL + REST |
| Transactions/ACID | No | No | Yes (PG native) | No |

#### Selection decision tree

```
Already have PostgreSQL and < 1M vectors?
└─ Yes -> pgvector (fastest start, same DB as business data)

Need 100M+ scale?
└─ Yes -> Milvus (cloud-native distributed by design)

Want hybrid retrieval (dense + sparse/BM25) without external ES?
└─ Yes -> Qdrant or Weaviate (built-in hybrid)

Want lightweight single-machine + low ops cost?
└─ Yes -> Qdrant (Rust single binary, low resource footprint)
```

#### Performance reference

Test set: 1M 1024-dim vectors, top-10 retrieval, recall@10 > 0.95

| Engine | Single query p99 latency | Memory footprint | Index build time |
|---|---|---|---|
| Qdrant HNSW | 2-5 ms | ~6 GB | ~10 min |
| Milvus HNSW | 3-8 ms | ~7 GB | ~12 min |
| pgvector HNSW | 5-15 ms | ~8 GB | ~15 min |
| Weaviate HNSW | 3-8 ms | ~7 GB | ~12 min |

> Values depend on hardware and config; pgvector at small scale (<100k) is nearly on par with purpose-built DBs.

#### HNSW parameters

| Parameter | Meaning | Recommended range |
|---|---|---|
| M | Graph degree | 16-64, higher = more memory but better recall |
| ef_construction | Build depth | 200-500 |
| ef_search | Query depth | 50-200 |

### Applicable scenarios
- Small scale, already have PG -> pgvector (fastest start)
- 100M+ scale -> Milvus
- Hybrid retrieval, no external ES -> Qdrant or Weaviate
- Lightweight single-machine + low ops -> Qdrant
- This team: YiAi knowledge retrieval uses Qdrant (single-machine deploy, single file easy to maintain); pgvector for team-internal small-scale RAG experiments (PG already present); not adopting Milvus (heavy ops) or Weaviate (unfamiliar GraphQL ecosystem)

## Action recommendations
1. Already have PG and data < 1M -> pgvector, same DB as business data
2. 100M+ scale -> Milvus, accept ops complexity
3. Lightweight single-machine + Rust single binary -> Qdrant
4. Use scalar quantization in Qdrant / Milvus to convert 1024 float -> 1 byte, memory down to 1/4, recall loss < 2%
5. Use pre-filter for high-selectivity filters, post-filter when recall-sensitive
6. Monitor recall@k, p99 query latency, write rate, memory utilization
7. Embedding upgrades: plan data migration + dual-track run period; changing models requires rebuilding the full index

## Anti-patterns

**Choosing a vector database before defining the retrieval requirements.** The vector database decision should be the last step in the retrieval architecture, not the first. First define: the expected vector count and growth rate, the query patterns (pure vector, hybrid, filtered), the latency requirements, the recall requirements, and the operational constraints (existing infrastructure, team expertise). Only then evaluate vector databases against these requirements. Choosing a database first and then adapting the requirements to fit the database is backwards.

**Running Milvus for a dataset under 10M vectors.** Milvus's distributed architecture is designed for 100M+ scale. Below 10M vectors, the operational complexity of managing etcd, MinIO, and Pulsar/Kafka outweighs any performance benefit. pgvector or Qdrant will handle 10M vectors with a fraction of the operational overhead. The Milvus break-even point is around 50M-100M vectors, where the distributed architecture becomes necessary.

**Using the default HNSW parameters without tuning for your specific recall and memory requirements.** The default parameters are a one-size-fits-all compromise that fits no one's actual workload. The tuning process is straightforward: set your recall target, run a parameter sweep on a representative dataset, and select the parameters that achieve the target with the minimum memory footprint. This one-time investment pays for itself in reduced memory costs and improved recall.

**Rebuilding the entire vector index without a dual-track run period when changing embedding models.** When you change the embedding model, the new vectors exist in a different vector space from the old vectors. Querying the old index with new vectors (or vice versa) produces meaningless results. The safe migration path is: build the new index in parallel, run both old and new retrieval in production, validate that the new retrieval meets quality targets, and only then switch traffic. The dual-track period should be at least one full evaluation cycle.

**Ignoring metadata filtering performance when selecting a vector database.** Most production RAG queries involve metadata filters (date range, document type, author, department). The vector database's metadata filtering performance can dominate the query latency. Pre-filtering (filter first, then vector search) is faster for high-selectivity filters but can miss results. Post-filtering (vector search first, then filter) is comprehensive but slower. The database must support both, and the choice depends on the filter selectivity.


- **Million-scale data forced onto Milvus** — ops complexity not worth it; pgvector or Qdrant is enough
- **Small scale using a Qdrant cluster** — single machine is enough; cluster only adds ops
- **HNSW parameters all defaults** — recall/memory tradeoff should tune M / ef_construction / ef_search per business
- **No quantization** — wastes 4x memory; Qdrant / Milvus built-in scalar quantization has <2% recall loss
- **Embedding upgrade without rebuilding index** — old/new vector spaces inconsistent; recall quality collapses
- **Not monitoring recall@k** — recall drop unnoticed; impacts downstream RAG

## Related
- Same category: [embedding-model-selection-summary.md](./embedding-model-selection.md)
- Upstream: [../foundations/transformer-architecture.md](../foundations/transformer-architecture.md) (embedding model backbone)
- Downstream: [../methodology/rag-design-patterns.md](../methodology/rag-design-patterns.md), [../../engineer/projects/yiai/README.md](../../engineer/projects/yiai/README.md)

---
title: vector database health dashboard
aliases:
- vector DB health dashboard
- embedding store dashboard
- vector search dashboard
- vector index dashboard
tags:
- dashboard
- vector-database
- embeddings
- vector-search
- pinecone
- weaviate
- qdrant
- milvus
category: ai-engineer/platform
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- ai-engineer
- engineer
- tech-lead
benefit: vector database performance, index health, and embedding quality visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- index performance, query latency, recall, embedding quality, storage efficiency, and scaling health defined
related:
- ./dashboard-ai-performance.md
- ./dashboard-llm-cost.md
- ../methodology/dashboard-rag-quality.md
- ../data/dashboard-data-quality.md
- ../../engineer/infrastructure/dashboard-database-performance.md
tacit: false
---

# vector database health dashboard

> **As an** AI engineer, **I want to** track vector database performance and embedding quality, **so that** every vector search is fast, accurate, and cost-efficient, indexes are healthy, embedding drift is detected early, and the vector store scales with growing data — powering RAG, semantic search, and recommendation systems reliably.

> Vector databases are the memory of AI applications. This dashboard tracks index performance, query latency, recall quality, embedding health, storage efficiency, and scaling — turning vector search from a "hope the results are good" black box into a continuously measured, optimized, and trustworthy retrieval system.

## Summary

- 6 vector DB dimensions: index performance, query latency, recall quality, embedding health, storage efficiency, scaling health
- 8 vector database collections across 3 use cases: RAG (4), semantic search (2), recommendations (2); 185M vectors total; 4,096 dimensions avg
- Index performance: 850 QPS avg, 2,200 QPS peak; 92% index build completion within SLA; 8% index rebuild failures; 3 full re-indexes/month
- Query latency: 45ms P50, 120ms P95, 350ms P99; 5% of queries exceed 200ms SLA; 2% timeout rate (30s threshold)
- Recall quality: recall@10 = 0.88 (target 0.92); precision@10 = 0.82; 6% of queries return < 0.5 relevance; embedding drift score: 0.12
- Storage: 185M vectors, 8.2 TB total; 35% storage utilization; $0.85/1M vectors/month; 15% stale vectors (not updated > 90 days)
- Dashboard reviewed weekly; vector index optimization sprint monthly with AI engineering

## Core viewpoints

- Vector search is only as good as the embeddings — if your embedding model is producing vectors that don't capture semantic similarity, no amount of index tuning will fix it; embedding quality is the foundation, everything else is optimization
- Recall is a tradeoff, not a target — you can always get higher recall by returning more results, but that costs more in latency, tokens, and compute; the question is what recall level is "good enough" for your use case
- Vector indexes decay — as you add, update, and delete vectors, the index structure degrades; an HNSW graph that was optimal 3 months ago may have dead ends and disconnected components today; regular re-indexing is maintenance, not a bug
- Embedding drift is silent and deadly — when your embedding model is updated, fine-tuned, or when the data distribution shifts, your old vectors become semantically misaligned with new queries; detect drift before it affects users

## Key information

### 6-panel vector DB overview

```
┌──────────────────────────────────────────────────────────────────┐
│  INDEX PERFORMANCE                  │  QUERY LATENCY                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Collections: 8          │   │  │  P50 latency: 45ms       │   │
│  │  Total vectors: 185M     │   │  │  P95 latency: 120ms       │   │
│  │  QPS avg: 850, peak: 2.2K│   │  │  P99 latency: 350ms       │   │
│  │  Index build SLA: 92%    │   │  │  > 200ms SLA: 5%          │   │
│  │  Rebuild failures: 8%    │   │  │  Timeout rate: 2%         │   │
│  │  Full re-index: 3/mo     │   │  │  Query volume: 850 QPS    │   │
│  │  Index score: B (78)     │   │  │  Latency score: B+ (82)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RECALL QUALITY                     │  EMBEDDING HEALTH                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Recall@10: 0.88         │   │  │  Model: text-embed-3-lg  │   │
│  │  Precision@10: 0.82      │   │  │  Dimensions: 4,096 avg    │   │
│  │  MRR: 0.85               │   │  │  Drift score: 0.12        │   │
│  │  NDCG@10: 0.78           │   │  │  Embedding staleness: 15% │   │
│  │  < 0.5 relevance: 6%     │   │  │  Re-embed cadence: 30d    │   │
│  │  Ground truth coverage:  │   │  │  Model version: 3.2       │   │
│  │  42% of queries have eval │   │  │  Embedding score: B (78) │   │
│  │  Recall score: B (80)    │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  STORAGE EFFICIENCY                 │  SCALING HEALTH                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total vectors: 185M     │   │  │  Pods: 12 (3 per col)    │   │
│  │  Storage: 8.2 TB         │   │  │  CPU util: 58% avg       │   │
│  │  Utilization: 35%        │   │  │  Memory util: 72% avg    │   │
│  │  Cost: $0.85/1M vectors  │   │  │  Disk IOPS: 65% of limit │   │
│  │  Stale vectors: 15% (28M)│   │  │  Growth rate: 12%/mo     │   │
│  │  Compression ratio: 4.2× │   │  │  Shard balance: 92%      │   │
│  │  Storage score: B- (72)  │   │  │  Scaling score: B (78)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Collection health

| Collection | Use case | Vectors | Dimensions | Index type | QPS | P50 latency | P95 latency | Health |
|---|---|---|---|---|---|---|---|---|
| **knowledge_base** | RAG | 52M | 4,096 | HNSW | 320 | 38ms | 95ms | B+ (82) |
| **code_chunks** | RAG | 38M | 3,072 | HNSW | 180 | 42ms | 110ms | B (78) |
| **product_docs** | RAG | 28M | 4,096 | HNSW | 150 | 45ms | 120ms | B (78) |
| **conversation_history** | RAG | 12M | 2,048 | IVF+PQ | 85 | 55ms | 150ms | B- (72) |
| **semantic_search_prod** | Semantic search | 25M | 3,072 | HNSW | 220 | 35ms | 85ms | B+ (85) |
| **semantic_search_archive** | Semantic search | 15M | 3,072 | DiskANN | 30 | 85ms | 250ms | C+ (68) |
| **recs_user_embeddings** | Recommendations | 10M | 2,048 | HNSW | 120 | 28ms | 65ms | A- (88) |
| **recs_item_embeddings** | Recommendations | 5M | 1,536 | HNSW | 80 | 22ms | 55ms | A (92) |
| **Overall** | | **185M** | | | **1,185** | **45ms** | **120ms** | **B+ (82)** |

### Query latency by collection and operation

| Collection | Search P50 | Search P95 | Insert P50 | Update P50 | Delete P50 | Filter P50 | Batch (100) |
|---|---|---|---|---|---|---|---|
| **knowledge_base** | 38ms | 95ms | 12ms | 18ms | 8ms | 42ms | 280ms |
| **code_chunks** | 42ms | 110ms | 15ms | 22ms | 10ms | 48ms | 320ms |
| **product_docs** | 45ms | 120ms | 14ms | 20ms | 9ms | 50ms | 310ms |
| **conversation_history** | 55ms | 150ms | 18ms | 25ms | 12ms | 60ms | 380ms |
| **semantic_search_prod** | 35ms | 85ms | 10ms | 16ms | 7ms | 38ms | 250ms |
| **semantic_search_archive** | 85ms | 250ms | 22ms | 30ms | 15ms | 90ms | 520ms |
| **recs_user_embeddings** | 28ms | 65ms | 8ms | 12ms | 5ms | 32ms | 200ms |
| **recs_item_embeddings** | 22ms | 55ms | 7ms | 10ms | 4ms | 28ms | 180ms |

### Recall quality by collection

| Collection | Recall@5 | Recall@10 | Recall@20 | Precision@10 | MRR | NDCG@10 | < 0.5 relevance | Eval queries |
|---|---|---|---|---|---|---|---|---|
| **knowledge_base** | 0.82 | 0.88 | 0.92 | 0.82 | 0.85 | 0.78 | 6% | 12,500 |
| **code_chunks** | 0.78 | 0.85 | 0.90 | 0.80 | 0.82 | 0.75 | 8% | 8,200 |
| **product_docs** | 0.80 | 0.86 | 0.91 | 0.81 | 0.84 | 0.77 | 7% | 6,800 |
| **conversation_history** | 0.72 | 0.80 | 0.87 | 0.75 | 0.76 | 0.70 | 12% | 3,500 |
| **semantic_search_prod** | 0.84 | 0.90 | 0.94 | 0.85 | 0.88 | 0.82 | 4% | 15,000 |
| **semantic_search_archive** | 0.75 | 0.82 | 0.88 | 0.78 | 0.79 | 0.72 | 10% | 2,800 |
| **recs_user_embeddings** | 0.88 | 0.92 | 0.95 | 0.87 | 0.90 | 0.85 | 3% | 5,200 |
| **recs_item_embeddings** | 0.90 | 0.94 | 0.97 | 0.89 | 0.92 | 0.88 | 2% | 4,500 |

### Embedding drift by collection

| Collection | Model version | Last re-embedded | Drift score | Stale vectors (> 90d) | Re-embed priority | Notes |
|---|---|---|---|---|---|---|
| **knowledge_base** | text-embed-3-large (v3.2) | 2026-07-15 | 0.08 | 8% (4.2M) | Low | Model v3.1→v3.2 drift was minor |
| **code_chunks** | code-embed-v2 (v2.1) | 2026-06-20 | 0.15 | 18% (6.8M) | Medium | Code embedding model updated, moderate drift |
| **product_docs** | text-embed-3-large (v3.2) | 2026-07-10 | 0.10 | 12% (3.4M) | Low | Regular re-embed cadence maintained |
| **conversation_history** | text-embed-3-small (v3.2) | 2026-05-15 | 0.22 | 28% (3.4M) | High | Small model updated, significant drift |
| **semantic_search_prod** | text-embed-3-large (v3.2) | 2026-07-28 | 0.05 | 5% (1.3M) | Low | Recently re-embedded, fresh |
| **semantic_search_archive** | text-embed-3-large (v3.0) | 2026-02-10 | 0.35 | 42% (6.3M) | Critical | 2 model versions behind, severe drift |
| **recs_user_embeddings** | custom-recs-v1 | 2026-07-25 | 0.06 | 8% (0.8M) | Low | Fresh embeddings, updated weekly |
| **recs_item_embeddings** | custom-recs-v1 | 2026-07-30 | 0.04 | 3% (0.2M) | Low | Fresh embeddings, updated daily |

### Index health

| Collection | Index type | Build time | Last rebuild | Index size | Memory usage | Fragmentation | Dead vectors |
|---|---|---|---|---|---|---|---|
| **knowledge_base** | HNSW (M=16, efC=200) | 4.5 hours | 2026-07-15 | 850 GB | 72 GB | 8% | 2.5% |
| **code_chunks** | HNSW (M=16, efC=200) | 3.2 hours | 2026-07-20 | 520 GB | 48 GB | 12% | 3.8% |
| **product_docs** | HNSW (M=16, efC=200) | 2.8 hours | 2026-07-12 | 420 GB | 38 GB | 10% | 3.2% |
| **conversation_history** | IVF+PQ (nlist=4096) | 1.5 hours | 2026-06-28 | 180 GB | 22 GB | 18% | 5.5% |
| **semantic_search_prod** | HNSW (M=24, efC=300) | 2.5 hours | 2026-07-28 | 380 GB | 35 GB | 5% | 1.8% |
| **semantic_search_archive** | DiskANN | 6.5 hours | 2026-03-15 | 250 GB | 12 GB | 25% | 8.2% |
| **recs_user_embeddings** | HNSW (M=16, efC=150) | 1.0 hours | 2026-07-25 | 120 GB | 15 GB | 6% | 2.0% |
| **recs_item_embeddings** | HNSW (M=12, efC=100) | 0.5 hours | 2026-07-30 | 60 GB | 8 GB | 4% | 1.2% |

### Storage efficiency

| Collection | Vectors | Dimensions | Raw size | Compressed size | Compression ratio | Cost/month | Cost/1M vectors | Stale cost |
|---|---|---|---|---|---|---|---|---|
| **knowledge_base** | 52M | 4,096 | 3.4 TB | 850 GB | 4.1× | $6,800 | $131 | $544 (8% stale) |
| **code_chunks** | 38M | 3,072 | 1.9 TB | 520 GB | 3.7× | $4,160 | $109 | $749 (18% stale) |
| **product_docs** | 28M | 4,096 | 1.8 TB | 420 GB | 4.4× | $3,360 | $120 | $403 (12% stale) |
| **conversation_history** | 12M | 2,048 | 400 GB | 180 GB | 2.2× | $1,620 | $135 | $454 (28% stale) |
| **semantic_search_prod** | 25M | 3,072 | 1.2 TB | 380 GB | 3.2× | $3,040 | $122 | $152 (5% stale) |
| **semantic_search_archive** | 15M | 3,072 | 750 GB | 250 GB | 3.0× | $2,000 | $133 | $840 (42% stale) |
| **recs_user_embeddings** | 10M | 2,048 | 330 GB | 120 GB | 2.8× | $960 | $96 | $77 (8% stale) |
| **recs_item_embeddings** | 5M | 1,536 | 120 GB | 60 GB | 2.0× | $480 | $96 | $14 (3% stale) |

### Query pattern analysis

| Query pattern | % of queries | Avg k | Avg filter fields | Avg latency | Cache hit rate | Optimization |
|---|---|---|---|---|---|---|
| **Simple similarity search** | 45% | 10 | 0 | 32ms | 28% | Increase cache, pre-compute popular |
| **Filtered search** (metadata) | 30% | 10 | 2.5 | 55ms | 12% | Add metadata indexes |
| **Hybrid search** (keyword + vector) | 15% | 20 | 1.8 | 85ms | 8% | Optimize fusion algorithm |
| **Batch search** (multiple queries) | 7% | 10 | 1.2 | 280ms | 5% | Parallelize, increase batch size |
| **Range search** (distance threshold) | 3% | varies | 0.5 | 120ms | 2% | Pre-filter with approximate index |

### Query errors and failures

| Error type | Rate | Occurrences/day | Root cause | Action |
|---|---|---|---|---|
| **Timeout** (> 30s) | 2.0% | 14,800 | Complex filtered queries, large result sets | Add query timeout per collection, optimize filters |
| **Empty results** (no match) | 3.5% | 25,900 | Query too specific, distance threshold too strict | Lower distance threshold, add fallback query |
| **Dimension mismatch** | 0.5% | 3,700 | Client using wrong embedding model | Enforce dimension validation at API |
| **Rate limit exceeded** | 1.2% | 8,900 | Burst traffic, insufficient capacity | Auto-scale pods, implement queuing |
| **Metadata filter error** | 0.8% | 5,900 | Invalid filter syntax, unknown field | Validate filters before query execution |
| **Index not ready** | 0.3% | 2,200 | Rebuild in progress, new collection | Health check before routing, fallback to stale |

### Capacity and scaling

| Resource | Current | Peak | Limit | Utilization | Scaling trigger | Auto-scale |
|---|---|---|---|---|---|---|
| **Pods** (knowledge_base) | 4 | 6 | 8 | 58% avg | 75% CPU or 85% memory | Yes |
| **Pods** (code_chunks) | 3 | 4 | 6 | 55% avg | 75% CPU or 85% memory | Yes |
| **Pods** (product_docs) | 3 | 4 | 6 | 52% avg | 75% CPU or 85% memory | Yes |
| **Pods** (semantic_search) | 3 | 5 | 6 | 62% avg | 75% CPU or 85% memory | Yes |
| **Memory per pod** | 72 GB | 82 GB | 96 GB | 75% avg | 85% for 5 min | Yes |
| **Disk IOPS** | 12,500 | 18,000 | 20,000 | 65% avg | 80% for 10 min | No (manual) |
| **Network throughput** | 850 Mbps | 1.2 Gbps | 2 Gbps | 42% avg | 80% | No (manual) |
| **Storage** | 8.2 TB | — | 20 TB | 41% | 70% | No (alert) |

## Action recommendations

1. **Archive collection re-index**: 42% stale vectors, 0.35 drift score, 2 model versions behind; full re-index with current model, or archive to cold storage if not actively queried
2. **Conversation history embedding refresh**: 28% stale, 0.22 drift score; re-embed all vectors with current model, target drift < 0.10, reduce staleness to < 10%
3. **Timeout reduction**: 2% timeout rate (7.4M queries/day affected); add per-collection query timeouts, optimize metadata filtering, add query complexity scoring
4. **Stale vector cleanup**: 15% stale vectors (28M) costing $3,233/month; implement TTL for conversation history, archive unused archive vectors, auto-delete after 180 days
5. **Embedding drift monitoring**: currently manual drift detection; implement automated drift scoring (cosine similarity of new vs old embeddings on sample queries), alert at drift > 0.15
6. **Hybrid search optimization**: 15% of queries are hybrid, 85ms avg latency; optimize fusion algorithm, add result caching, target < 50ms
7. **Ground truth evaluation expansion**: 42% of queries have eval data; expand ground truth dataset to 80% of query patterns, add automated recall regression testing
8. **Disk I/O capacity planning**: 65% utilization, no auto-scale; add disk I/O monitoring, set auto-scale policy, provision additional IOPS headroom
9. **Query error reduction**: 8.3% total error rate; fix dimension mismatch (enforce at API), add rate limit queuing, improve index health checks
10. **Weekly vector DB review**: review index performance, query latency, recall quality, embedding drift, storage efficiency, and scaling with AI engineering



- The "just add more dimensions" fallacy → assuming higher embedding dimensions always mean better quality; 4,096 dimensions cost 2× more in storage and latency than 2,048, but only improve recall by 2-3%; dimension choice should be empirical, not aspirational
- Index and forget → building an HNSW index once and never rebuilding it; as vectors are added and deleted, the graph degrades — fragmentation increases, dead-end paths multiply, and recall silently drops
- Metadata as an afterthought → storing all metadata in a JSON blob without indexing; every filtered query becomes a full scan of the metadata field, and your 45ms query becomes a 500ms query
- Embedding model lock-in → treating the embedding model as a fixed constant; when better models are released, you can't switch because re-embedding 185M vectors is "too expensive"; design for model rotation from day one
- The "k=100" safety blanket → always returning 100 results and letting the LLM sort it out; every extra result costs tokens, latency, and context window — return exactly what's needed, not everything that might be relevant

## Related

- Same class: [dashboard-ai-performance](dashboard-ai-performance.md) — AI model performance
- Same class: [dashboard-llm-cost](dashboard-llm-cost.md) — LLM cost and efficiency
- Same class: [dashboard-rag-quality](../methodology/dashboard-rag-quality.md) — RAG quality
- Same class: [dashboard-data-quality](../data/dashboard-data-quality.md) — data quality
- Same class: [dashboard-database-performance](../../engineer/infrastructure/dashboard-database-performance.md) — database performance
- References: Pinecone — *Vector Database Performance Benchmarks*; Weaviate — *HNSW Index Tuning Guide*; Qdrant — *Vector Search Optimization*; OpenAI — *Embedding Model Guide*; Milvus — *Vector Database Best Practices*; Nils Reimers — *Sentence-BERT and Embedding Quality*
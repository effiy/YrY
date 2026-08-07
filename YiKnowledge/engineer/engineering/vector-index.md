---
title: vectorindexPattern / Vector Index Pattern
aliases: [vector-index-pattern, ann-index-pattern, vector-ann]
tags: [pattern, engineeringPattern, vectorindex, ANN, RAG, LLM]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Vector embeddings are indexed for fast approximate nearest neighbor search, enabling efficient semantic retrieval at scale"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided"
related:
 - ./caching.md
 - ./database-sharding.md
 - ./materialized-view.md
 - ./index-optimization.md
 - ./cqrs.md
 - ../../ai-engineer/platform/pick-a-vector-database.md
 - ../projects/build-a-rag-pipeline.md
 - ../../ai-engineer/foundations/prepare-a-vector-database-strategy.md
---

# vectorindexPattern / Vector Index Pattern

> **As an** engineer, **I want to** vector index, **so that** pattern applied consistently.

## Summary

Choose index by recall + latency + memory + write throughput; HNSW / IVF / PQ / SQ / DiskANN many strategies; sharding + replica + quantization reduce cost; links with caching / sharding / materialized-view; suitable for ANN / RAG / recommendation scenarios; not suitable for exact lookup / small scale.

## Problem

- **Brute-force scan**: every query must compute N×d distance computations; N=100M latency > 10s; unusable.
- **Wrong index choice**: HNSW high memory + IVF tuning hard + PQ recall loss; chosen wrongly by business; online recall < 80%.
- **Memory explosion**: 100M × 768 dim fp32 = 286 GB; all in-memory HNSW can't be deployed.
- **Low write throughput**: HNSW writes slowly + rebuild index; not viable for real-time scenarios.
- **Wrong sharding**: hash by ID; query needs scatter-gather across all shards; high latency.
- **No recall monitoring**: index changes, recall changes; without monitoring nobody knows; users feel slow but don't know why.
- **No hot/cold separation**: hot data + cold data in same index; cold data wastes memory; cost waste.

## Pattern

**Core**: choose index by recall + latency + memory + write throughput; ANN nearest neighbor approximates, not exact; sharding + replica + quantization reduce cost; links with caching / sharding / materialized-view.

**Index type matrix**:

| Type | Suitable | Not suitable |
|---|---|---|
| HNSW | high recall + low latency + all in-memory + medium scale | large scale + low memory + write-heavy |
| IVF | large scale + tunable + balanced | extreme recall + real-time writes |
| PQ | memory-limited + large scale + quantization reduces cost | high recall requirement |
| SQ | memory-optimized + high recall retained | extreme compression + extreme recall |
| DiskANN | ultra-large scale + low memory + disk | low latency + small scale |
| ScaNN | high recall + high throughput | general scenarios |
| Hybrid (HNSW+PQ) | memory-optimized + recall balanced | extreme on any dimension |

**Key code**:

```python
class VectorIndex:
 """Vector index abstraction; choose implementation by scenario."""
 def __init__(self, dim, index_type, params):
 self.dim = dim
 self.type = index_type # hnsw / ivf / pq / diskann
 self.params = params
 self._metrics = {"recall": [], "latency_p99": [], "memory_mb": 0}

 def build(self, vectors):
 if self.type == "hnsw":
 self._build_hnsw(vectors, M=self.params["M"], ef_construction=self.params["ef_construction"])
 elif self.type == "ivf":
 self._build_ivf(vectors, nlist=self.params["nlist"])
 elif self.type == "pq":
 self._build_pq(vectors, m=self.params["m"], nbits=self.params["nbits"])
 elif self.type == "diskann":
 self._build_diskann(vectors, R=self.params["R"], L=self.params["L"])

 def search(self, query, k, ef_search=None, nprobe=None):
 # ef_search (HNSW) / nprobe (IVF) tunes recall vs latency
 results = self._search(query, k, ef_search, nprobe)
 self._record_metrics(results)
 return results

 def _record_metrics(self, results):
 self._metrics["latency_p99"].append(results.latency_ms)
 # offline eval computes recall; online sampled
 if results.recall_at_k is not None:
 self._metrics["recall"].append(results.recall_at_k)


class VectorShardRouter:
 """Shard router; partition by metadata + query scatter-gather."""
 def __init__(self, shards, partition_fn):
 self.shards = shards # list of VectorIndex
 self.partition = partition_fn # metadata → shard index

 def add(self, vector, metadata):
 shard_idx = self.partition(metadata)
 self.shards[shard_idx].add(vector, metadata)

 def search(self, query, k, filters):
 # narrow shard range by filters; not full scatter-gather
 candidate_shards = [s for i, s in enumerate(self.shards) if self._match(s, filters)]
 # parallel query + merge topK
 results = parallel(lambda s: s.search(query, k), candidate_shards)
 return merge_topk(results, k)
```

## Apply

- RAG retrieval (embedding lookup similar docs)
- Recommendation system (user / item embedding recall)
- Semantic search (query embedding recall)
- Deduplication (embedding detect similar)
- Image / audio / video retrieval (multimodal embedding)
- Clustering (embedding K-means / DBSCAN)
- Anomaly detection (embedding distance)

## Not apply

- Exact query (use B-tree / hash; vector index is approximate)
- Small scale (< 100k rows; brute-force is enough)
- High write throughput (HNSW writes slowly; use IVF + async rebuild)
- Strong consistency real-time index (write-then-immediately-query; use a dedicated real-time index)
- Relational query (use SQL / graph database)
- Full-text keyword search (use inverted index / GIN)

## Landing checklist

1. **Choose embedding model**: 768 / 1024 / 1536 / 3072 dim; choose by recall + cost; don't blindly chase high dims.
2. **Choose index type**: HNSW / IVF / PQ / SQ / DiskANN / hybrid; choose by recall + latency + memory + write throughput.
3. **Tune params**: HNSW M + ef_construction + ef_search; IVF nlist + nprobe; PQ m + nbits; tune against baseline.
4. **Quantization reduces cost**: PQ / SQ / fp16 / int8; choose by recall loss + memory cost; online quantized + offline fp32 fallback.
5. **Sharding strategy**: partition by metadata (tenant / category / time); not always ID hash; reduce scatter-gather.
6. **Replica + read/write separation**: writes to primary + reads to replica; replica async sync; monitor lag.
7. **Hot/cold separation**: hot data in-memory HNSW + cold data on-disk DiskANN; tiered storage.
8. **Hybrid retrieval**: vector recall + keyword BM25 + rerank; not pure vector.
9. **Recall monitoring**: offline evaluate recall@10 / @100; online sample compare; recall < 90% alert.
10. **Latency monitoring**: P99 / P999 monitoring; tune via k value / ef_search / nprobe; latency > 100ms alert.
11. **Memory monitoring**: memory usage + quantized size + index rebuild cost; alert when over budget.
12. **Index rebuild**: periodically rebuild HNSW (write fragmentation); CDC incremental + full rebuild fallback.
13. **Schema evolution**: embedding dimension changes → full rebuild; new version + dual-run + cut traffic + delete old.
14. **Multimodal**: text / image / audio embedding separate indexes; don't mix; merge on demand.
15. **CI gate**: new embedding model must run recall baseline; recall below baseline blocks PR.
16. **Cost observability**: memory + compute + storage + bandwidth; delete when unused; don't hoard.

## Anti-patterns

- **Brute-force scan**: every query must compute; unusable; fix: ANN index.
- **HNSW all in-memory at large scale**: memory explodes; fix: DiskANN / sharding + quantization.
- **Wrong IVF tuning**: nlist / nprobe not tuned; recall / latency poor; fix: baseline tuning.
- **Large PQ recall loss**: m / nbits not tuned; recall < 70%; fix: raise m + offline fp32 fallback.
- **No recall monitoring**: index changes, recall changes, nobody knows; fix: offline eval + online sampling.
- **Wrong sharding**: ID hash → full scatter-gather; high latency; fix: metadata partitioning narrows scope.
- **Writes to primary replica**: write-then-immediately-query misses; fix: write primary + sync replica / version readback.
- **No hot/cold separation**: cold data occupies memory; fix: tiered storage + DiskANN.
- **Pure vector retrieval**: recall rate insufficient; fix: vector + BM25 + rerank hybrid.
- **Embedding dimension blindly chasing high**: 3072 dim cost high; recall gain limited; fix: choose 768 / 1024 by scenario.
- **Schema evolution without dual-run**: embedding changes, direct rebuild; online traffic breaks; fix: dual-run + validation + cut traffic + delete old.
- **Not mixing with caching links**: hot query recomputes every time; fix: query cache + semantic cache.

## Related

- [caching-pattern](../architecture-design/caching.md) — query cache + semantic cache co-build
- [database-sharding-pattern](../architecture-design/database-sharding.md) — metadata partitioning narrows scatter-gather co-build
- [materialized-view-pattern](../architecture-design/materialized-view.md) — vector index is a derived read model co-build
- [index-optimization-pattern](../quality-security/index-optimization.md) — keyword index + vector index tiering
- [cqrs-pattern](../architecture-design/cqrs.md) — write DB + read vector library co-build
- [outbox-pattern](../infrastructure/outbox.md) — DB change + embedding sync co-build
- [cdc-pattern](./cdc.md) — CDC drives embedding incremental sync co-build
- [read-replica-pattern](../infrastructure/read-replica.md) — replica reduces read pressure co-build
- [distributed-tracing-pattern](./distributed-tracing.md) — query trace must carry SQL + plan
- Landing case study: pending landing YiAi RAG vector index + Knowledge base semantic search
- Upstream: [../../ai-engineer/platform/pick-a-vector-database.md](../../ai-engineer/platform/pick-a-vector-database.md)
- Upstream: [../projects/build-a-rag-pipeline.md](../projects/build-a-rag-pipeline.md)
- Downstream: [../lessons/gotchas/README.md](../lessons/README.md)

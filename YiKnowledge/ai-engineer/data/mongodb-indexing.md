---
title: "MongoDB Indexing Strategies for AI Applications: Vector Index, Compound Index, and Performance Tuning"
aliases:
  - MongoDB indexing
  - MongoDB vector index
  - MongoDB sharding
  - ESR rule
  - compound index
  - Atlas Vector Search
tags:
  - data
  - MongoDB
  - index
  - vector-index
  - sharding
  - performance
category: ai-engineer/data
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
  - ai-engineer
  - engineer
benefit: "Design MongoDB indexes for AI workloads that combine vector similarity search with metadata filtering -- achieve sub-100ms hybrid search at scale"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - data-modeling.md
  - redis-caching-patterns.md
  - ../platform/vector-db-comparison.md
  - ../../engineer/projects/yivad/README.md
  - ../../engineer/lessons/gotchas/README.md
tacit: false
---

# MongoDB Indexing Strategies for AI Applications

> **As an** AI engineer, **I want to** design MongoDB indexes for AI workloads, **so that** vector similarity search, metadata-filtered queries, and hybrid search are fast and scalable in production.

> MongoDB Atlas Vector Search brings vector similarity to your existing MongoDB infrastructure, enabling hybrid search (vector + metadata filters) without a separate vector database.

## Summary

- MongoDB index types: single field, compound (ESR rule), multikey, text, geo, TTL, hashed, and vector (Atlas Vector Search, available in MongoDB 6.0+).
- Compound index field order follows the ESR rule: Equality (exact match) -> Sort (order by) -> Range (gt/lt/between). Wrong order leads to index failure or full collection scan.
- Atlas Vector Search supports: exact KNN (k-nearest neighbors), approximate KNN (using HNSW index), and hybrid search (vector similarity + metadata filters + full-text search in a single query).
- Sharding strategy: Range (fast range queries but hot spots), Hash (even distribution but fan-out on range queries), Tag (data localization). Shard key cannot be changed once set.
- For AI applications, the most common query pattern is hybrid search: "find documents similar to this embedding, filtered by metadata (date, category, status), sorted by relevance."

## Core viewpoints

### 1. The ESR rule is the foundation of compound index design -- and it applies to metadata filters in hybrid search

The ESR rule (Equality -> Sort -> Range) determines the order of fields in a compound index. For AI applications, the most common compound index pattern is: `{status: 1, category: 1, created_at: -1}` where status and category are equality filters and created_at is the sort. In hybrid search, MongoDB Atlas applies metadata filters as a pre-filter (before vector search) or post-filter (after vector search). Pre-filtering with a well-designed compound index can reduce the vector search candidate set by 90-99%, dramatically improving latency.

### 2. Vector index configuration is the single most impactful performance decision for AI search

Atlas Vector Search uses an HNSW (Hierarchical Navigable Small World) index for approximate KNN. The key configuration parameters: (a) `dimensions`: must match the embedding model (768 for text-embedding-3-small, 1536 for text-embedding-3-large, 3072 for text-embedding-3-large), (b) `similarity`: cosine (recommended for normalized embeddings), dotProduct, or euclidean, (c) `M` (HNSW parameter): number of bi-directional links per node, 16-64 (higher = better recall, more memory), (d) `efConstruction`: size of the dynamic candidate list during index construction, 100-500 (higher = better recall, slower build). The defaults (M=16, efConstruction=100) are good for most use cases.

### 3. Hybrid search = vector similarity + pre-filter + post-filter + text scoring

MongoDB Atlas supports hybrid search that combines: (a) vector similarity score, (b) metadata pre-filter (filter before vector search), (c) metadata post-filter (filter after vector search), and (d) full-text search score (BM25). The scores are combined using a weighted sum: `final_score = w1 * vector_score + w2 * text_score`. Pre-filtering with metadata (e.g., `status: "published"`, `created_at > 2024-01-01`) is preferred when the filter is highly selective (>90% reduction in candidate set). Post-filtering is used when the filter is less selective or when exact count is needed.

### 4. Shard key selection is a one-way decision -- and it must support both vector search and metadata queries

Shard key cannot be changed after the collection is sharded. For AI applications, the shard key must support: (a) vector search (queries are distributed across shards), (b) metadata-filtered queries (common query patterns should include the shard key), and (c) write distribution (even distribution to avoid hot spots). The best shard key for AI applications is typically a compound key: `{category: 1, _id: "hashed"}` where category is the most common metadata filter and _id: "hashed" ensures even distribution within each category.

## Key info

### Index types

| Type | Use case | Note |
|---|---|---|
| Single field | Simple query on one field | Most common |
| Compound index | Multi-field query | ESR rule (Equality / Sort / Range) |
| Multikey index | Array field | Index explosion risk |
| Text index | Full-text search | Performance not like dedicated search engine |
| Geo index | Geographic position | 2dsphere |
| TTL index | Auto-expire | Logs, sessions, temporary data |
| Hashed index | Shard key | Even distribution |
| Vector index (Atlas) | KNN/ANN vector search | HNSW index, dimensions 768-4096 |

### ESR rule

Compound index field order: **Equality (exact match) -> Sort (order by) -> Range (gt/lt/between)**

Example: for query `{status: "active", category: "ai", created_at: {$gt: ISODate("2024-01-01")}}` sorted by `{created_at: -1}`, the index should be `{status: 1, category: 1, created_at: -1}`.

### Vector index configuration

| Parameter | Description | Default | Recommended range |
|---|---|---|---|
| dimensions | Embedding vector dimensions | Required | 768, 1024, 1536, 3072 |
| similarity | Distance metric | cosine | cosine (normalized embeddings), dotProduct, euclidean |
| M | HNSW bi-directional links | 16 | 16-64 (higher = better recall, more memory) |
| efConstruction | Candidate list size during build | 100 | 100-500 (higher = better recall, slower build) |

### Sharding strategy

| Strategy | Advantage | Disadvantage | AI use case |
|---|---|---|---|
| Range sharding | Fast range queries | Hot spots | Time-series data (logs, events) |
| Hash sharding | Even distribution | Range query fan-out | General-purpose AI data |
| Tag sharding | Data localization | Manual maintenance | Multi-tenant, geo-partitioned data |
| Compound (category + hash) | Query isolation + even distribution | Complex key design | Hybrid search with metadata filtering |

### Shard key selection criteria

- **Cannot be changed**: shard key is immutable after collection creation. Test thoroughly.
- **High cardinality**: many distinct values to avoid hot spots. Avoid boolean, enum with <10 values.
- **Query frequency**: common query patterns should include the shard key. Queries without the shard key fan out to all shards.
- **Write distribution**: writes should be evenly distributed. Monotonically increasing keys (ObjectId, timestamp) create hot spots.

### Hybrid search query pattern

```javascript
// MongoDB Atlas hybrid search: vector similarity + metadata filter + text search
db.collection.aggregate([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: queryEmbedding, // 768-dim float array
      numCandidates: 100, // candidate pool size
      limit: 10, // top K results
      filter: { // pre-filter (applied before vector search)
        status: "published",
        category: { $in: ["ai", "ml"] },
        created_at: { $gte: ISODate("2024-01-01") }
      }
    }
  },
  {
    $project: {
      _id: 1,
      content: 1,
      metadata: 1,
      score: { $meta: "vectorSearchScore" }
    }
  }
])
```

### Performance tuning checklist

| Area | Check | Target |
|---|---|---|
| Index usage | `explain("executionStats")` | IXSCAN, not COLLSCAN |
| Vector search latency | `$vectorSearch` execution time | < 100ms p95 |
| Index size | `db.collection.stats().indexSizes` | < RAM for best performance |
| Shard distribution | `sh.status()` | Even distribution across shards |
| Array field size | Average array length | < 100 elements (multikey index explosion) |
| Document size | Average document size | < 1MB (16MB BSON limit) |

## Action recommendations

1. Sort compound indexes by the ESR rule: equality fields -> sort fields -> range fields. Verify with `explain()`.
2. Use Atlas Vector Search for hybrid search (vector + metadata) if already using MongoDB. Avoid adding a separate vector database unless scale or latency requirements demand it.
3. Configure vector index with `cosine` similarity for normalized embeddings, `M=16`, `efConstruction=100` as starting points. Tune based on recall benchmarks.
4. Use pre-filtering with metadata for selective filters (>90% reduction in candidate set). Use post-filtering for less selective filters.
5. Choose shard key as `{category: 1, _id: "hashed"}` for AI applications with metadata filtering. Test with production query patterns.
6. Use TTL index for auto-expiring temporary data (sessions, cache entries, logs).
7. Control array field size: keep arrays under 100 elements to avoid multikey index explosion.
8. Monitor index usage with MongoDB Atlas Performance Advisor or `explain()` on slow queries. Add missing indexes proactively.

## Anti-patterns

- **Compound index not sorted by ESR**: wrong order causes index failure or full collection scan. Always verify with `explain()`.
- **Array field with large documents**: BSON document limit is 16MB. Embedding arrays (768 floats = 3KB) are fine, but large arrays of subdocuments can exceed the limit.
- **Index explosion from multikey indexes**: every array element enters the index. If an array has 1000 elements, one document adds 1000 index entries.
- **Query without shard key**: fans out to all shards. Common query conditions should include the shard key.
- **MongoDB text index for production full-text search**: performance is not comparable to Elasticsearch. Use Atlas Search (Lucene-based) for full-text, not the legacy text index.
- **Shard key with low cardinality**: boolean, status with 3 values, etc. cause severe hot spots.
- **Not setting `numCandidates` high enough in vector search**: too few candidates reduces recall. Set `numCandidates` to 10-20x `limit` for good recall.
- **Using MongoDB vector search as a replacement for a dedicated vector DB at billion-scale**: MongoDB Atlas Vector Search works well up to ~10M vectors. At billion-scale, consider a dedicated vector DB (Qdrant, Milvus).

## Related

- Same category: [data-modeling-summary.md](./data-modeling.md), [redis-caching-patterns-summary.md](./redis-caching-patterns.md)
- Platform: [../platform/vector-db-comparison.md](../platform/vector-db-comparison.md) (when to use MongoDB vs. dedicated vector DB)
- Upstream: [../../engineer/projects/yivad/README.md](../../engineer/projects/yivad/README.md) (MongoDB in practice)
- Downstream: [../../engineer/lessons/gotchas/README.md](../../engineer/lessons/README.md) (engineering gotchas)

## References

- MongoDB Atlas Vector Search: https://www.mongodb.com/docs/atlas/atlas-vector-search/
- MongoDB ESR rule: https://www.mongodb.com/docs/manual/core/index-compound/
- MongoDB sharding: https://www.mongodb.com/docs/manual/sharding/
- MongoDB Performance Advisor: https://www.mongodb.com/docs/atlas/performance-advisor/
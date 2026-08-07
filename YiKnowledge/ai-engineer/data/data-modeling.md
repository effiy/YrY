---
title: "Data Modeling Patterns for AI Applications: Schema Design, Embedding Storage, and Metadata Management"
aliases:
  - data modeling
  - dimensional modeling
  - Data Vault
  - 3NF
  - AI data modeling
  - schema design for AI
tags:
  - data
  - modeling
  - dimensional-modeling
  - Data-Vault
  - AI-data
  - schema-design
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
benefit: "Design data schemas that serve both traditional analytics and AI workloads -- choose the right modeling paradigm for query patterns, embedding storage, and metadata management"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - lakehouse-architecture.md
  - etl-elt-patterns.md
  - mongodb-indexing.md
  - data-governance.md
  - ../platform/vector-db-comparison.md
tacit: false
---

# Data Modeling Patterns for AI Applications

> **As an** AI engineer, **I want to** design data models that serve both traditional analytics and AI workloads, **so that** data is structured for efficient querying, embedding storage, and metadata management across the AI lifecycle.

> AI applications demand data models that go beyond traditional OLAP/OLTP -- they must support embedding vectors, model metadata, evaluation results, and feature stores alongside standard business data.

## Summary

- Three traditional paradigms: dimensional modeling (Kimball, star/snowflake schema for OLAP), Data Vault (Linstedt, Hub/Link/Satellite for large-scale integration and change traceability), and 3NF (Inmon, high normalization for enterprise data warehouse).
- AI applications add new requirements: embedding vector storage (high-dimensional float arrays), model metadata (versions, hyperparameters, training data lineage), evaluation results (metrics per model version per task), and feature stores (online/offline feature serving).
- MongoDB document schema is query-pattern-driven: design the schema around how the application reads data, not around normalization principles. This is especially relevant for AI applications where read patterns dominate.
- Embedding storage requires special consideration: vector dimensions (768-4096), index types (HNSW, IVF), and metadata filtering (hybrid search = vector similarity + metadata filters).
- The Vault + dimensional modeling combination is the most practical for enterprise AI data: Vault for raw data integration and lineage, dimensional modeling for analysis and reporting.

## Core viewpoints

### 1. Traditional data modeling paradigms apply to AI data, but with new entity types

AI applications introduce new entities that must be modeled: (a) models (versioned, with hyperparameters and training config), (b) datasets (versioned, with statistics and provenance), (c) embeddings (vectors with metadata), (d) evaluation runs (metrics per model+dataset combination), (e) prompts (versioned templates with parameters), and (f) user feedback (ratings, corrections, usage patterns). These entities should be modeled alongside traditional business entities (customers, orders, products), not in a separate silo.

### 2. MongoDB schema design for AI applications is driven by read patterns, not normalization

In AI applications, the most common read patterns are: (a) "get all data for a single entity" (document, user, conversation), (b) "search by embedding similarity + metadata filters", (c) "get version history for a model/dataset". MongoDB's document model is ideal for these patterns: store related data together (embedding + metadata + content in one document), index by the query patterns (vector index for similarity, compound index for metadata filters), and use references only for truly independent entities.

### 3. Embedding storage is not just a vector column -- it is a data modeling decision

The decision of where to store embeddings has architectural implications: (a) in the same document as the source data (MongoDB with vector index): simplest, good for metadata-filtered search, (b) in a dedicated vector database (Qdrant, Milvus, Pinecone): best for high-volume similarity search, (c) in a columnar store with vector extension (pgvector): good for SQL-heavy workflows. The choice depends on: query patterns (pure vector search vs. hybrid search), scale (millions vs. billions of vectors), and existing infrastructure (leverage existing MongoDB vs. add a new service).

### 4. Metadata management is the foundation of AI data quality

AI applications generate and consume vast amounts of metadata: model versions, training data provenance, evaluation scores, embedding dimensions, chunking strategies. This metadata must be: (a) versioned (each model/dataset version has a unique identifier), (b) linked (embedding -> source document -> dataset version -> model version), (c) queryable (find all embeddings generated by model version X), and (d) governed (retention policies, access control). A well-designed metadata schema is the difference between a maintainable AI system and an unmanageable one.

## Key info

### Paradigm comparison

| Paradigm | Advantage | Disadvantage | Best for |
|---|---|---|---|
| Dimensional modeling (Kimball) | Fast query, easy to understand | Not change-tolerant | OLAP analysis, dashboards |
| Data Vault (Linstedt) | Change-tolerant, traceable | Complex, slow query | Large-scale integration, data lineage |
| 3NF (Inmon) | Normalized, consistent | Slow query, many joins | Enterprise data warehouse |
| Document (MongoDB) | Query-pattern-driven, flexible schema | No joins, eventual consistency | AI application data, user-facing features |
| Graph (Neo4j) | Relationship-first, path queries | Not for aggregate queries | Knowledge graphs, recommendation |

### AI-specific entity modeling

| Entity | Key attributes | Relationships | Storage recommendation |
|---|---|---|---|
| Model | id, name, version, type, hyperparameters, created_at, status | -> dataset (trained on) | Document DB or model registry |
| Dataset | id, name, version, size, statistics, created_at | -> source (derived from) | Document DB or data catalog |
| Embedding | id, vector, source_id, model_id, chunk_index, metadata | -> source document, -> model | Vector DB or MongoDB with vector index |
| Evaluation run | id, model_id, dataset_id, metrics, created_at | -> model, -> dataset | Document DB |
| Prompt template | id, name, version, template_text, parameters | -> model (used with) | Document DB or prompt registry |
| User feedback | id, conversation_id, rating, comment, created_at | -> conversation | Document DB |

### Data Vault three components

| Component | Role | Example (AI context) |
|---|---|---|
| Hub | Entity (business key + load time) | Model hub (model_id), Dataset hub (dataset_id) |
| Link | Relationship (many-to-many) | Model-Dataset link (which model trained on which dataset) |
| Satellite | Attribute and history (timestamped changes) | Model satellite (hyperparameters over time), Dataset satellite (statistics over time) |

### MongoDB schema design for AI applications

| Pattern | Schema example | When to use |
|---|---|---|
| Embedded document | `{_id, content, embedding: [...], metadata: {source, chunk, created_at}}` | Data is always read together, no independent updates |
| Reference | `{_id, content, embedding_id: ObjectId}` + separate embedding collection | Embeddings are updated independently from content |
| Hybrid | `{_id, content, embedding: [...], metadata: {...}, source_ref: ObjectId}` | Most common: embed frequently accessed data, reference the rest |

## Action recommendations

1. For OLAP analytics, use dimensional modeling with star schema; add dimension tables for AI entities (model, dataset, prompt).
2. For multi-source data integration with change traceability, use Data Vault with Hub/Link/Satellite layering; model AI entities as hubs.
3. For user-facing AI application data, use MongoDB with query-pattern-driven schema design; embed embeddings and metadata alongside content.
4. For embedding storage, start with MongoDB vector index (if already using MongoDB) or pgvector (if PostgreSQL); migrate to a dedicated vector DB only when scale exceeds 10M vectors or latency requirements tighten.
5. Design the metadata schema upfront: every AI artifact (model, dataset, embedding, evaluation) must have a unique ID, version, and provenance links.
6. Combine Vault (integration layer) + dimensional modeling (analysis layer) + document DB (application layer) for a complete enterprise AI data architecture.

## Anti-patterns

- **OLAP scenario using 3NF**: many joins, slow query. Use dimensional modeling for OLAP.
- **Dimension explosion**: fact table has too many columns. Split fact tables (snapshot vs. cumulative).
- **MongoDB forcing 3NF**: document database is query-driven schema. Forcing relational paradigms defeats the purpose.
- **Storing embeddings without metadata**: embeddings without source, model version, and chunk metadata are unusable after 3 months.
- **Vault vs. dimensional modeling either-or**: the two are complementary. Vault integration + dimensional modeling analysis is the standard pattern.
- **No versioning on AI artifacts**: models, datasets, and prompts all change. Without versioning, debugging and rollback are impossible.
- **Embedding schema without hybrid search support**: vector similarity alone is insufficient. Metadata filters (date range, category, source) are essential for relevance.

## Related

- Same category: [lakehouse-architecture-summary.md](./lakehouse-architecture.md), [etl-elt-patterns-summary.md](./etl-elt-patterns.md), [mongodb-indexing-summary.md](./mongodb-indexing.md)
- Upstream: [data-governance-summary.md](./data-governance.md) (data governance is modeling prerequisite)
- Platform: [../platform/vector-db-comparison.md](../platform/vector-db-comparison.md) (vector storage options)
- Downstream: [../../engineer/projects/yivad/README.md](../../engineer/projects/yivad/README.md) (MongoDB schema in practice)
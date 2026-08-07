---
title: "ETL/ELT Patterns for AI Data Pipelines: Batch vs. Streaming, Incremental Processing, and Data Quality"
aliases:
  - ETL
  - ELT
  - data pipeline
  - CDC
  - dbt
  - Airflow
  - AI data pipeline
tags:
  - data
  - ETL
  - ELT
  - datapipeline
  - batch-processing
  - streaming
  - data-quality
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
benefit: "Build reliable AI data pipelines that handle batch, streaming, and incremental processing with built-in data quality gates -- the foundation for model training and RAG data freshness"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - data-modeling.md
  - lakehouse-architecture.md
  - data-governance.md
  - redis-caching-patterns.md
  - ../platform/dashboard-data-pipeline.md
tacit: false
---

# ETL/ELT Patterns for AI Data Pipelines

> **As an** AI engineer, **I want to** design and operate ETL/ELT pipelines for AI data, **so that** training data, RAG knowledge bases, and evaluation datasets are consistently fresh, high-quality, and traceable.

> AI data pipelines extend traditional ETL/ELT with new requirements: embedding generation, chunking, versioning, and quality evaluation specific to AI workloads (RAG relevance, embedding drift, prompt-response quality).

## Summary

- ETL = Extract -> Transform -> Load (transform before loading); ELT = Extract -> Load -> Transform (transform in the destination). ELT is the modern default for cloud data warehouses.
- Three scheduling modes: batch (T+1, for reports and aggregation), streaming (seconds, for real-time features and monitoring), and CDC (Change Data Capture, for incremental sync).
- Key tools: dbt (ELT transformation layer, SQL-based, version-controlled), Airflow (orchestration for complex DAGs), Debezium (CDC for database changes), Kafka (streaming platform).
- AI-specific pipeline stages: data ingestion -> cleaning -> chunking -> embedding -> indexing -> quality evaluation -> serving. Each stage has its own failure modes and quality requirements.
- Data quality gates are mandatory in AI pipelines: dirty data propagates through embedding and retrieval, degrading model output. Block downstream on quality failure.

## Core viewpoints

### 1. ELT is the standard for AI data pipelines because it preserves raw data for reprocessing

AI applications frequently need to reprocess raw data: a new embedding model requires re-embedding all documents, a new chunking strategy requires re-chunking, a new evaluation metric requires re-scoring. ELT preserves raw data in the destination, enabling these reprocessing workflows without re-extracting from source systems. ETL transforms before loading, discarding information that might be needed for future AI workflows. The raw data layer in ELT is the foundation of AI data versioning.

### 2. AI data pipelines have unique stages that traditional ETL tools do not natively support

Beyond standard ETL stages (extract, clean, transform, load), AI pipelines require: (a) chunking (splitting documents into retrievable units with overlap), (b) embedding generation (calling an embedding model API or GPU inference), (c) vector indexing (building and updating HNSW/IVF indexes), (d) quality evaluation (running RAGAS or custom metrics on the pipeline output), and (e) version tagging (associating each pipeline run with a version identifier). These stages require GPU resources, API calls, and specialized libraries that are not part of standard dbt/Airflow workflows.

### 3. CDC is the first choice for incremental sync in AI data pipelines

Full reload of AI data is expensive: it requires re-embedding all documents, which can cost thousands of dollars in API calls and hours of GPU time. CDC (Change Data Capture) enables incremental updates: only changed documents are re-embedded and re-indexed. Debezium captures database changes (insert, update, delete) and publishes them to Kafka. The AI pipeline consumes these events and updates only the affected embeddings and indexes. The cost savings are proportional to the data change rate -- for a 1% daily change rate, CDC is 100x cheaper than full reload.

### 4. Data quality in AI pipelines is about semantic correctness, not just structural validity

Traditional data quality checks (null rate, uniqueness, format compliance) are necessary but not sufficient for AI data. AI-specific quality dimensions include: (a) chunk quality (are chunks self-contained and coherent?), (b) embedding quality (are similar documents close in the embedding space?), (c) retrieval quality (does the pipeline retrieve the right documents for test queries?), and (d) freshness (is the indexed data up to date with the source?). These require AI-specific quality checks: embedding drift detection, retrieval recall evaluation, and chunk coherence scoring.

## Key info

### ETL vs. ELT for AI workloads

| Pattern | Process | Pros | Cons | AI suitability |
|---|---|---|---|---|
| ETL | Extract -> Transform -> Load | High data quality, light destination | Discards raw data, hard to reprocess | Low (raw data needed for reprocessing) |
| ELT | Extract -> Load -> Transform | Preserves raw data, elastic, reprocessable | Destination must be powerful | High (enables re-embedding, re-chunking) |

### AI data pipeline stages

```
Source Systems (DB, API, files)
    |
    v
[1] Extract (Debezium CDC, Fivetran, API polling)
    |
    v
[2] Raw Storage (Data Lake / Lakehouse -- Iceberg/Delta)
    |
    v
[3] Clean & Transform (dbt, Spark, Python)
    |
    v
[4] AI-Specific Processing
    |-- Chunking (sentence/paragraph/semantic splitting)
    |-- Embedding (OpenAI/Cohere API, self-hosted model)
    |-- Vector Indexing (HNSW/IVF index build)
    |-- Quality Evaluation (RAGAS, custom metrics)
    |
    v
[5] Serving Layer
    |-- Vector DB (Qdrant, Milvus, pgvector)
    |-- Feature Store (online + offline)
    |-- Cache (Redis semantic cache)
```

### Scheduling modes

| Mode | Latency | Suitable scenarios | AI use case | Tools |
|---|---|---|---|---|
| Batch | T+1, hour-level | Reports, aggregation | Daily re-indexing, model retraining | Airflow + dbt |
| Streaming | Seconds | Real-time monitoring, alerts | Real-time RAG updates, feature serving | Kafka + Flink |
| CDC | Incremental | Database sync, zero-downtime migration | Incremental embedding updates | Debezium + Kafka |

### AI-specific data quality dimensions

| Dimension | Traditional check | AI-specific check |
|---|---|---|
| Completeness | Non-null rate of required fields | Are all chunks embedded? Are all embeddings in the index? |
| Consistency | Cross-table consistency | Do embeddings from the same model version cluster similarly? |
| Freshness | Data age vs. source | Are RAG results up to date with source changes? |
| Accuracy | Reconciliation with source | Does retrieval recall meet the target threshold? |
| Coherence | N/A | Are chunks semantically self-contained? |
| Relevance | N/A | Are retrieved chunks relevant to test queries? |

### Incremental vs. full reload

| Strategy | When to use | Cost impact | AI consideration |
|---|---|---|---|
| Full reload | Schema changes, new embedding model, new chunking strategy | High (re-embed all documents) | Acceptable for initial load or model migration |
| Incremental (CDC) | Routine updates, 1-10% daily change rate | Low (only changed documents) | Default for ongoing operation |
| Hybrid | Full reload weekly + incremental daily | Medium | Best for most AI pipelines |

## Action recommendations

1. Start with ELT + dbt transformation layer + Airflow orchestration. Centralize transformation logic in dbt; do not scatter.
2. Use Debezium CDC for incremental embedding updates. Full reload is an anti-pattern for routine updates.
3. Add AI-specific pipeline stages (chunking, embedding, indexing, quality evaluation) as Airflow tasks with GPU node affinity.
4. Implement data quality gates at every stage: structural validation (dbt tests), AI-specific quality (RAGAS evaluation), and pipeline-level freshness (age check).
5. Use Kafka for streaming AI data pipelines; separate streaming and batch pipelines to avoid coupling.
6. Version every pipeline run: tag embeddings, chunks, and indexes with a pipeline run ID for traceability and rollback.
7. For simple pipelines, dbt + cron suffices. Use Airflow only when you need complex DAGs with conditional branching.

## Anti-patterns

- **Full reload for routine updates**: should use CDC incremental. Re-embedding all documents for a 1% change is 100x more expensive.
- **Scattered transformation logic**: should be centralized in dbt. Transformation logic spread across Python scripts, notebooks, and Airflow operators is unmaintainable.
- **No data quality gates in AI pipelines**: dirty data propagates through embedding and retrieval, degrading model output. Use Great Expectations / dbt tests + RAGAS evaluation.
- **Forcing streaming on batch scenarios**: reports and aggregation use batch. Streaming adds needless complexity and cost.
- **No versioning on pipeline runs**: without versioning, you cannot roll back a bad embedding model update or debug a quality regression.
- **Treating AI pipeline stages as an afterthought**: chunking, embedding, and indexing are first-class pipeline stages, not optional extras.
- **Not monitoring embedding drift**: embedding models change, data distributions shift. Monitor embedding drift (cosine similarity of new vs. old embeddings) to detect degradation.

## Related

- Same category: [data-modeling-summary.md](./data-modeling.md), [lakehouse-architecture-summary.md](./lakehouse-architecture.md), [data-governance-summary.md](./data-governance.md)
- Upstream: [data-governance-summary.md](./data-governance.md) (governance is a pipeline precondition)
- Platform: [../platform/dashboard-data-pipeline.md](./dashboard-data-pipeline.md) (pipeline monitoring)
- Methodology: [../methodology/rag-design-patterns.md](../methodology/rag-design-patterns.md) (RAG pipeline stages)
- Downstream: [../../engineer/projects/yivad/README.md](../../engineer/projects/yivad/README.md) (MongoDB -> data warehouse pipeline)
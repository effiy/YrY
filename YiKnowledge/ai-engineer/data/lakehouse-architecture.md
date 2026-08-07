---
title: "Data Lakehouse Architecture: Iceberg, Delta Lake, Medallion Architecture, and Query Engines"
aliases:
  - lakehouse architecture
  - Apache Iceberg
  - Delta Lake
  - Apache Hudi
  - medallion architecture
  - data lake
tags:
  - data
  - Lakehouse
  - Iceberg
  - Delta
  - Hudi
  - medallion
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
benefit: "Build a unified data platform that combines the low cost of a data lake with the ACID guarantees of a data warehouse -- essential for AI training data management and feature engineering at scale"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - data-modeling.md
  - etl-elt-patterns.md
  - data-governance.md
  - ../platform/vector-db-comparison.md
tacit: false
---

# Data Lakehouse Architecture

> **As an** AI engineer, **I want to** understand data lakehouse architecture and its role in AI workloads, **so that** I can build scalable, ACID-compliant data platforms for model training, feature engineering, and RAG knowledge bases.

> A lakehouse brings data warehouse guarantees (ACID, schema enforcement, time travel) to low-cost object storage -- the open table format (Iceberg/Delta/Hudi) is the key enabler.

## Summary

- Lakehouse = data lake (low-cost object storage) + data warehouse properties (ACID transactions, schema enforcement, time travel, indexing).
- Three major open table formats: Apache Iceberg (Netflix, strong schema evolution, multi-engine), Delta Lake (Databricks, mature ecosystem, deep Databricks integration), Apache Hudi (Uber, strong CDC/upsert, incremental processing).
- Medallion architecture (Bronze -> Silver -> Gold) provides a standardized data quality layering pattern: raw ingestion -> cleaned/validated -> business-aggregated.
- Query engines: Spark, Trino, DuckDB, and Daft all support the three formats. The choice depends on latency requirements (interactive vs. batch) and existing infrastructure.
- For AI workloads, the lakehouse serves as the central repository for: training datasets, feature stores, RAG document corpora, and model evaluation results.

## Core viewpoints

### 1. The open table format is the architectural decision that matters most; the query engine is secondary

The choice of Iceberg, Delta, or Hudi determines: (a) which engines can query the data, (b) how schema evolution is handled, (c) how well CDC/upsert is supported, and (d) the ecosystem of tools (catalog, compaction, maintenance). The query engine (Spark, Trino, DuckDB) can be changed later; the table format is a long-term commitment. Iceberg has the broadest engine support and is the most vendor-neutral choice. Delta has the best Databricks integration and commercial support. Hudi is the strongest for CDC-heavy workloads.

### 2. Medallion architecture is the standard layering pattern for AI data quality

The medallion architecture organizes data into three quality tiers:
- **Bronze**: raw ingested data, no transformations, full fidelity to source. Used for reprocessing and audit.
- **Silver**: cleaned, validated, deduplicated data. Joins and basic transformations applied. The foundation for feature engineering and model training.
- **Gold**: business-aggregated data, metrics, and features. Ready for dashboards, model serving, and RAG retrieval.

For AI workloads, an additional "Platinum" tier is sometimes used: model-ready features, embedding vectors, and evaluation datasets with strict quality guarantees.

### 3. Time travel is the killer feature for AI reproducibility

All three open table formats support time travel: querying the data as it existed at a specific point in time. For AI workloads, this enables: (a) reproducing a model training run exactly (query the training data at the time of training), (b) debugging model quality regressions (compare the data at two points in time), (c) A/B testing data pipeline changes (query the old and new data side by side), and (d) audit and compliance (prove what data was used for a specific model version). Time travel is enabled by the table format's snapshot mechanism, which retains old data files until they are explicitly vacuumed.

### 4. The lakehouse is the most cost-effective foundation for AI data at scale

Object storage (S3, ADLS, GCS, MinIO) is 5-10x cheaper than data warehouse storage (Snowflake, BigQuery, Redshift). For AI workloads with petabytes of training data, this cost difference is decisive. The lakehouse keeps raw data in object storage while providing warehouse-like query capabilities through open table formats. The combination of: object storage (cheap) + open table format (ACID) + query engine (compute on demand) + catalog (governance) is the most cost-effective architecture for AI data at scale.

## Key info

### Open table format comparison

| Format | Origin | Strengths | Weaknesses | Best for |
|---|---|---|---|---|
| Apache Iceberg | Netflix | Strong schema evolution, time travel, broad engine support | Relatively smaller community | Multi-engine, vendor-neutral, schema-heavy |
| Delta Lake | Databricks | Mature ecosystem, commercial support, liquid clustering | Deeply tied to Databricks | Databricks ecosystem, enterprise |
| Apache Hudi | Uber | CDC support, strong upsert, incremental processing | Complex, steep learning curve | CDC-heavy, streaming ingestion |

### Medallion architecture layers

| Layer | Purpose | Examples | AI-specific use |
|---|---|---|---|
| Bronze | Raw ingestion, full fidelity | Raw API responses, raw logs, raw PDFs | Audit trail, reprocessing source |
| Silver | Cleaned, validated, deduplicated | Parsed JSON, validated schemas, joined data | Feature engineering, training data prep |
| Gold | Business-aggregated, metrics | KPIs, dashboards, summary tables | Model evaluation metrics, RAG index source |
| Platinum (optional) | Model-ready features | Feature vectors, embedding tables, eval datasets | Direct model training and serving input |

### Query engines for lakehouse

| Engine | Type | Latency | Best for | Iceberg | Delta | Hudi |
|---|---|---|---|---|---|---|
| Apache Spark | Batch/streaming | Minutes | Large-scale ETL, ML pipelines | Yes | Yes | Yes |
| Trino | Interactive SQL | Seconds | Ad-hoc queries, dashboards | Yes | Yes | Yes |
| DuckDB | In-process OLAP | Sub-second | Local analysis, embedded queries | Yes | No (experimental) | No |
| Daft | Distributed DataFrame | Seconds | ML data loading, Python-native | Yes | Yes | Partial |
| StarRocks | Real-time OLAP | Sub-second | Real-time dashboards, user-facing | Yes | No | No |

### Data lifecycle management

| Policy | Description | AI-specific consideration |
|---|---|---|
| Partitioning | Partition by time (date/hour) or business key | Partition training data by date for time-based splits |
| Compaction | Merge small files into larger files | Compaction after embedding generation (many small files) |
| TTL / retention | Auto-delete old data after N days | Retain training data for model reproducibility; TTL raw logs |
| Hot/cold separation | Hot data on SSD, cold data on object storage | Hot: recent training data; Cold: archived model versions |
| Vacuum | Remove old snapshots no longer needed | Keep snapshots for model training reproducibility period |

### AI workload on lakehouse

| AI workload | Lakehouse role | Table format | Query engine |
|---|---|---|---|
| Training data prep | Bronze -> Silver transformation | Iceberg | Spark |
| Feature engineering | Silver -> Gold/Platinum features | Iceberg/Delta | Spark + dbt |
| Embedding generation | Read Silver, write vectors to Gold | Iceberg | Spark + GPU |
| RAG corpus management | Versioned document store with metadata | Iceberg | Trino |
| Model evaluation | Read Gold eval datasets, write metrics | Iceberg | DuckDB/Trino |
| Model registry | Metadata tables for model versions | Iceberg/Delta | Trino |

## Action recommendations

1. Start with Iceberg as the open table format for vendor neutrality and broadest engine support. Use Delta if already in the Databricks ecosystem.
2. Implement the medallion architecture (Bronze -> Silver -> Gold) from day one. It is the standard pattern for data quality layering.
3. Use Spark for large-scale batch ETL and ML data preparation; use Trino for interactive SQL and dashboards; use DuckDB for local analysis.
4. Add a Platinum tier for model-ready features and embeddings with strict quality guarantees.
5. Enable time travel with a retention period that matches your model reproducibility requirements (typically 30-90 days).
6. Implement data lifecycle management: partitioning by date, compaction for small files, TTL for old data, and hot/cold separation.
7. Use a data catalog (DataHub, Amundsen, or AWS Glue) to register lakehouse tables and make them discoverable.

## Anti-patterns

- **No partitioning strategy**: full-table scans on petabyte-scale data are prohibitively expensive. Partition by time and business key.
- **No data lifecycle management**: storage costs grow indefinitely without TTL, compaction, and hot/cold separation.
- **Choosing Hudi for batch-only workloads**: Hudi's strength is CDC/upsert. For batch-only, Iceberg or Delta are simpler and better supported.
- **Delta across clouds without evaluating Databricks lock-in**: Delta is deeply tied to Databricks. Evaluate the vendor lock-in risk before committing.
- **Running heavy OLTP on a lakehouse**: use an RDBMS (PostgreSQL, MySQL) for transactional workloads. Lakehouse is for analytics and AI.
- **No vacuum maintenance**: old snapshots accumulate and increase storage costs. Set a snapshot retention policy.
- **Treating the lakehouse as a replacement for specialized AI infrastructure**: a lakehouse is a data platform, not a model training platform or vector database. It complements, not replaces, specialized AI tools.

## Related

- Same category: [data-modeling-summary.md](./data-modeling.md), [etl-elt-patterns-summary.md](./etl-elt-patterns.md), [data-governance-summary.md](./data-governance.md)
- Upstream: [data-governance-summary.md](./data-governance.md) (governance is a prerequisite for lakehouse)
- Platform: [../platform/vector-db-comparison.md](../platform/vector-db-comparison.md) (vector DB as a specialized store alongside lakehouse)

## References

- Armbrust et al., 2021 -- *Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics* (Databricks)
- Apache Iceberg: https://iceberg.apache.org/
- Delta Lake: https://delta.io/
- Apache Hudi: https://hudi.apache.org/
- Medallion architecture: https://www.databricks.com/glossary/medallion-architecture
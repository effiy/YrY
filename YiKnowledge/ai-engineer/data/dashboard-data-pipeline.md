---
title: data pipeline dashboard
aliases:
- data dashboard
- data quality dashboard
- pipeline health dashboard
- data engineering dashboard
tags:
- dashboard
- data
- pipeline
- data-quality
- etl
- freshness
- lineage
category: ai-engineer/data
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- ai-engineer
- engineer
- tech-lead
benefit: data pipeline health and data quality visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../platform/dashboard-ai-performance.md
- ../../engineer/infrastructure/data-migration.md
- ../../oncall-sre/observability/dashboard-system-health.md
tacit: false
---

# data pipeline dashboard

> **As a** data engineer, **I want to** track data pipeline health and data quality across all data sources, **so that** data issues are detected before they corrupt downstream analytics and AI models.

> Data pipelines are the backbone of AI and analytics. This dashboard tracks pipeline health, data quality, freshness, lineage, and cost in a unified view.

## Summary

- 5 data dimensions: pipeline health, data quality, freshness and latency, data lineage, cost and resource utilization
- Pipeline DAG visualized with per-node status, runtime, and data volume
- Data quality checks: completeness, uniqueness, accuracy, consistency, timeliness
- Freshness SLAs defined per dataset; stale data triggers alerts
- Dashboard refreshes per pipeline run; quality checks on every ingestion

## Core viewpoints

- Data quality is a product — treat data consumers as customers with SLAs
- Pipeline reliability must match service reliability — a broken data pipeline is a production incident
- Freshness is a quality dimension — stale data is incorrect data for real-time use cases
- Lineage enables impact analysis — when a source changes, know exactly which downstream datasets and models are affected

## Key information

### 5-panel data overview

```
┌──────────────────────────────────────────────────────────────────┐
│  PIPELINE HEALTH                │  DATA QUALITY                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Running:   12/12       │   │  │  Completeness: 99.2%    │   │
│  │  Success:   98.5% (7d)  │   │  │  Uniqueness:   99.8%    │   │
│  │  Failed:    0           │   │  │  Accuracy:     98.5%    │   │
│  │  Avg runtime: 4.2 min   │   │  │  Consistency:  99.1%    │   │
│  │  Backfill:   0 pending  │   │  │  Timeliness:   97.8%    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  FRESHNESS & LATENCY            │  LINEAGE & IMPACT               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Real-time: < 5s lag    │   │  │  Sources:     24        │   │
│  │  Near-real:  < 5 min    │   │  │  Datasets:    86        │   │
│  │  Batch:      < 1 hour   │   │  │  Models:      12        │   │
│  │  Stale:      0 datasets │   │  │  Dashboards:  8         │   │
│  │  SLA miss:   0.2% (7d)  │   │  │  Downstream:  142 nodes │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Pipeline DAG health

| Pipeline | Schedule | Last run | Duration | Status | Records | SLA |
|---|---|---|---|---|---|---|
| user_events_ingestion | Real-time | 2s ago | Streaming | Green | 12.4k/min | < 10s lag |
| llm_request_logs | Real-time | 5s ago | Streaming | Green | 8.2k/min | < 30s lag |
| user_feedback_ingestion | Real-time | 8s ago | Streaming | Green | 1.4k/min | < 1 min lag |
| daily_user_aggregation | 00:30 UTC | 00:30 UTC | 4.2 min | Green | 2.4M | < 1 hour |
| daily_revenue_aggregation | 01:00 UTC | 01:00 UTC | 2.8 min | Green | 45k | < 1 hour |
| weekly_report_materialization | Mon 02:00 | Mon 02:00 | 12.5 min | Green | 8.2M | < 2 hours |
| ml_feature_refresh | 3 hours | 08:00 UTC | 18.2 min | Green | 14.2M | < 30 min |
| embedding_generation | 6 hours | 06:00 UTC | 45.3 min | Green | 2.1M | < 1 hour |
| data_quality_checks | Hourly | 10:00 UTC | 1.2 min | Green | 86 checks | < 5 min |
| model_training_dataset | Daily | 03:00 UTC | 32.8 min | Green | 5.4M | < 2 hours |
| rag_index_refresh | 30 min | 10:15 UTC | 8.2 min | Green | 142k docs | < 15 min |
| backup_and_archive | Daily | 23:00 UTC | 28.5 min | Green | 450GB | < 2 hours |

### Data quality dimensions

| Dimension | Definition | Measurement method | Target | Current |
|---|---|---|---|---|
| Completeness | % of expected records present | Record count vs expected | > 99% | 99.2% |
| Uniqueness | % of records without duplicates | Primary key uniqueness check | > 99.5% | 99.8% |
| Accuracy | % of values matching ground truth | Validation against source systems | > 98% | 98.5% |
| Consistency | % of records consistent across sources | Cross-source reconciliation | > 99% | 99.1% |
| Timeliness | % of records within freshness SLA | Timestamp vs current time | > 99% | 97.8% |
| Validity | % of values matching expected format | Schema validation, regex checks | > 99.5% | 99.6% |

### Data quality by dataset

| Dataset | Completeness | Uniqueness | Accuracy | Freshness | Overall | Status |
|---|---|---|---|---|---|---|
| user_events | 99.5% | 99.9% | 99.2% | 99.8% | 99.6% | Green |
| llm_requests | 99.8% | 99.9% | 99.5% | 99.5% | 99.7% | Green |
| user_feedback | 98.2% | 99.5% | 97.8% | 98.5% | 98.5% | Yellow |
| billing_events | 99.9% | 100% | 99.9% | 99.9% | 99.9% | Green |
| model_predictions | 99.1% | 99.8% | 98.2% | 95.5% | 98.2% | Yellow |
| rag_documents | 97.5% | 99.2% | 96.8% | 92.0% | 96.4% | Red |

### Freshness SLA by dataset tier

| Tier | Freshness SLA | Alert threshold | Example datasets |
|---|---|---|---|
| Real-time | < 10 seconds | > 30 seconds lag | User events, LLM request logs |
| Near-real-time | < 5 minutes | > 15 minutes lag | User feedback, billing events |
| Hourly | < 1 hour | > 2 hours lag | Aggregate tables, quality checks |
| Daily | < 4 hours | > 8 hours lag | ML features, training datasets |
| Weekly | < 12 hours | > 24 hours lag | Reports, archive backups |

### Data lineage example

```
Sources                    Datasets                    Consumers
───────                    ────────                    ─────────
User Events ────────────── user_events_raw ─────────── Real-time Analytics
  │                          │
  │                          ├──────── user_events_clean ──────── ML Feature Store
  │                          │                                      │
LLM Requests ────────────── llm_requests_raw ────────┐             │
  │                          │                       │             │
  │                          ├── llm_cost_agg ───────┤             │
  │                          │                       │             │
User Feedback ────────────── feedback_raw ───────────┤             │
  │                          │                       │             │
  │                          ├── feedback_clean ─────┤             │
  │                          │                       │             │
Billing Events ───────────── billing_events ─────────┤             │
  │                          │                       │             │
  │                          └── unified_user_360 ───┴──┬──────────┤
  │                                                     │          │
  └─────────────────────────────────────────────────────┤          │
                                                        │          │
                                                  User Dashboard   │
                                                  Executive KPI    │
                                                  Model Training ──┘
```

### Cost and resource utilization

| Resource | Daily cost | Monthly cost | % of budget | Trend |
|---|---|---|---|---|
| Data warehouse compute | $85 | $2,550 | 34% | ↑ 5% MoM |
| Data warehouse storage | $42 | $1,260 | 17% | ↑ 8% MoM |
| Streaming (Kafka/PubSub) | $38 | $1,140 | 15% | → stable |
| ETL/Orchestration | $28 | $840 | 11% | → stable |
| Embedding API calls | $45 | $1,350 | 18% | ↑ 12% MoM |
| Backup and archive | $12 | $360 | 5% | → stable |
| **Total** | **$250** | **$7,500** | **100%** | ↑ 5% MoM |

## Action recommendations

1. **Pipeline failure = incident**: any pipeline failure triggers an alert; failed pipelines > 1 hour trigger SEV2 incident
2. **Data quality SLAs**: define and publish quality SLAs for every dataset; monitor and alert on violations
3. **Freshness monitoring**: stale data is incorrect data; alert when freshness exceeds SLA threshold
4. **Lineage for every dataset**: every dataset must have documented upstream sources and downstream consumers
5. **Fix RAG document quality**: completeness at 97.5% and freshness at 92% are red; investigate and fix
6. **Cost optimization**: embedding API at 18% of budget and growing; evaluate batching and caching strategies
7. **Weekly quality review**: review data quality trends every Monday; address declining datasets before they impact models
8. **Schema evolution governance**: all schema changes go through migration review; backward compatibility required



- Garbage in, garbage out → no quality checks on ingestion; bad data silently corrupts models and dashboards
- Pipeline sprawl → too many unowned pipelines; every pipeline must have an owner and documented purpose
- Stale data unmonitored → datasets falling behind freshness SLA with no alerting; freshness is a quality dimension
- No lineage tracking → can't answer "what breaks if I change this source?"; lineage enables safe evolution
- Data silos → each team has its own copy of the same data; single source of truth with managed access

## Related

- Same class: [dashboard-ai-performance](../platform/dashboard-ai-performance.md) — AI performance dashboard
- Same class: [dashboard-system-health](../../oncall-sre/observability/dashboard-system-health.md) — system health
- Downstream: [data-migration](../../engineer/infrastructure/data-migration.md) — data migration guide
- References: Google — *Data Engineering Best Practices*; Maxime Beauchemin — *The Rise of the Data Engineer*; Barr Moses — *Data Quality Management*
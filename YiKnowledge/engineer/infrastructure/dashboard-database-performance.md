---
title: database performance dashboard
aliases:
- db dashboard
- database health dashboard
- data store dashboard
- persistence dashboard
tags:
- dashboard
- database
- performance
- query
- replication
- backup
- connection-pool
category: engineer/infrastructure
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- tech-lead
- oncall-sre
benefit: database performance and health visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- data-migration.md
- ../../oncall-sre/observability/dashboard-system-health.md
- ../../oncall-sre/observability/dashboard-cost-and-resource.md
- ../architecture-design/dashboard-architecture-health.md
tacit: false
---

# database performance dashboard

> **As a** database engineer, **I want to** track database performance and health across all data stores, **so that** query degradation, capacity issues, and replication lag are detected before they cause incidents.

> Database performance is the foundation of application performance. This dashboard tracks query performance, connection pools, replication, backups, and storage across all data stores.

## Summary

- 5 database dimensions: query performance, connection management, replication and consistency, backup and recovery, storage and capacity
- Query performance tracked via P50/P95/P99 latency, slow query count, and index effectiveness
- Connection pool utilization, wait time, and timeout rate monitored per service
- Replication lag, write-ahead log (WAL) accumulation, and data consistency checks
- Backup success rate, RPO compliance, and restore test results
- Dashboard refreshes per minute for critical metrics; daily capacity review

## Core viewpoints

- Database latency is multiplicative — a 50ms query called 100 times per request = 5 seconds of database time
- Connection pools are finite — running out of connections is a self-inflicted outage; monitor pool utilization
- Replication lag is data loss risk — every second of lag is a second of potential data loss on failover
- Backups that aren't tested aren't backups — a backup without a verified restore is a wish

## Key information

### 5-panel database overview

```
┌──────────────────────────────────────────────────────────────────┐
│  QUERY PERFORMANCE               │  CONNECTION MANAGEMENT          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  P50:  8ms              │   │  │  Active:   142/200      │   │
│  │  P95:  45ms             │   │  │  Idle:     38           │   │
│  │  P99:  180ms            │   │  │  Waiting:  2            │   │
│  │  Slow:  12/hr (↓ 3)     │   │  │  Timeout:  0.1%         │   │
│  │  Index:  92% hit rate   │   │  │  Wait avg: 8ms          │   │
│  │  Cache:   94% hit rate  │   │  │  Leak:     0 detected   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  REPLICATION & CONSISTENCY       │  BACKUP & RECOVERY              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Lag:     0.2s (Green)  │   │  │  Last full: 2h ago ✓    │   │
│  │  WAL:     45MB          │   │  │  Last incr: 15 min ✓    │   │
│  │  Sync:    Synchronous   │   │  │  RPO:       < 1 min     │   │
│  │  Checksum: All pass     │   │  │  RTO:       < 15 min    │   │
│  │  Conflict: 0            │   │  │  Restore:   Jul 15 ✓    │   │
│  │  Split:    No brain     │   │  │  Retention: 30 days     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Database instances overview

| Instance | Type | Version | Size | Connections | Replication | Status |
|---|---|---|---|---|---|---|
| pg-primary | PostgreSQL 16 | 16.2 | 450GB | 142/200 | Primary | Green |
| pg-replica-1 | PostgreSQL 16 | 16.2 | 450GB | 28/100 | Replica (0.2s) | Green |
| pg-replica-2 | PostgreSQL 16 | 16.2 | 450GB | 22/100 | Replica (0.3s) | Green |
| pg-analytics | PostgreSQL 16 | 16.2 | 820GB | 18/50 | Replica (1.2s) | Yellow |
| redis-primary | Redis 7.2 | 7.2.4 | 28GB | 85/500 | Primary | Green |
| redis-replica | Redis 7.2 | 7.2.4 | 28GB | 12/200 | Replica (0s) | Green |
| mongo-primary | MongoDB 7.0 | 7.0.8 | 120GB | 35/200 | Primary | Green |
| mongo-replica-1 | MongoDB 7.0 | 7.0.8 | 120GB | 18/200 | Replica (0.1s) | Green |
| elasticsearch | Elastic 8.12 | 8.12.1 | 380GB | 22/100 | Primary | Green |

### Query performance by service

| Service | Primary DB | Avg QPS | P50 | P95 | P99 | Slow queries/hr | Cache hit |
|---|---|---|---|---|---|---|---|
| api-gateway | pg-primary | 320 | 5ms | 22ms | 85ms | 2 | 96% |
| user-service | pg-primary | 180 | 8ms | 35ms | 120ms | 3 | 94% |
| payment-service | pg-primary | 45 | 12ms | 55ms | 180ms | 1 | 92% |
| search-service | elasticsearch | 220 | 15ms | 65ms | 250ms | 5 | 88% |
| notification-svc | pg-primary | 85 | 6ms | 18ms | 55ms | 0 | 97% |
| analytics-svc | pg-analytics | 35 | 120ms | 450ms | 2.2s | 8 | 82% |
| rag-service | mongo-primary | 95 | 8ms | 35ms | 95ms | 1 | 94% |

### Slow query analysis (top 5 by frequency)

| Query pattern | Count/hr | Avg time | P95 time | Index used | Optimization |
|---|---|---|---|---|---|
| User search by partial name | 4.2 | 850ms | 2.1s | Seq scan | Add trigram index |
| Analytics: monthly revenue | 3.8 | 1.2s | 3.5s | Partial | Add materialized view |
| Dashboard: real-time stats | 2.5 | 650ms | 1.8s | Yes | Query refactor + caching |
| Search: full-text with sort | 1.8 | 920ms | 2.8s | Partial | Tune ES analyzer |
| Export: large CSV generation | 1.2 | 4.5s | 12.0s | Yes | Async + chunked |

### Index effectiveness

| Table | Total indexes | Unused (30d) | Missing (suggested) | Index size | Bloat |
|---|---|---|---|---|---|
| users | 12 | 2 | 1 (trigram on name) | 2.8GB | 12% |
| events | 8 | 1 | 1 (partial on status) | 4.5GB | 18% |
| llm_requests | 6 | 0 | 0 | 3.2GB | 8% |
| user_feedback | 5 | 1 | 1 (composite: user+date) | 1.2GB | 5% |
| billing_transactions | 4 | 0 | 0 | 0.8GB | 3% |
| rag_documents | 5 | 2 | 1 (on embedding_status) | 2.1GB | 14% |

### Connection pool health

| Pool | Max | Active (avg) | Active (peak) | Idle | Waiting (peak) | Timeout rate | Util (peak) |
|---|---|---|---|---|---|---|---|
| api-gateway → pg | 50 | 18 | 32 | 12 | 3 | 0.05% | 64% |
| user-service → pg | 40 | 22 | 35 | 8 | 2 | 0.02% | 88% |
| payment → pg | 30 | 8 | 15 | 12 | 1 | 0.01% | 50% |
| search → es | 30 | 15 | 25 | 5 | 4 | 0.12% | 83% |
| notification → pg | 20 | 6 | 10 | 8 | 0 | 0% | 50% |
| analytics → pg-analytics | 20 | 12 | 18 | 4 | 2 | 0.08% | 90% |
| rag → mongo | 30 | 10 | 18 | 10 | 1 | 0.02% | 60% |

### Replication status

| Replica | Lag (current) | Lag (peak 24h) | WAL size | Sync mode | Data consistency |
|---|---|---|---|---|---|
| pg-replica-1 | 0.2s | 1.5s | 45MB | Async | Passed |
| pg-replica-2 | 0.3s | 2.1s | 52MB | Async | Passed |
| pg-analytics | 1.2s | 8.5s | 180MB | Async | Passed |
| redis-replica | 0s | 0.1s | N/A | Async | Passed |
| mongo-replica-1 | 0.1s | 0.8s | N/A | Async | Passed |

### Backup status

| Database | Last full | Last incremental | WAL archive | RPO | RTO target | RTO tested | Retention |
|---|---|---|---|---|---|---|---|
| pg-primary | 2h ago (4h schedule) | 15 min ago | Continuous | < 1 min | < 15 min | 12 min (Jul 15) | 30 days |
| redis-primary | 6h ago (6h schedule) | N/A | 15 min snapshot | < 15 min | < 10 min | 8 min (Jul 15) | 7 days |
| mongo-primary | 4h ago (6h schedule) | 30 min ago | Continuous | < 1 min | < 20 min | 15 min (Jul 15) | 30 days |
| elasticsearch | 24h ago (daily) | N/A | Snapshot repo | < 24 hours | < 1 hour | 45 min (Jun 15) | 14 days |

### Storage and capacity

| Instance | Total | Used | Free | Growth/week | Days until full | Auto-scale |
|---|---|---|---|---|---|---|
| pg-primary | 1TB | 450GB (45%) | 550GB | +12GB | 45 weeks | Yes |
| pg-analytics | 2TB | 820GB (41%) | 1.18TB | +28GB | 42 weeks | Yes |
| redis-primary | 64GB | 28GB (44%) | 36GB | +2GB | 18 weeks | Yes |
| mongo-primary | 500GB | 120GB (24%) | 380GB | +5GB | 76 weeks | Yes |
| elasticsearch | 1TB | 380GB (38%) | 620GB | +15GB | 41 weeks | Yes |

### Database migration status

| Migration | From | To | Status | Rows | Duration | Rollback |
|---|---|---|---|---|---|---|
| add_user_preferences_jsonb | v1 | v2 | Complete | 2.4M | 8 min | Tested |
| split_events_by_month | v1 | v2 | Running | 12.8M | 45 min | Tested |
| add_llm_cost_index | v1 | v2 | Pending | N/A | Est. 5 min | Tested |
| normalize_feedback_schema | v1 | v2 | Pending | 1.2M | Est. 12 min | Tested |

## Action recommendations

1. **Fix top slow queries**: add trigram index for user search (4.2/hr slow); add materialized view for analytics (3.8/hr slow)
2. **Clean unused indexes**: 6 unused indexes across all tables; drop to save storage and write overhead
3. **Reduce index bloat**: events table at 18% bloat; schedule VACUUM FULL during maintenance window
4. **Address replication lag**: pg-analytics at 1.2s avg, 8.5s peak; investigate heavy analytics queries
5. **Increase connection pool**: user-service at 88% peak utilization; add 10 connections or implement queue
6. **Monthly restore test**: last restore test was Jul 15; schedule August test within 1 week
7. **Analytics query optimization**: analytics-svc P95 at 450ms is too high; implement materialized views + caching
8. **Elasticsearch backup**: 24-hour RPO is too high for search; increase snapshot frequency to 6 hours



- N+1 queries → ORM lazy loading generates hundreds of queries per request; use eager loading and query batching
- Missing indexes → full table scans on production; every slow query should trigger an index review
- Connection pool exhaustion → running out of connections at peak; monitor pool utilization, not just count
- Untested backups → backup job runs but restore never verified; monthly restore test is mandatory
- Analytics on primary → heavy analytical queries on the primary database; use read replicas or dedicated analytics store

## Related

- Same class: [dashboard-system-health](../../oncall-sre/observability/dashboard-system-health.md) — system health
- Same class: [dashboard-cost-and-resource](../../oncall-sre/observability/dashboard-cost-and-resource.md) — cost tracking
- Downstream: [data-migration](data-migration.md) — data migration guide
- Upstream: [dashboard-architecture-health](../architecture-design/dashboard-architecture-health.md) — architecture health
- References: PostgreSQL — *Performance Optimization Guide*; Baron Schwartz et al. — *High Performance MySQL*; Redis — *Administration Guide*
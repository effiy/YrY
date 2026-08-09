---
title: data quality dashboard
aliases:
- data quality health dashboard
- DQ dashboard
- data reliability dashboard
- data freshness dashboard
tags:
- dashboard
- data-quality
- data-reliability
- data-freshness
- data-completeness
- data-accuracy
- data-lineage
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
- engineer
- ai-engineer
- tech-lead
benefit: data quality, reliability, and freshness visible at a glance across all data assets
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- completeness, accuracy, consistency, timeliness, uniqueness, and validity defined
related:
- ./dashboard-data-pipeline.md
- ./dashboard-data-governance.md
- ../../engineer/infrastructure/dashboard-database-performance.md
- ../platform/dashboard-ai-performance.md
- ../../engineer/quality-security/dashboard-quality-metrics.md
tacit: false
---

# data quality dashboard

> **As a** data engineer, **I want to** track data quality across all data assets, **so that** every dataset is complete, accurate, consistent, timely, unique, and valid — ensuring that downstream decisions, ML models, and analytics are built on trustworthy data, not garbage.

> Data quality is the foundation of every data-driven decision. This dashboard tracks the six dimensions of data quality — completeness, accuracy, consistency, timeliness, uniqueness, and validity — across 285 datasets, 1,850 pipeline runs/day, and 42 data sources, turning data quality from a reactive "the numbers look wrong" fire drill into a continuously measured, proactively maintained data reliability practice.

## Summary

- 6 data quality dimensions: completeness, accuracy, consistency, timeliness, uniqueness, validity
- 285 datasets across 42 data sources; 1,850 pipeline runs/day; 8.5 TB data processed daily; 12 data domains
- Completeness: 94.2% overall (target 98%); 8.5% of fields have > 5% null rate; 12 critical datasets with < 90% completeness
- Accuracy: 96.8% field-level accuracy; 3.2% of values fail validation rules; 285 accuracy rules defined; 42 rules failing regularly
- Consistency: 92% cross-source consistency; 185 cross-source reconciliation checks; 28 reconciliation failures in last 30 days
- Timeliness: 94% of datasets within freshness SLA; avg data delay: 18 min (target < 5 min); 15 datasets consistently late
- Dashboard reviewed weekly; data quality sprint monthly with data engineering and domain owners

## Core viewpoints

- Data quality is a product feature, not a back-office concern — if your ML model trains on bad data, it produces bad predictions; if your dashboard shows wrong numbers, executives make wrong decisions; data quality is everyone's problem
- The six dimensions are a checklist, not a menu — you can't pick "accuracy" and ignore "timeliness"; a perfectly accurate dataset that's 3 days late is useless for real-time decisions; measure all six
- Data quality decays over time — a dataset that was 99% complete last month can be 85% complete today if the upstream source changed; data quality is not a one-time validation, it's continuous monitoring
- Null is not the same as zero — a null value means "I don't know," a zero means "nothing"; treating nulls as zeros is the most common and most dangerous data quality mistake

## Key information

### 6-panel data quality overview

```
┌──────────────────────────────────────────────────────────────────┐
│  COMPLETENESS                       │  ACCURACY                           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Overall: 94.2%          │   │  │  Field accuracy: 96.8%   │   │
│  │  Null rate > 5%: 8.5%    │   │  │  Validation rules: 285   │   │
│  │  Critical < 90%: 12 ds   │   │  │  Rules failing: 42 (15%) │   │
│  │  Row completeness: 96.5% │   │  │  Range violations: 18    │   │
│  │  Field completeness:93.8%│   │  │  Format violations: 12   │   │
│  │  Required fields: 97.2%  │   │  │  Referential: 8          │   │
│  │  Completeness: B (78)    │   │  │  Accuracy: B+ (82)       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CONSISTENCY                        │  TIMELINESS                         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Cross-source: 92%       │   │  │  Within SLA: 94%         │   │
│  │  Reconciliation checks:  │   │  │  Avg delay: 18 min        │   │
│  │  185 total, 28 failing   │   │  │  Consistently late: 15 ds │   │
│  │  Schema drift: 8 events  │   │  │  Freshness SLA breach:6% │   │
│  │  Type mismatch: 12       │   │  │  Stale (>24h): 8 ds      │   │
│  │  Business rule: 15 fails │   │  │  Real-time (< 1min): 62% │   │
│  │  Consistency: B- (72)    │   │  │  Timeliness: B (78)      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  UNIQUENESS                         │  VALIDITY                           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Duplicate rate: 2.2%    │   │  │  Overall validity: 97.5% │   │
│  │  PK violations: 15 ds    │   │  │  Type checks: 98.2%      │   │
│  │  Dedup savings: 420 GB   │   │  │  Format checks: 96.5%    │   │
│  │  Near-duplicates: 3.5%   │   │  │  Range checks: 97.8%     │   │
│  │  Entity resolution: 85%  │   │  │  Business rules: 95.2%   │   │
│  │  Merge candidates: 28K   │   │  │  Cross-field: 94.5%      │   │
│  │  Uniqueness: B- (72)     │   │  │  Validity: B+ (82)       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Data quality by domain

| Domain | Datasets | Completeness | Accuracy | Consistency | Timeliness | Uniqueness | Validity | Overall DQ |
|---|---|---|---|---|---|---|---|---|
| **User/Identity** | 35 | 96.5% | 97.2% | 94% | 92% | 95% | 98.5% | A- (88) |
| **Product/Usage** | 42 | 93.8% | 95.5% | 91% | 95% | 93% | 96.8% | B+ (82) |
| **Billing/Revenue** | 28 | 98.2% | 99.1% | 97% | 98% | 98% | 99.2% | A (92) |
| **AI/ML Training** | 38 | 91.5% | 94.2% | 88% | 90% | 92% | 95.5% | C+ (68) |
| **Analytics/BI** | 45 | 93.2% | 96.0% | 92% | 94% | 91% | 97.0% | B (78) |
| **Logs/Events** | 32 | 88.5% | 95.0% | 85% | 96% | 90% | 94.0% | C+ (65) |
| **Customer Support** | 18 | 94.0% | 96.5% | 93% | 91% | 94% | 97.5% | B+ (82) |
| **Marketing** | 22 | 92.0% | 94.8% | 90% | 89% | 91% | 96.0% | B- (72) |
| **Security/Audit** | 15 | 97.5% | 98.5% | 96% | 97% | 98% | 99.0% | A- (90) |
| **Infrastructure** | 28 | 91.8% | 96.2% | 90% | 95% | 93% | 96.5% | B (78) |
| **Third-party** | 12 | 89.0% | 93.5% | 85% | 82% | 88% | 94.0% | C (65) |
| **Experimental** | 10 | 85.0% | 92.0% | 82% | 88% | 90% | 93.0% | C (62) |
| **Overall** | **285** | **94.2%** | **96.8%** | **92%** | **94%** | **93%** | **97.5%** | **B (78)** |

### Completeness — top problem datasets

| Dataset | Domain | Row completeness | Field completeness | Null rate | Critical fields null | Root cause | Action |
|---|---|---|---|---|---|---|---|
| **user_events_raw** | Logs/Events | 88.5% | 82.0% | 18% | user_id (12%), event_type (8%) | Client-side SDK drops events on error | Add retry with exponential backoff |
| **ml_training_labels** | AI/ML | 91.5% | 85.0% | 15% | label (10%), annotator_id (5%) | Human annotators skip difficult cases | Flag for review, not skip |
| **third_party_enrichment** | Third-party | 89.0% | 78.0% | 22% | company_size (15%), industry (12%) | API rate limits cause partial enrichment | Batch enrichment, retry queue |
| **product_impressions** | Product/Usage | 92.0% | 88.0% | 12% | session_id (8%), referrer (5%) | Ad-blocker strips tracking params | Server-side impression tracking |
| **experiment_metrics** | Experimental | 85.0% | 80.0% | 20% | variant (12%), conversion (8%) | Experiment SDK not initialized in all code paths | Enforce SDK init in build pipeline |

### Accuracy — failing validation rules

| Rule | Dataset | Failures/mo | False positive rate | Impact | Root cause | Action |
|---|---|---|---|---|---|---|
| **email format validation** | user_contacts | 12,500 | 2% | Email delivery failures | Users enter invalid emails | Client-side validation + verification |
| **revenue > 0 for paid users** | billing_transactions | 850 | 0.5% | Revenue reporting error | Credits applied after transaction recorded | Fix credit transaction ordering |
| **age between 0-120** | user_profiles | 3,200 | 5% | Analytics skew | Default date (1970-01-01) for unknown | Separate "unknown" from default |
| **order total = sum(items)** | orders | 420 | 1% | Financial reconciliation | Rounding differences in tax calculation | Use decimal type, round consistently |
| **URL format valid** | page_views | 28,000 | 8% | Traffic analysis | Bot traffic with malformed URLs | URL normalization, bot filtering |
| **timestamp not in future** | events | 1,850 | 3% | Event ordering | Clock skew on client devices | Server-side timestamp, NTP check |
| **JSON schema valid** | api_logs | 8,500 | 10% | Pipeline failures | API version mismatch, schema evolution | Schema registry with backward compat |

### Consistency — cross-source reconciliation

| Reconciliation check | Source A | Source B | Expected match | Actual match | Gap | Root cause |
|---|---|---|---|---|---|---|
| **Daily active users** | Analytics DB | CRM | 100% | 94% | 6% | CRM counts deleted users, Analytics doesn't |
| **Monthly revenue** | Billing DB | Accounting | 100% | 98.5% | 1.5% | Exchange rate timing difference |
| **New signups** | Auth service | Growth dashboard | 100% | 92% | 8% | Bot signups filtered in dashboard, not in auth |
| **API calls** | Gateway logs | Billing metering | 100% | 95% | 5% | Gateway counts failed requests, billing doesn't |
| **Storage usage** | S3 metrics | Billing | 100% | 97% | 3% | Versioned objects counted differently |
| **Model predictions** | Inference service | Monitoring DB | 100% | 91% | 9% | Batch predictions not logged to monitoring |
| **Support tickets** | Helpdesk | Data warehouse | 100% | 96% | 4% | Ticket merge not reflected in warehouse |
| **Deploy events** | CI/CD | Change management | 100% | 88% | 12% | Manual deploys bypass change management |

### Timeliness — data freshness SLA

| Dataset | SLA | Actual delay (P50) | Actual delay (P95) | SLA breach rate | Consecutive breaches | Impact |
|---|---|---|---|---|---|---|
| **user_events** | 5 min | 3 min | 18 min | 8% | 3 | Real-time personalization stale |
| **billing_transactions** | 15 min | 8 min | 25 min | 5% | 0 | Revenue dashboard delayed |
| **ml_features** | 30 min | 22 min | 65 min | 12% | 5 | Model serving stale features |
| **experiment_results** | 1 hour | 45 min | 2.5 hours | 15% | 8 | A/B test decisions delayed |
| **third_party_data** | 4 hours | 2.5 hours | 8 hours | 18% | 12 | Enrichment data stale |
| **daily_aggregates** | 6 hours | 4 hours | 10 hours | 8% | 2 | Daily reports delayed |
| **weekly_report** | 24 hours | 18 hours | 36 hours | 10% | 1 | Weekly business review |
| **audit_logs** | 1 hour | 30 min | 2 hours | 5% | 0 | Compliance risk |

### Uniqueness — duplicate detection

| Dataset | Total rows | Duplicates | Duplicate % | Near-duplicates | PK violations | Dedup method |
|---|---|---|---|---|---|---|
| **user_profiles** | 2.1M | 18,500 | 0.9% | 12,000 | 0 | Email + phone fuzzy match |
| **product_events** | 850M | 28M | 3.3% | 42M | 15,000 | Event ID + timestamp + user |
| **transactions** | 12M | 850 | 0.007% | 2,500 | 0 | Transaction ID exact match |
| **customer_contacts** | 850K | 22,000 | 2.6% | 8,500 | 0 | Email exact, name fuzzy |
| **api_logs** | 2.5B | 85M | 3.4% | 120M | 28,000 | Request ID + timestamp |
| **marketing_leads** | 450K | 15,000 | 3.3% | 22,000 | 0 | Email + company fuzzy |
| **inventory_items** | 85K | 1,200 | 1.4% | 3,500 | 0 | SKU exact match |
| **experiment_assignments** | 28M | 420K | 1.5% | 850K | 8,500 | User ID + experiment ID |

### Validity — by check type

| Check type | Rules | Pass rate | Failing rules | Top failure | Impact |
|---|---|---|---|---|---|
| **Type check** (int, string, date) | 85 | 98.2% | 2 | "status" field: string "null" instead of NULL | Schema enforcement |
| **Format check** (regex, pattern) | 62 | 96.5% | 3 | Phone numbers: 12 formats detected | Normalization needed |
| **Range check** (min, max, enum) | 58 | 97.8% | 2 | "discount_percent": values > 100% | Business rule enforcement |
| **Required check** (not null) | 45 | 97.5% | 2 | "email" field: 2.5% null in user_profiles | Completeness overlap |
| **Referential integrity** (FK) | 28 | 95.0% | 3 | "team_id": 5% point to deleted teams | Cascading deletes |
| **Business rule** (custom logic) | 35 | 95.2% | 3 | "end_date > start_date": 2.8% violation | Data entry validation |
| **Cross-field** (field A → field B) | 22 | 94.5% | 2 | "country" vs "currency": 3.5% mismatch | Enrichment data quality |
| **Overall** | **335** | **97.5%** | **17** | | |

### Data quality incidents (last 30 days)

| Incident | Date | Duration | Datasets affected | Severity | Root cause | Resolution |
|---|---|---|---|---|---|---|
| **user_events pipeline stall** | 2026-08-04 | 4.5 hours | 12 | P1 | Kafka consumer group rebalance storm | Increased session timeout, reduced max.poll.records |
| **Revenue data mismatch** | 2026-07-28 | 2 hours | 8 | P1 | Exchange rate cache expiry during currency switch | Pre-warm cache before expiry |
| **ML feature null spike** | 2026-07-22 | 6 hours | 5 | P2 | Upstream API changed response format | Schema validation, versioned API |
| **Duplicate transaction batch** | 2026-07-18 | 3 hours | 3 | P2 | Idempotency key not enforced in retry | Enforce idempotency, dedup at ingestion |
| **Schema drift in product events** | 2026-07-12 | 8 hours | 8 | P2 | New field added without schema registry update | Auto-register new fields, quarantine unknown |

### Data quality monitoring coverage

| Monitoring type | Datasets covered | Coverage % | Detection method | Detection latency | Alert enabled |
|---|---|---|---|---|---|
| **Freshness checks** | 265/285 | 93% | Last-modified timestamp vs SLA | 5 min avg | Yes |
| **Volume checks** | 258/285 | 91% | Row count vs 7-day rolling avg | 10 min avg | Yes |
| **Null rate checks** | 242/285 | 85% | Per-column null % vs threshold | 15 min avg | Yes |
| **Schema checks** | 275/285 | 96% | Schema Registry vs actual | On change | Yes |
| **Distribution checks** | 185/285 | 65% | KS test vs baseline | 30 min avg | Partial |
| **Cross-source reconciliation** | 185 checks | — | Source A vs Source B | 1 hour avg | Yes |
| **Custom business rules** | 95 rules | — | SQL-based assertions | 30 min avg | Yes |
| **ML data validation** | 42/285 | 15% | TFDV / Great Expectations | 1 hour avg | Partial |

## Action recommendations

1. **Log/events completeness improvement**: 88.5% row completeness, 18% null rate; fix client-side SDK retry logic, add server-side event capture as fallback, target 95% completeness
2. **Third-party data freshness**: 18% SLA breach, 82% timeliness; implement retry queue with exponential backoff, add circuit breaker for failing APIs, batch enrichment during low-traffic windows
3. **ML training data quality**: 91.5% completeness, 88% consistency; add data validation in ML pipeline (TFDV), flag low-quality labels for review, target 95% completeness
4. **Duplicate reduction**: 2.2% duplicate rate, 28M duplicate events/month; implement idempotency keys, add dedup at ingestion, target < 1% duplicate rate
5. **Cross-source reconciliation gaps**: 28 failing checks; fix top 8 reconciliation gaps (account for 72% of discrepancies), automate reconciliation alerts
6. **Schema drift prevention**: 8 schema drift events in 30 days; enforce schema registry for all data producers, quarantine data with unknown fields, auto-notify data owners
7. **Validation rule maintenance**: 42 failing rules (15%); review each failing rule, fix false positives (adjust thresholds), fix true positives (fix data source), target < 5% failing
8. **Data quality monitoring expansion**: 65% distribution coverage, 15% ML validation coverage; add distribution checks to all critical datasets, implement TFDV for all ML datasets
9. **Experimental data quality**: 85% completeness, C grade; enforce experiment SDK initialization, add server-side assignment tracking, validate experiment configurations
10. **Weekly data quality review**: review completeness, accuracy, consistency, timeliness, uniqueness, and validity with data engineering, domain owners, and ML engineers



- The "we'll clean it later" deferral → ingesting messy data now with the promise of cleaning it later; "later" never comes, and the mess compounds — every downstream consumer builds their own cleaning logic, creating 12 versions of "the truth"
- Quality as a gatekeeper → using data quality checks to block pipelines instead of to alert and quarantine; blocking pipelines creates data delays, and data delays are worse than imperfect data for most use cases
- The one-dimensional quality score → reducing data quality to a single number like "98.2% quality"; a dataset can be 100% complete but 50% accurate — a single score hides which dimension is failing
- Null-as-zero fallacy → replacing nulls with zeros, empty strings, or default dates without tracking that you did so; downstream consumers can't distinguish "real zero" from "missing data," and every analysis is silently wrong
- Monitoring without ownership → setting up data quality checks but not assigning owners for each dataset; when a check fails, nobody is responsible for fixing it, and alerts become background noise

## Related

- Same class: [dashboard-data-pipeline](dashboard-data-pipeline.md) — data pipeline health
- Same class: [dashboard-data-governance](dashboard-data-governance.md) — data governance
- Same class: [dashboard-database-performance](../../engineer/infrastructure/dashboard-database-performance.md) — database performance
- Same class: [dashboard-ai-performance](../platform/dashboard-ai-performance.md) — AI performance
- Same class: [dashboard-quality-metrics](../../engineer/quality-security/dashboard-quality-metrics.md) — quality metrics
- References: Google — *Data Quality Framework*; Amazon — *The 6 Dimensions of Data Quality*; Monte Carlo — *Data Observability Framework*; Great Expectations — *Data Validation Best Practices*; dbt — *Data Quality Testing Guide*; Barr Moses — *Data Quality Management*
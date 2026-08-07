---
title: feature store health dashboard
aliases:
- feature store dashboard
- ML feature health dashboard
- feature engineering dashboard
- feature pipeline dashboard
tags:
- dashboard
- feature-store
- ml-features
- feature-engineering
- training-serving-skew
- feature-freshness
- feast
- tecton
category: ai-engineer/data
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
- ml-engineer
benefit: feature store health, feature freshness, and training-serving consistency visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- feature registry, feature freshness, training-serving skew, feature quality, storage efficiency, and serving performance defined
related:
- ./dashboard-data-quality.md
- ./dashboard-data-pipeline.md
- ../platform/dashboard-ai-performance.md
- ../platform/dashboard-vector-database-health.md
- ../../engineer/engineering/dashboard-ml-operations.md
tacit: false
---

# feature store health dashboard

> **As an** ML engineer, **I want to** track feature store health and feature quality, **so that** every ML model is trained and served with consistent, fresh, high-quality features — turning feature engineering from a tangled mess of ad-hoc pipelines into a governed, reusable, and trustworthy feature platform.

> The feature store is the bridge between data engineering and ML. This dashboard tracks feature registry health, feature freshness, training-serving skew, feature quality, storage efficiency, and serving performance — turning feature management from "which version of this feature is in production?" guesswork into a measured, governed, and continuously improving ML infrastructure practice.

## Summary

- 6 feature store dimensions: feature registry, feature freshness, training-serving skew, feature quality, storage efficiency, serving performance
- 850 features across 12 feature groups; 8 feature views (model-specific feature sets); 3.2B feature values served/day; 42 feature sources
- Feature registry: 850 registered features; 78% with owners; 15% orphaned/unowned; 8 duplicate features (same logic, different names); 12 features with no description
- Feature freshness: 82% of features within freshness SLA; avg feature staleness: 4.5 hours (target < 2 hours); 15 features consistently stale (> 12 hours)
- Training-serving skew: 5.5% avg skew across features; 12 features with > 10% skew; 3 features with > 25% skew (critical); skew detection coverage: 68%
- Dashboard reviewed weekly; feature store optimization sprint monthly with ML engineering

## Core viewpoints

- Features are ML's data contracts — a feature is not just a column in a DataFrame; it's a contract between the data pipeline that produces it and the model that consumes it; when the contract breaks (different logic in training vs serving), the model silently degrades
- Training-serving skew is the silent model killer — a model trained on `user_age` from a batch pipeline that runs daily but served with `user_age` from a real-time cache can be 6 months out of date; the model thinks it's making predictions on 30-year-olds but the feature is delivering 30-year-old data
- Feature reuse is the ROI of a feature store — if 5 models all need `user_30day_transaction_count`, building it once and reusing it 5 times is 5× ROI; but if 3 teams build it 3 different ways with 3 different names, the feature store is just an expensive database
- Point-in-time correctness is harder than it sounds — when training a model on historical data, you need the feature values as they were at the time of the prediction, not as they are now; time travel is the hardest problem in feature engineering

## Key information

### 6-panel feature store overview

```
┌──────────────────────────────────────────────────────────────────┐
│  FEATURE REGISTRY                    │  FEATURE FRESHNESS                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Registered features:850│   │  │  Within SLA: 82% (697)   │   │
│  │  Feature groups: 12      │   │  │  Avg staleness: 4.5h    │   │
│  │  Feature views: 8        │   │  │  Consistently stale: 15 │   │
│  │  With owners: 78% (663)  │   │  │  Batch features: 65%    │   │
│  │  Orphaned: 15% (128)     │   │  │  Streaming features: 25%│   │
│  │  Duplicates: 8 (0.9%)    │   │  │  Real-time features: 10%│   │
│  │  Registry score: B (78)  │   │  │  Freshness score: B-(72)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TRAINING-SERVING SKEW               │  FEATURE QUALITY                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Avg skew: 5.5%          │   │  │  Null rate: 3.5% avg     │   │
│  │  Features > 10% skew: 12│   │  │  Outlier rate: 2.8%      │   │
│  │  Features > 25% skew: 3 │   │  │  Distribution drift: 15  │   │
│  │  Skew detection: 68% cov│   │  │  features with drift     │   │
│  │  Skew incidents: 5/mo    │   │  │  Cardinality issues: 8   │   │
│  │  Model impact: 3 models  │   │  │  features                │   │
│  │  degraded by skew        │   │  │  Quality score: B (78)   │   │
│  │  Skew score: C+ (68)     │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  STORAGE EFFICIENCY                  │  SERVING PERFORMANCE                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total stored: 18.5 TB   │   │  │  QPS: 28,500 avg         │   │
│  │  Online store: 2.8 TB    │   │  │  P50 latency: 8ms        │   │
│  │  Offline store: 15.7 TB  │   │  │  P95 latency: 35ms       │   │
│  │  Unused features: 12%    │   │  │  P99 latency: 85ms       │   │
│  │  Feature TTL violations: │   │  │  Timeout rate: 0.5%      │   │
│  │  18% of features         │   │  │  Cache hit rate: 78%     │   │
│  │  Storage score: B- (72)  │   │  │  Serving score: B+ (82)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Feature registry health

| Feature group | Features | Owner | Description coverage | Duplicates | Used by models | Last updated | Health |
|---|---|---|---|---|---|---|---|
| **user_profile** | 85 | data-team | 92% | 1 | 12 models | 2026-07-28 | A- (88) |
| **user_behavior** | 120 | ml-team | 85% | 2 | 18 models | 2026-07-25 | B+ (82) |
| **transaction_history** | 95 | data-team | 90% | 0 | 8 models | 2026-07-30 | A- (90) |
| **product_catalog** | 65 | product-team | 78% | 1 | 5 models | 2026-07-20 | B (78) |
| **content_embeddings** | 55 | ai-team | 88% | 0 | 10 models | 2026-07-28 | A- (88) |
| **real_time_events** | 85 | ml-team | 72% | 2 | 15 models | 2026-07-22 | B- (72) |
| **search_features** | 45 | search-team | 80% | 0 | 3 models | 2026-07-18 | B (80) |
| **recommendation_features** | 72 | recs-team | 75% | 1 | 6 models | 2026-07-25 | B (78) |
| **risk_fraud_features** | 58 | security-team | 82% | 0 | 4 models | 2026-07-15 | B+ (82) |
| **nlp_features** | 42 | ai-team | 90% | 0 | 7 models | 2026-07-28 | A- (88) |
| **experimental_features** | 38 | **Orphaned** | 35% | 1 | 2 models | 2026-05-10 | D (55) |
| **legacy_features** | 90 | **Orphaned** | 25% | 0 | 5 models | 2026-03-15 | F (45) |

### Feature freshness by type

| Feature type | Count | SLA | Within SLA | Avg staleness | Worst staleness | Stale features | Action |
|---|---|---|---|---|---|---|---|
| **Real-time** (streaming, < 1 min) | 85 | 1 min | 88% | 45s | 5 min (8 features) | 10 | Increase streaming throughput, reduce lag |
| **Near-real-time** (micro-batch, < 15 min) | 128 | 15 min | 78% | 12 min | 45 min (15 features) | 28 | Optimize micro-batch window, add monitoring |
| **Batch hourly** (< 2 hours) | 185 | 2 hours | 82% | 2.5 hours | 8 hours (22 features) | 33 | Parallelize batch jobs, add freshness alert |
| **Batch daily** (< 6 hours) | 285 | 6 hours | 85% | 5.5 hours | 18 hours (18 features) | 42 | Optimize ETL, add incremental processing |
| **Batch weekly** (< 12 hours) | 95 | 12 hours | 75% | 15 hours | 36 hours (12 features) | 24 | Schedule during low-load, add backfill |
| **On-demand** (computed at request) | 72 | 500ms | 92% | 350ms | 2s (5 features) | 6 | Add caching, pre-compute common features |

### Training-serving skew by feature

| Feature | Skew % | Training source | Serving source | Distribution divergence | Model impact | Root cause | Action |
|---|---|---|---|---|---|---|---|
| **user_30day_transaction_count** | 28% | Batch (daily aggregate) | Real-time (streaming) | KL divergence: 0.45 | High (fraud model -8% precision) | Batch uses completed transactions, streaming includes pending | Unify to completed-only, add pending flag |
| **product_category_embedding** | 22% | Offline (v2 model) | Online (v1 model) | Cosine distance: 0.35 | High (search model -5% recall) | Embedding model version mismatch | Upgrade serving to v2, add version check |
| **user_session_features** | 18% | Batch (hourly) | Real-time (last 5 min) | KS statistic: 0.28 | Medium (recs model -3% CTR) | Batch uses full session, real-time uses partial | Use consistent session window (30 min) |
| **merchant_risk_score** | 12% | Offline (daily model) | Online (weekly model) | AUC drift: 0.08 | Medium (risk model -2% precision) | Different model retrain cadence | Align retrain schedules, use same model version |
| **item_popularity_score** | 10% | Batch (daily) | Cache (hourly refresh) | Mean shift: 15% | Low (recs model -1% diversity) | Cache serving stale scores during peak | Increase cache refresh to 15 min |
| **user_device_type** | 8% | Batch (user profile) | Real-time (request header) | Categorical mismatch: 5% | Low (minor feature) | User-agent parsing differs between batch and real-time | Use same parsing library, normalize |

### Feature quality metrics

| Feature group | Null rate | Outlier rate | Distribution drift | Cardinality issues | Min-max violation | Quality score |
|---|---|---|---|---|---|---|
| **user_profile** | 2.5% | 1.8% | 3 features drifting | 0 | 2 features (age > 150) | B+ (82) |
| **user_behavior** | 5.0% | 3.2% | 5 features drifting | 2 (high cardinality) | 1 feature (negative count) | B- (72) |
| **transaction_history** | 1.2% | 2.5% | 1 feature drifting | 0 | 0 | A- (88) |
| **product_catalog** | 8.5% | 2.0% | 2 features drifting | 0 | 3 features (negative price) | C+ (68) |
| **content_embeddings** | 0.5% | 1.5% | 0 features drifting | 0 | 0 | A (92) |
| **real_time_events** | 12.0% | 5.5% | 4 features drifting | 3 (high cardinality) | 2 features (future timestamp) | D (58) |
| **search_features** | 2.0% | 1.8% | 1 feature drifting | 0 | 0 | B+ (85) |
| **recommendation_features** | 3.5% | 2.5% | 2 features drifting | 1 | 1 feature | B (78) |
| **risk_fraud_features** | 4.0% | 3.0% | 0 features drifting | 0 | 0 | B+ (82) |
| **nlp_features** | 1.0% | 1.2% | 0 features drifting | 0 | 0 | A- (90) |
| **experimental_features** | 15.0% | 8.0% | 6 features drifting | 2 | 5 features | F (42) |
| **legacy_features** | 18.0% | 10.0% | 8 features drifting | 5 | 8 features | F (38) |

### Feature serving performance

| Serving store | Features | QPS | P50 latency | P95 latency | P99 latency | Cache hit rate | Timeout rate | Health |
|---|---|---|---|---|---|---|---|---|
| **Redis (online)** | 285 | 18,500 | 5ms | 22ms | 55ms | 82% | 0.3% | A- (88) |
| **DynamoDB (online)** | 185 | 8,500 | 12ms | 45ms | 95ms | 68% | 0.8% | B (80) |
| **BigQuery (offline)** | 380 | 1,500 | 850ms | 3.5s | 8.5s | 0% | 2.5% | C+ (68) |
| **Feature server (gRPC)** | 520 | 22,000 | 8ms | 35ms | 85ms | 78% | 0.5% | B+ (82) |
| **Overall** | **850** | **28,500** | **8ms** | **35ms** | **85ms** | **78%** | **0.5%** | **B+ (82)** |

### Feature reuse and ROI

| Feature | Defined by | Used by models | Reuse count | Duplicate of | Cost to build | Savings from reuse | ROI |
|---|---|---|---|---|---|---|---|
| **user_30day_transaction_count** | data-team | 12 models | 11× reuse | 1 duplicate | $8,500 | $93,500 | 11× |
| **product_embedding_256** | ai-team | 10 models | 9× reuse | 0 | $15,000 | $135,000 | 9× |
| **user_churn_probability** | ml-team | 8 models | 7× reuse | 2 duplicates | $12,000 | $84,000 | 7× |
| **session_duration_avg** | data-team | 7 models | 6× reuse | 0 | $5,000 | $30,000 | 6× |
| **item_ctr_30day** | recs-team | 6 models | 5× reuse | 1 duplicate | $6,500 | $32,500 | 5× |
| **merchant_category_encoded** | data-team | 5 models | 4× reuse | 0 | $4,000 | $16,000 | 4× |
| **user_device_features** | ml-team | 5 models | 4× reuse | 0 | $3,500 | $14,000 | 4× |
| **text_sentiment_score** | ai-team | 7 models | 6× reuse | 0 | $9,000 | $54,000 | 6× |

## Action recommendations

1. **Training-serving skew elimination**: 3 features with > 25% skew degrading 3 models; fix `user_30day_transaction_count` (unify batch/streaming logic), align embedding model versions, add automated skew detection for all features
2. **Feature freshness improvement**: 15 features consistently stale, 18% of features exceed freshness SLA; implement freshness monitoring and alerting, add auto-backfill for stale features, target 90% within SLA
3. **Orphaned feature cleanup**: 128 orphaned features (15%); assign owners to all unowned features, archive experimental and legacy groups (128 features, 12% storage), target 95% ownership
4. **Duplicate feature consolidation**: 8 duplicate features; merge duplicates, enforce feature uniqueness check in registry, add feature discovery before creation, target 0 duplicates
5. **Real-time event quality**: 12% null rate, 5.5% outlier rate, D grade; add input validation, schema enforcement, outlier detection, and dead-letter queue for malformed events
6. **Feature TTL enforcement**: 18% of features violate TTL; implement automated TTL-based cleanup, add TTL to feature registration, enforce TTL before serving
7. **Skew detection coverage**: 68% coverage; implement automated skew detection (KL divergence, KS test, PSI) for all features, alert at > 10% skew, block serving at > 25% skew
8. **Offline serving latency**: 850ms P50 for BigQuery; add pre-computed feature views, implement feature materialization, add caching layer for offline features, target P50 < 200ms
9. **Feature documentation**: 12 features with no description, 25% of legacy features undocumented; require description, owner, SLA, and example at registration, add documentation linting
10. **Weekly feature store review**: review feature registry, freshness, training-serving skew, quality, storage, and serving performance with ML and data engineering



- The feature factory → creating features because you can, not because they're predictive; 850 features but only 350 are used by at least one model — the other 500 are costing storage, compute, and freshness monitoring without delivering value
- Training-serving skew as an afterthought → using different code paths for training and serving feature computation; "the training pipeline is in Spark and the serving pipeline is in Go" — if the logic isn't identical, the model is training on features that don't exist in production
- Point-in-time ignorance → training models on "latest" feature values without considering when those values were actually available; a model that uses `user_30day_transaction_count` as of today to predict a churn event from 3 months ago is cheating — it's using future information
- The feature store as a data lake → dumping raw data into the feature store without transformation; the feature store is for features (transformed, aggregated, predictive signals), not raw data — if you're storing raw clickstreams, you've built a data lake, not a feature store
- Feature versioning by filename → renaming `user_age_v2` to `user_age_v3` when the logic changes; feature versions should be managed by the feature store, not by naming conventions — `user_age` should always point to the current version, and models should pin to specific versions

## Related

- Same class: [dashboard-data-quality](dashboard-data-quality.md) — data quality
- Same class: [dashboard-data-pipeline](dashboard-data-pipeline.md) — data pipeline health
- Same class: [dashboard-ai-performance](../platform/dashboard-ai-performance.md) — AI performance
- Same class: [dashboard-vector-database-health](../platform/dashboard-vector-database-health.md) — vector database health
- Same class: [dashboard-ml-operations](../../engineer/engineering/dashboard-ml-operations.md) — ML operations
- References: Feast — *Feature Store Best Practices*; Tecton — *Feature Engineering at Scale*; Uber — *Michelangelo Feature Store*; Google — *ML Feature Store Design*; Airbnb — *Zipline Feature Store*; Eugene Yan — *Feature Stores for ML*
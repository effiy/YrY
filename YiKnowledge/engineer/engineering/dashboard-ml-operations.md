---
title: ml operations dashboard
aliases:
- MLOps dashboard
- model lifecycle dashboard
- ml pipeline dashboard
- model deployment dashboard
tags:
- dashboard
- mlops
- ml
- model-lifecycle
- training
- inference
- model-registry
category: engineer/engineering
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- ai-engineer
- tech-lead
benefit: ML model lifecycle and operations visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../../ai-engineer/platform/dashboard-ai-performance.md
- ../../ai-engineer/platform/evaluate-an-llm-app.md
- ../../ai-engineer/data/dashboard-data-pipeline.md
- ../quality-security/dashboard-quality-metrics.md
tacit: false
---

# ml operations dashboard

> **As a** ml engineer, **I want to** track ML model lifecycle and operations across all models, **so that** model degradation, training failures, and deployment issues are detected and resolved quickly.

> MLOps bridges the gap between model development and production operations. This dashboard tracks model registry, training pipelines, deployment status, inference performance, and monitoring.

## Summary

- 5 MLOps dimensions: model registry, training pipeline, deployment and serving, inference performance, model monitoring
- Model registry tracks all model versions, stages (experimental → staging → production → archived), and lineage
- Training pipeline monitors experiment success rate, GPU utilization, data quality, and training duration
- Deployment tracks canary/rollout status, A/B test configurations, and rollback readiness
- Model monitoring detects data drift, concept drift, prediction skew, and feature importance changes
- Dashboard refreshes per training run; inference metrics near-real-time; drift checks daily

## Core viewpoints

- ML models are not static artifacts — they decay over time as the world changes around them; monitor continuously
- Model registry is the source of truth — every model in production must be traceable to its training data, code, and evaluation results
- Training is an experiment — treat every training run as a tracked experiment with hypothesis, parameters, and results
- Deployment is not the finish line — it's the start of monitoring; production behavior often differs from training behavior

## Key information

### 5-panel MLOps overview

```
┌──────────────────────────────────────────────────────────────────┐
│  MODEL REGISTRY                 │  TRAINING PIPELINE               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:      18 models  │   │  │  This week: 8 runs      │   │
│  │  Production: 6          │   │  │  Success:    87.5%      │   │
│  │  Staging:    4          │   │  │  GPU util:   72%        │   │
│  │  Experiment: 5          │   │  │  Avg time:   45 min     │   │
│  │  Archived:   3          │   │  │  Cost/run:   $12.50     │   │
│  │  Drift:      1 alert    │   │  │  Data qual:  98.5%      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DEPLOYMENT & SERVING           │  INFERENCE PERFORMANCE          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Active deploys: 6      │   │  │  QPS:     2.4k          │   │
│  │  Canary:      1 (10%)   │   │  │  P50:     85ms          │   │
│  │  A/B:         1         │   │  │  P95:     320ms         │   │
│  │  Rollback:    0         │   │  │  Timeout:  0.3%         │   │
│  │  Last deploy: 2h ago    │   │  │  Throttle: 0.1%         │   │
│  │  Shadow:      1         │   │  │  Availability: 99.95%   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Model registry

| Model | Version | Stage | Deployed | Training data | Eval score | Status |
|---|---|---|---|---|---|---|
| chat-quality-classifier | v3.2 | Production | Aug 2 | 2026-Jul feedback | 0.93 F1 | Active |
| chat-quality-classifier | v3.3 | Staging | — | 2026-Aug feedback | 0.94 F1 | Shadow |
| intent-router | v2.1 | Production | Jul 15 | 2026-Jun logs | 0.89 acc | Active |
| intent-router | v2.2 | Experiment | — | 2026-Jul logs | 0.91 acc | Training |
| toxicity-detector | v1.5 | Production | Jun 20 | 2026-May reports | 0.96 F1 | Active |
| code-completion | v4.0 | Production | Aug 1 | 2026-Jul repos | 0.82 BLEU | Active |
| code-completion | v4.1 | Canary (10%) | Aug 5 | 2026-Aug repos | 0.84 BLEU | Canary |
| rag-reranker | v2.0 | Production | Jul 10 | 2026-Q2 queries | 0.88 NDCG | Active |
| rag-reranker | v2.1 | Experiment | — | 2026-Q3 queries | 0.90 NDCG | Evaluating |
| user-embedding | v3.0 | Production | May 15 | 2026-Q1 data | 0.78 cosine | Drift alert |
| user-embedding | v3.1 | Staging | — | 2026-Q2 data | 0.82 cosine | Shadow |
| summary-generator | v1.8 | Production | Jul 22 | 2026-Jun docs | 0.85 ROUGE | Active |
| summary-generator | v1.9 | A/B (50%) | Aug 3 | 2026-Jul docs | 0.87 ROUGE | A/B testing |

### Training pipeline health

| Experiment | Status | Duration | GPU hours | Cost | Best metric | vs Baseline |
|---|---|---|---|---|---|---|
| intent-router v2.2 | Completed | 52 min | 4.2 | $14.20 | 0.91 acc | +2.2% |
| code-completion v4.1 | Completed | 3.2 hr | 28.0 | $84.50 | 0.84 BLEU | +2.4% |
| rag-reranker v2.1 | Completed | 1.8 hr | 14.5 | $48.20 | 0.90 NDCG | +2.3% |
| user-embedding v3.1 | Failed | 18 min | 1.2 | $4.80 | — | Data quality issue |
| summary-generator v1.9 | Completed | 2.1 hr | 18.2 | $58.40 | 0.87 ROUGE | +2.4% |
| toxicity-detector v1.6 | Running | 28 min | 2.8 | $9.20 | — | In progress |
| chat-quality v3.3 | Queued | — | — | — | — | Waiting for GPU |
| code-completion-xl | Failed | 45 min | 6.5 | $22.00 | — | OOM error |

### Training metrics aggregation

| Metric | Current | Target | Trend |
|---|---|---|---|
| Experiment success rate | 87.5% | > 90% | → stable |
| Failed runs (this month) | 2 | < 3 | → |
| Avg GPU utilization | 72% | > 80% | ↑ +5% |
| Avg training cost per model | $48.20 | < $50 | → |
| Data quality pass rate | 98.5% | > 99% | → |
| Time from experiment to staging | 8.5 days | < 7 days | ↑ |
| Time from staging to production | 5.2 days | < 5 days | → |

### Deployment status

| Model | Version | Traffic % | Strategy | Since | Health | Action |
|---|---|---|---|---|---|---|
| chat-quality | v3.2 | 100% | Stable | Aug 2 | Green | — |
| code-completion | v4.0 | 90% | Stable | Aug 1 | Green | — |
| code-completion | v4.1 | 10% | Canary | Aug 5 | Green | Ramp to 50% |
| summary-generator | v1.8 | 50% | A/B | Jul 22 | Green | — |
| summary-generator | v1.9 | 50% | A/B | Aug 3 | Green | Evaluate Aug 10 |
| user-embedding | v3.0 | 100% | Stable | May 15 | Yellow | Drift detected |
| user-embedding | v3.1 | Shadow | Shadow | Aug 1 | Green | Replace v3.0 |
| rag-reranker | v2.0 | 100% | Stable | Jul 10 | Green | — |

### Inference serving

| Model | QPS | P50 | P95 | P99 | Timeout % | Replicas | GPU mem |
|---|---|---|---|---|---|---|---|
| chat-quality | 850 | 45ms | 120ms | 280ms | 0.1% | 2 | 45% |
| intent-router | 620 | 12ms | 35ms | 80ms | 0.05% | 2 | 22% |
| toxicity-detector | 420 | 28ms | 85ms | 180ms | 0.2% | 1 | 38% |
| code-completion | 320 | 180ms | 450ms | 1.2s | 0.8% | 3 | 72% |
| rag-reranker | 180 | 65ms | 180ms | 420ms | 0.3% | 1 | 55% |
| user-embedding | 240 | 22ms | 55ms | 120ms | 0.1% | 1 | 35% |
| summary-generator | 85 | 850ms | 2.4s | 5.2s | 1.5% | 2 | 82% |

### Model monitoring — drift detection

| Model | Data drift | Concept drift | Prediction skew | Feature importance Δ | Alert |
|---|---|---|---|---|---|
| chat-quality | 0.08 (low) | 0.05 (low) | 0.03 (low) | Stable | None |
| intent-router | 0.12 (low) | 0.09 (low) | 0.04 (low) | Stable | None |
| toxicity-detector | 0.06 (low) | 0.03 (low) | 0.02 (low) | Minor shift | None |
| code-completion | 0.15 (moderate) | 0.11 (moderate) | 0.08 (low) | New libraries pattern | Watch |
| user-embedding | 0.32 (high) | 0.28 (high) | 0.18 (moderate) | User behavior shift | **Retrain** |
| rag-reranker | 0.10 (low) | 0.07 (low) | 0.04 (low) | Stable | None |
| summary-generator | 0.14 (moderate) | 0.10 (low) | 0.06 (low) | Doc length increase | Watch |

### Drift thresholds and actions

| Drift type | Green | Yellow | Red | Action (Red) |
|---|---|---|---|---|
| Data drift (PSI) | < 0.15 | 0.15-0.25 | > 0.25 | Investigate data pipeline, check for upstream changes |
| Concept drift | < 0.15 | 0.15-0.25 | > 0.25 | Retrain model, evaluate new ground truth |
| Prediction skew | < 0.10 | 0.10-0.20 | > 0.20 | Check for training-serving skew, fix pipeline |
| Feature importance Δ | < 10% | 10-20% | > 20% | Review feature engineering, check data quality |

### Model evaluation comparison

| Model | Version | Accuracy | Precision | Recall | F1 | Latency P95 | Size |
|---|---|---|---|---|---|---|---|
| chat-quality | v3.1 | 0.91 | 0.89 | 0.92 | 0.90 | 105ms | 120MB |
| chat-quality | v3.2 | 0.92 | 0.91 | 0.93 | 0.92 | 110ms | 125MB |
| chat-quality | v3.3 | 0.93 | 0.92 | 0.94 | 0.93 | 115ms | 128MB |
| code-completion | v3.0 | — | — | — | — | 420ms | 850MB |
| code-completion | v4.0 | — | — | — | — | 380ms | 920MB |
| code-completion | v4.1 | — | — | — | — | 360ms | 880MB |

## Action recommendations

1. **Retrain user-embedding**: data drift PSI=0.32 triggers immediate retraining; deploy v3.1 from staging to replace v3.0
2. **Ramp code-completion v4.1**: 10% canary is healthy; ramp to 50% today, 100% after 2 days of stable metrics
3. **Fix training failures**: OOM on code-completion-xl → increase GPU memory or reduce batch size; data quality issue on user-embedding → investigate upstream data pipeline
4. **Reduce summary-generator latency**: P95 at 2.4s is above the 2s target; consider model distillation or quantization
5. **GPU utilization target**: 72% → 80%+; consolidate low-utilization models or use spot instances
6. **Shadow deployment for all critical models**: always have a shadow model running before promoting to production
7. **Monthly model review**: review all production models for drift, performance, and business value; archive unused models
8. **A/B evaluation gate**: summary-generator v1.8 vs v1.9 — evaluate Aug 10; promote winner, archive loser



- Deploy and forget → model deployed without monitoring; models decay silently until users complain
- Training-serving skew → preprocessing differs between training and serving; use shared preprocessing pipelines
- No model registry → model files scattered across S3 buckets and notebooks; registry is the single source of truth
- GPU waste → idle GPU instances for low-QPS models; right-size or use serverless inference
- Ignoring data drift → model performance degrades because input data distribution changed; monitor PSI weekly

## Related

- Same class: [dashboard-ai-performance](../../ai-engineer/platform/dashboard-ai-performance.md) — LLM performance dashboard
- Same class: [dashboard-data-pipeline](../../ai-engineer/data/dashboard-data-pipeline.md) — data pipeline health
- Downstream: [evaluate-an-llm-app](../../ai-engineer/platform/evaluate-an-llm-app.md) — LLM evaluation guide
- Downstream: [evaluation-driven-development](evaluation-driven-development.md) — eval-driven development
- References: Google — *MLOps: Continuous Delivery and Automation Pipelines in ML*; Andrew Ng — *MLOps: From Model-centric to Data-centric AI*; Chip Huyen — *Designing Machine Learning Systems*
---
title: FinOps Q4 Prediction 2026
lifecycle: active
status: stable
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: dashboard
key: tl_capacity-cost_2026_q4_prediction
tags:
- finops
- cost
- 2026-q4
- prediction
report_period: 2026 Q4 (projected)
system: YiAi + YiVad + YiPet
monthly_cost: 2400
budget_variance_pct: -4
compute_pct: 52
api_pct: 6
storage_pct: 23
category: tech-lead/capacity
roles:
- tech-lead
- executive
benefit: Tech leads can track capacity and cost trends to prevent resource exhaustion and budget overruns
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
review_cycle: quarterly
tacit: false
related:
  - ./dashboard-engineering-capacity.md
  - ./dashboard-talent-retention.md
  - ./tl-capacity-cost-2026-08-trend.md
  - ../README.md
  - ../INDEX.md
---

# FinOps Q4 Prediction — Yi family 2026 Q4

> **As a** tech lead, **I want to** tl_capacity cost_2026_q4_prediction, **so that** capacity bounded.

## Overview

- **Period: ** 2026 Q4 (2026-10 ~ 2026-12, projection)
- **System / Service: ** YiAi + YiVad + YiPet
- **Projected monthly cost: ** ¥2,400 (peak at end of Q4)
- **Budget: ** ¥2,500
- **Variance: ** -4% (savings)

## Cost Breakdown (2026 Q4 projected)

| Category | Cost (¥/mo) | % of Total | Driver |
|----------|------------|------------|--------|
| GPU Inference (Ollama local) | 1,250 | 52% | Call frequency +20% after aicr implementation |
| Cloud LLM (Phase 1 PoC) | 150 | 6% | Multi-Provider Phase 1 traffic cut |
| CPU / Memory (MongoDB + YiAi) | 380 | 16% | Working set rising |
| Storage (OSS + local) | 540 | 23% | YiKnowledge accumulation + aicr sessions |
| Network | 40 | 2% | Cross-provider calls |
| 3rd-party API | 40 | 1% | Monitoring alerts |
| **Total** | 2,400 | 100% | |

## Trend Analysis (Jun → Q4)

| Month | Total | GPU | Cloud LLM | Storage | Variance |
|-------|-------|-----|-----------|---------|----------|
| 2026-06 | ¥1,760 | ¥970 | ¥0 | ¥420 | -12% |
| 2026-07 | ¥1,850 | ¥1,020 | ¥0 | ¥460 | -8% |
| 2026-08 | ¥2,020 | ¥1,150 | ¥30 | ¥480 | +1% |
| 2026 Q4 end | ¥2,400 | ¥1,250 | ¥150 | ¥540 | -4% |

## Drivers

- After aicr cross-project implementation, GPU call frequency +20%.
- Multi-Provider Phase 1 traffic cut introduces cloud LLM cost (peak ¥150/mo).
- YiKnowledge accumulation + aicr sessions accumulation push Storage up.

## Mitigations

- Cache layer (same query 5 min reuse) estimated to save ¥120/mo.
- OSS cold data archive (> 6 months) estimated to save ¥100/mo.
- MongoDB working set optimization estimated to save ¥40/mo.
- aicr sessions archived by month estimated to save ¥60/mo.

## Health Indicators

- GPU utilization: 70% (approaching target upper limit)
- Cloud LLM fallback rate: 5% (under control)
- Cache hit rate: 55% (meets standard)

---
> References: YiKnowledge → tech/infra/capacity-and-cost-summary.md | work/processes/capacity-planning-process.md

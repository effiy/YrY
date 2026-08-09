---
title: FinOps Trend 2026-08 (projected)
lifecycle: active
status: stable
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
key: tl_capacity-cost_2026_08_trend
tags:
- finops
- cost
- 2026-08
- trend
report_period: 2026-08 (projected)
system: YiAi + YiVad + YiPet
monthly_cost: 2020
budget_variance_pct: 1
compute_pct: 57
api_pct: 1
storage_pct: 24
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
  - ./tl-capacity-cost-2026-q4-prediction.md
  - ../README.md
  - ../INDEX.md
---

# FinOps Trend — Yi family 2026-08

> **As a** tech lead, **I want to** tl_capacity cost_2026_08_trend, **so that** capacity bounded. 

## Overview

- **Period: ** 2026-08 (mid-month projection) 
- **System / Service: ** YiAi + YiVad + YiPet
- **Projected monthly cost: ** ¥2,020 (first breach of budget ¥2,000) 
- **Budget: ** ¥2,000
- **Variance: ** +1% (overspend) 

## Cost Breakdown (2026-08 projected)

| Category | Cost (¥) | % of Total | vs 2026-07 |
|----------|----------|------------|------------|
| GPU Inference (Ollama local) | 1,150 | 57% | +13% |
| CPU / Memory (MongoDB + YiAi) | 330 | 16% | +3% |
| Storage (OSS + local) | 480 | 24% | +4% |
| Network | 30 | 1.5% | flat |
| 3rd-party API (cloud LLM fallback PoC) | 30 | 1.5% | +50% |
| **Total** | 2,020 | 100% | +9% |

## Trend Analysis (Jun → Aug)

| Month | Total | GPU | Storage | 3rd-party API | Variance |
|-------|-------|-----|---------|---------------|----------|
| 2026-06 | ¥1,760 | ¥970 | ¥420 | ¥30 | -12% |
| 2026-07 | ¥1,850 | ¥1,020 | ¥460 | ¥20 | -8% |
| 2026-08 | ¥2,020 | ¥1,150 | ¥480 | ¥30 | +1% |

## Drivers

- aicr implementation + RAG hybrid retrieval launch → GPU call frequency +13%. 
- YiKnowledge markdown accumulation → Storage +4%. 
- Multi-Provider Phase 1 PoC → 3rd-party API +50% (but absolute value still small). 

## Alerts

- 2026-08 first breach of budget; must trigger budget review. 
- After Multi-Provider Phase 1 implementation, need to assess the share of cloud fallback cost. 

## Optimization Opportunities

| # | Opportunity | Est. Monthly Saving | Effort | Priority |
|---|-------------|--------------------|--------|----------|
| 1 | OSS cold data archive (> 6 months)  | ¥100 | 1 d | high |
| 2 | MongoDB working set optimization | ¥40 | 2 d | medium |
| 3 | aicr sessions cold archive | ¥60 | 3 d | medium |
| 4 | cache layer (same query 5 min reuse)  | ¥120 | 2 d | high |

## Health Indicators

- GPU utilization: 65% (rose after aicr implementation, still below the target 60-90% upper limit) 
- Cache hit rate: 50% (meets bar after RAG hybrid) 

---
> References: YiKnowledge → tech/infra/capacity-and-cost-summary.md | work/processes/capacity-planning-process.md

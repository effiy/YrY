---
title: FinOps Report 2026-06 (baseline)
lifecycle: active
status: stable
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
key: tl_capacity-cost_2026_06_baseline
tags:
- finops
- cost
- 2026-06
- baseline
report_period: 2026-06
system: YiAi + YiVad + YiPet
monthly_cost: 1760
budget_variance_pct: -12
compute_pct: 55
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
  - ./tl-capacity-cost-2026-08-trend.md
  - ../README.md
  - ../INDEX.md
---

# FinOps Report — YiAi + YiVad + YiPet — 2026-06 (baseline)

> **As a** tech lead, **I want to** tl_capacity cost_yiai_yivad_yipet_2026_06, **so that** capacity bounded.

## Overview

- **Period:** 2026-06
- **System / Service:** YiAi + YiVad + YiPet
- **Monthly cost:** ¥1,760
- **Budget:** ¥2,000
- **Variance:** -12% (saving)

## Cost Breakdown

| Category | Cost (¥) | % of Total | vs Last Month |
|----------|----------|------------|---------------|
| GPU Inference (Ollama local) | 970 | 55% | +3% |
| CPU / Memory (MongoDB + YiAi) | 310 | 18% | flat |
| Storage (OSS + local) | 420 | 24% | +5% |
| Network | 30 | 2% | flat |
| 3rd-party API | 30 | 1% | flat |
| **Total** | 1,760 | 100% | +3% |

## Unit Economics

- **Cost per chat request:** ¥0.013 (~135k requests/mo)
- **Cost per RAG query:** ¥0.030 (~10k queries/mo, dense only)
- **Cost per GB stored:** ¥0.50/mo (~840 GB)

## Optimization Opportunities

| # | Opportunity | Est. Monthly Saving | Effort | Priority |
|---|-------------|--------------------|--------|----------|
| 1 | RSS body to YiKnowledge (planned 7-30) | ¥80 | 2 d | high |
| 2 | aicr sessions archived monthly | ¥60 | 3 d | medium |
| 3 | OSS cold data archive | ¥100 | 1 d | high |

## Health Indicators

- CPU utilization: 50% (YiAi) / 30% (YiVad)
- GPU utilization: 50% — target 60-90%
- Cache hit rate: 40% — target >50%

## Comparison vs 2026-07

- Total cost: +¥90/mo (+5%) — call frequency rose after aicr landed.
- Cost per chat request: -¥0.001 (diluted by larger call base).
- Cache hit rate: +5pp (after RAG hybrid went live).

---
> References: YiKnowledge → tech/infra/capacity-and-cost-summary.md | work/processes/capacity-planning-process.md

---
title: OSS Storage Capacity 2026 Q3
lifecycle: active
status: stable
key: tl_capacity-plan_oss_storage_2026_q3
tags:
- capacity
- oss
- storage
- 2026-q3
planning_period: 2026 Q3
system: OSS (YiAi storage)
resource_type: storage
current_capacity: 1 TB (Standard tier)
projected_growth_pct: 30
category: tech-lead/capacity
roles:
- tech-lead
benefit: Tech leads can track capacity and cost trends to prevent resource exhaustion and budget overruns
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"review_cycle: quarterly
tacit: false
related:
  - ./dashboard-engineering-capacity.md
  - ./dashboard-talent-retention.md
  - ./tl-capacity-cost-2026-08-trend.md
  - ../README.md
  - ../INDEX.md
---

# Capacity Plan — OSS Storage — 2026 Q3

> **As a** tech lead, **I want to** tl_capacity plan_oss_storage_2026_q3, **so that** capacity bounded. 

## Baseline

- **System: ** OSS (YiAi knowledge base markdown + uploaded images + backups) 
- **Resource: ** Storage
- **Planning period: ** 2026 Q3

## Current State

- **Current capacity: ** 1 TB (OSS Standard) 
- **Peak utilization: ** 75% (750 GB used) 
- **Average utilization: ** monotonically rising
- **Bottleneck resource: ** Standard tier cost (> 6 month old data still in Standard) 

## Projected Demand

- **Growth driver: ** YiKnowledge knowledge base markdown + RSS body split out + aicr sessions accumulating. 
- **Projected growth: ** 30% over Q3. 
- **Required capacity: ** 1 TB × 1.3 × 1.2 = 1.56 TB → expansion + cold/hot tiering needed. 
- **Headroom: ** 1.56 - 1 = 0.56 TB short-term gap. 

## Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| Used > 80% | alert | trigger cold data archival |
| Used > 95% | alert | throttle upload streams + emergency expansion |

## Recommendations

1. **Short-term (Q3) ** — OSS cold data archival (> 6 month old data move to IA / Archive tier) , estimated savings ¥100/mo. 
2. **Mid-term (Q4) ** — expand to 2 TB + lifecycle policy auto-tiering. 
3. **Long-term** — evaluate self-hosted minio + OSS hybrid (> 1 TB cold data) . 

---
> References: YiKnowledge → tech/infra/capacity-and-cost-summary.md | work/processes/capacity-planning-process.md
> Yi family services: YiAi (Ollama inference, GPU-bound) | MongoDB (memory-bound) | OSS (storage-bound)

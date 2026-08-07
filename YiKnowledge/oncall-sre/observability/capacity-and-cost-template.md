---
title: Capacity and cost template (FinOps) 
lifecycle: active
tags:
- template
- FinOps
- capacity
- cost
- quarterly optimization
category: oncall-sre/observability
created: 2026-07-30
updated: 2026-07-30
last_verified: 2026-08-07
source: internal
type: template
status: stable
roles:
- oncall-sre
- tech-lead
benefit: SREs can monitor system health and SLO compliance with clear observability patterns
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- capacity-and-cost.md
- tech-debt-inventory-template.md
review_cycle: quarterly
tacit: false
---

# Capacity and cost template (FinOps) 

> **As a** an oncall sre, **I want to** capacity and cost template, **so that** system observable. 

> Usage method: filled in monthly by ops/SRE, reviewed quarterly. Supporting qb-row "Capacity and cost" one-click prompt: resource utilization, scaling thresholds, per-request cost, and quarterly FinOps optimization items. Focus on resource utilization / scaling thresholds / per-request cost / quarterly FinOps items. Copy to `tech/infra/{month}-capacity-cost.md`. 

## 1. Basic info

| Field | Content |
|------|------|
| Report cadence |  (example: 2026-07)  |
| Reporter |  (example: SRE Zhang San)  |
| Systems involved | YiAi / YiVad / YiPet / model inference |
| Report date |  (example: 2026-07-31)  |
| Last month's report | [link]({path}) |
| Quarterly budget | ¥__ |
| Monthly actual | ¥__ |
| Variance | __% |

## 2. Resource Utilization

### 2.1 Compute resources

| Resource | Quota | Avg utilization | Peak utilization | Peak time | Rating |
|---|---|---|---|---|---|
| CPU cluster | 200 cores | 45% | 78% | 19:30 | ⭐⭐⭐ |
| Memory | 512 GB | 60% | 82% | 19:30 | ⭐⭐⭐ |
| GPU (inference)  | 4 A100 cards | 92% | 100% | 14:00 | ⭐⭐⭐⭐⭐ (bottleneck)  |
| GPU (training)  | 2 A100 cards | 70% | 95% | 03:00 | ⭐⭐⭐⭐ |
| Disk | 5 TB | 55% | — | — | ⭐⭐⭐ |

### 2.2 Network and middleware

| Resource | Quota | Utilization | Bottleneck signal |
|---|---|---|---|
| Public bandwidth | 1 Gbps | 35% | — |
| Kafka QPS | 10k | 60% | Peak 8k |
| Redis hit rate | — | 88% | Expect >= 95% |
| MongoDB connections | 500 | 35% | — |

## 3. Scaling Thresholds and Auto-scaling

| Resource | Trigger threshold | Scaling action | Cooldown | Last triggered | Assessment |
|---|---|---|---|---|---|
| CPU | > 70% for 5min | +2 cores | 10min | 2026-07-22 | ✅ |
| GPU inference | > 95% for 2min | +1 card (only 1 card can be added)  | 30min | Daily 14:00 | ⚠️ Cannot satisfy |
| Memory | > 80% for 5min | +16 GB | 10min | — | ✅ |
| Kafka consumption lag | > 1000 messages | +1 consumer | 2min | 2026-07-25 | ✅ |

> Auto-scaling strategy should be reviewed monthly to avoid "stuck scaling" or "frequent flapping". 

## 4. Per-Request Cost

| Interface/Service | Monthly calls | Monthly cost | Per-request cost | Last month per-request | Trend | Unit |
|---|---|---|---|---|---|---|
| AI chat (GPT-4o)  | 1.2M | ¥6,000 | 0.005 | 0.006 | ↓ | ¥/call |
| AI chat (qwen3)  | 800k | ¥1,600 | 0.002 | 0.002 | — | ¥/call |
| After-sales BRD agent | 50k | ¥3,500 | 0.07 | 0.09 | ↓ | ¥/call |
| OCR calls | 200k | ¥800 | 0.004 | 0.004 | — | ¥/call |
| Vector search | 4M | ¥1,200 | 0.0003 | 0.0003 | — | ¥/call |

## 5. Cost structure

| Cost class | Amount | Share | YoY last month | Note |
|---|---|---|---|---|
| Compute resources | ¥15,000 | 50% | +5% | GPU 80% |
| Storage | ¥3,000 | 10% | +0% | |
| Network/bandwidth | ¥2,000 | 7% | +2% | |
| Third-party API | ¥8,000 | 27% | -10% | qwen3 replaced GPT-4o |
| License/tools | ¥2,000 | 6% | 0% | |
| **Total** | **¥30,000** | **100%** | **+2%** | |

## 6. Quarterly FinOps optimization items

| ID | Optimization item | Expected savings | Effort | ROI | Owner | Due date | State |
|---|---|---|---|---|---|---|---|
| F-1 | qwen3 replaces GPT-4o (continue pushing)  | ¥3,000/month | 5 person-days | High | Model team | 2026-08-15 | In progress |
| F-2 | GPU inference introduces vLLM batching | ¥2,500/month | 8 person-days | High | Model team | 2026-09-01 | Todo |
| F-3 | Redis hit rate raised to 95% | ¥500/month | 3 person-days | Medium | Backend | 2026-08-30 | Todo |
| F-4 | Cold data archived to OSS | ¥300/month | 2 person-days | Low | Ops | 2026-09-15 | Todo |
| F-5 | Offline training uses spot instances | ¥1,500/month | 4 person-days | High | Model team | 2026-09-30 | Todo |

## 7. Exceptions and alerts

| Type | Description | Handling |
|---|---|---|
| ⚠️ Cost over threshold | GPU utilization 100% + cost +5% | F-2 advance start |
| ⚠️ Capacity bottleneck | GPU inference scale-up failure | Apply for additional cards |

## 8. Budget forecast

| Month | Forecast cost | Budget | Gap |
|---|---|---|---|
| 2026-08 | ¥32,000 | ¥32,000 | 0 |
| 2026-09 | ¥31,000 | ¥32,000 | -¥1,000 |
| 2026-10 | ¥30,000 | ¥32,000 | -¥2,000 |

## 9. Action items

| ID | Action item | Owner | Due date | State |
|---|---|---|---|---|
| 1 | Start F-2 vLLM batching | Model team | 2026-08-10 | Todo |
| 2 | GPU card application | SRE | 2026-08-05 | Todo |
| 3 | Redis hit rate optimization plan | Backend | 2026-08-20 | Todo |

## 10. Measurement metrics

| Metric | Last month | This month | Goal |
|---|---|---|---|
| GPU avg utilization | 88% | 92% | >= 85% |
| Per AI chat cost | ¥0.004 | ¥0.0035 | <= ¥0.004 |
| Monthly total cost | ¥30,600 | ¥30,000 | <= ¥32,000 |
| FinOps items completed | 2 | 1 | >= 3/quarter |

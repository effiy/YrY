---
title: Capacity and Cost Monitoring
aliases: [capacity-and-cost, cost-monitoring, resource-monitoring]
tags: [sre, observability, capacity, cost, monitoring, finops]
category: srer/observability
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, leader]
benefit: "SREs monitor capacity and cost to prevent resource exhaustion and optimize infrastructure spend"
acceptance_criteria:
  - "covers capacity monitoring (CPU, memory, disk, network) and cost monitoring"
  - "includes alert thresholds and capacity planning formulas"
  - "YiAi-specific monitoring setup"
related:
  - ./README.md
  - ./slo-sli-definition.md
  - ./set-up-observability.md
  - ../../leader/capacity/run-a-finops-review.md
---

# Capacity and Cost Monitoring

> **When to use:** When setting up monitoring for any service, or when infrastructure costs are growing faster than usage.

## Capacity Monitoring

### What to Monitor

| Resource | Metric | Why |
|---|---|---|
| **CPU** | Usage %, throttling | CPU saturation = latency spikes |
| **Memory** | Usage %, OOM kills | Memory exhaustion = crashes |
| **Disk** | Usage %, IOPS, throughput | Disk full = writes fail; disk slow = everything slow |
| **Network** | Bandwidth, connections, packet loss | Network saturation = timeouts |
| **Database connections** | Active connections, pool utilization | Connection exhaustion = service unavailable |
| **GPU** | VRAM usage, utilization % | GPU OOM = inference fails |

### Alert Thresholds

| Resource | Warning | Critical |
|---|---|---|
| CPU | > 70% for 10 min | > 90% for 5 min |
| Memory | > 80% for 10 min | > 95% for 5 min |
| Disk | > 80% | > 90% |
| DB connections | > 70% of max | > 90% of max |
| GPU VRAM | > 80% | > 95% |

### Capacity Planning Formula

```
When to scale: current_usage / capacity > 0.7
How much: current_usage × (1 + growth_rate × months_until_procurement)
```

**Example:** YiAi MongoDB connections at 70/100 (70% of max). Traffic growing 20%/month. Procurement takes 1 month.

```
Need: 70 × (1 + 0.2 × 1) = 84 connections in 1 month
Action: Increase max connections to 150 (gives 6 months of headroom)
```

## Cost Monitoring

### Cost Dashboard

Track these metrics per service, per environment:

| Dimension | YiAi metric | Source |
|---|---|---|
| **Compute** | Server cost (GPU + CPU) | Cloud provider / on-prem hardware |
| **Database** | MongoDB Atlas tier cost | MongoDB Atlas billing |
| **Storage** | OSS storage GB + requests | OSS provider billing |
| **Network** | Data transfer GB | Cloud provider |
| **Total** | Sum of all above | Calculated |

### Cost Efficiency Metrics

| Metric | Formula | Target |
|---|---|---|
| **Cost per chat request** | Total cost / chat requests | Track trend (↓ is good) |
| **Cost per RAG query** | RAG cost / RAG queries | Track trend |
| **Cost per active user** | Total cost / MAU | Track trend |
| **Idle resource %** | (Idle cost / total cost) × 100 | < 20% |

### YiAi Cost Monitoring Setup

```python
# Track cost per request (middleware)
import time

async def cost_tracking_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    
    # Log cost metrics
    cost = estimate_cost(request, duration_ms)
    metrics.increment("request_cost_total", cost, tags={
        "endpoint": request.url.path,
        "method": request.method,
    })
    
    return response

def estimate_cost(request, duration_ms):
    """Estimate cost based on resource usage."""
    # Ollama GPU: $X/hour → $X/3600000 per ms
    gpu_cost = duration_ms * (GPU_HOURLY_COST / 3_600_000)
    # MongoDB: ~$0.0001 per query
    db_cost = 0.0001
    return gpu_cost + db_cost
```

## Capacity Dashboard

### What to Show

```
┌─────────────────────────────────────────────────────┐
│ CPU Usage                    Memory Usage            │
│ ████████░░░░░░ 70%           ██████████░░ 82%        │
│                                                      │
│ Disk Usage                   DB Connections          │
│ ██████░░░░░░░░ 45%           ███████░░░░░ 56%        │
│                                                      │
│ GPU VRAM                     Cost (today)            │
│ ████████████░ 88% ⚠️         $XX.XX                  │
└─────────────────────────────────────────────────────┘
```

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Monitoring CPU but not DB connections | CPU is fine but the app is down because DB connections are exhausted | Monitor every resource the app depends on |
| Alert thresholds at 99% | No time to react before resource is exhausted | Alert at 70% (warning) and 90% (critical) |
| No cost-per-unit metric | Total cost goes up but you can't tell if it's due to growth or waste | Track cost per request, per user, per query |
| Capacity planning only during incidents | Reactive; scrambling to add capacity during an outage | Review capacity monthly; plan 3-6 months ahead |
---
title: Run a FinOps Review
aliases: [finops-review, cloud-cost-review, cost-optimization]
tags: [leader, capacity, finops, cost, optimization, review]
category: leader/capacity
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, srer, executiver]
benefit: "Leaders run structured FinOps reviews to identify cost waste, optimize resource usage, and align spending with business value"
acceptance_criteria:
  - "5-step review process: inventory, analyze, identify waste, optimize, track"
  - "includes cost allocation framework (by service, team, environment)"
  - "YiAi-specific cost optimization patterns"
related:
  - ./README.md
  - ../../srer/observability/capacity-and-cost.md
  - ../../executiver/roadmap/quarterly-business-review.md
---

# Run a FinOps Review

> **When to use:** Monthly (lightweight) and quarterly (deep dive). A FinOps review ensures every dollar spent on infrastructure traces back to value delivered.

## FinOps Principles

| Principle | Meaning |
|---|---|
| **Cost visibility** | Every team sees their own cloud costs |
| **Cost accountability** | Teams own their infrastructure spend |
| **Cost optimization** | Continuous improvement, not annual review |
| **Business alignment** | Spend maps to business value, not just "keeping the lights on" |

## Review Process

### 1. Inventory (what are we spending?)

List every resource and its monthly cost:

| Resource | Monthly cost | Service | Team | Environment |
|---|---|---|---|---|
| MongoDB Atlas M10 | ${{X}} | YiAi | Backend | Production |
| Ollama GPU server | ${{Y}} | YiAi | Backend | Production |
| OSS storage (100GB) | ${{Z}} | YiAi | Backend | Production |
| Dev server (Mac Mini) | ${{W}} | YiAi | Backend | Development |

### 2. Analyze (what drives cost?)

For each resource, identify the cost driver:

| Resource | Cost driver | Trend | % of total |
|---|---|---|---|
| MongoDB Atlas | Storage + IOPS | ↑ 10%/month | {{X}}% |
| Ollama GPU | GPU hours | Stable | {{Y}}% |
| OSS storage | GB stored | ↑ 5%/month | {{Z}}% |

### 3. Identify Waste

Common waste patterns:

| Pattern | Signal | YiAi relevance |
|---|---|---|
| **Idle resources** | Dev server running 24/7 but used 8h/day | YiAi dev server — auto-shutdown at 8pm? |
| **Over-provisioning** | CPU/memory < 20% utilized | Ollama GPU — right-sized for peak? |
| **Orphaned resources** | Unattached storage volumes, old snapshots | OSS — any stale files from deleted projects? |
| **Unused features** | Paying for features no one uses | MongoDB Atlas — are we using all paid features? |
| **Wrong pricing model** | On-demand vs. reserved vs. spot | GPU server — reserved instance cheaper? |

### 4. Optimize

| Opportunity | Action | Expected saving | Effort |
|---|---|---|---|
| Dev server auto-shutdown | Cron job to stop at 8pm, start at 8am | ~60% of dev server cost | 1 hour |
| MongoDB storage cleanup | Archive sessions > 90 days old | ~20% of storage cost | 2 hours |
| OSS lifecycle policies | Auto-delete temp files after 7 days | ~10% of storage cost | 30 min |

### 5. Track

Track cost per service over time:

```
Month     YiAi API    YiAi RAG    YiAi Storage    Total
Jan       $XXX        $YY         $ZZ             $TTT
Feb       $XXX        $YY         $ZZ             $TTT
Mar       $XXX        $YY         $ZZ             $TTT
```

## YiAi-Specific Cost Optimization

### MongoDB Atlas

| Optimization | How |
|---|---|
| **Right-size cluster** | Monitor CPU/memory/IOPS; downgrade if < 30% utilized |
| **Archive old data** | Sessions > 90 days → archive to OSS; keep metadata in MongoDB |
| **Index optimization** | Remove unused indexes; they consume storage and slow writes |
| **Connection pooling** | Reuse connections; don't open new connections per request |

### Ollama GPU

| Optimization | How |
|---|---|
| **Model caching** | Keep frequently used models in VRAM; unload idle models |
| **Batch inference** | Batch multiple requests when possible |
| **Right-size GPU** | Monitor GPU utilization; downgrade if < 50% |
| **Quantization** | Use quantized models (q4, q8) for lower VRAM usage |

### OSS Storage

| Optimization | How |
|---|---|
| **Lifecycle policies** | Auto-delete temp uploads after 7 days |
| **Deduplication** | Don't store duplicate files (check hash before upload) |
| **Compression** | Compress large files before storage |

## Cost Allocation Tags

Tag every resource so costs can be attributed:

```yaml
tags:
  service: yi-ai
  team: backend
  environment: production
  cost_center: engineering
```

## Quarterly Review Template

| Section | Content |
|---|---|
| **Total spend** | ${{TTT}} this quarter (↑/↓ X% vs. last quarter) |
| **Top 3 costs** | 1. {{resource}} ($X), 2. {{resource}} ($Y), 3. {{resource}} ($Z) |
| **Waste eliminated** | ${{W}} saved through {{actions}} |
| **New optimizations** | {{N}} opportunities identified, estimated ${{S}} savings |
| **Cost per unit** | ${{C}} per chat request, ${{C}} per RAG query |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Annual cost review | Waste accumulates for 12 months; optimization is reactive | Monthly lightweight review; quarterly deep dive |
| No cost allocation | Can't tell which service/team drives cost | Tag every resource; build a cost-per-service dashboard |
| Optimizing before measuring | Can't tell if optimization actually saved money | Measure baseline → optimize → measure again |
| "It's only $50/month" | Death by a thousand cuts; 10 × $50 = $500/month | Review everything; small costs add up |
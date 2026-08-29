---
title: "Capacity Planning for Services"
aliases: [capacity-planning, capacity, sizing]
tags: [engineer, ship, capacity, planning, infrastructure]
category: engineer/ship
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: draft
lifecycle: active
review_cycle: quarterly
roles: [engineer, srer]
benefit: "Engineers plan capacity for Yi family services"
related:
  - ./README.md
  - ../../leader/capacity/README.md
  - ../../leader/roadmap/do-a-capacity-plan.md
---

# Capacity Planning for Services

> Capacity planning guide for Yi family infrastructure.

## Current baseline

| Service | Current load | Peak load | Headroom |
|---------|-------------|-----------|----------|
| YiAi (FastAPI) | Single user | ~5 concurrent | High |
| MongoDB | < 1GB | — | High |
| Ollama | Single model | 1 concurrent inference | Low (GPU-bound) |

## Key metrics to track

- YiAi: request latency (p50/p95/p99), concurrent connections, error rate
- MongoDB: storage size, connection pool, query latency
- Ollama: inference time, queue depth, GPU memory usage

## When to scale

- YiAi: p95 latency > 500ms → add workers
- MongoDB: storage > 80% disk → archive or expand
- Ollama: queue depth > 3 → add GPU or use smaller model

## Planning cadence

- Monthly: review metrics, update baseline
- Quarterly: forecast next quarter, recommend changes
- Before major feature launch: review capacity, stress test if needed
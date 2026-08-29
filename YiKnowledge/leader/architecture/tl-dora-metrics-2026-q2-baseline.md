---
title: "DORA Metrics Baseline 2026 Q2"
tags: [dora, metrics, baseline, delivery]
category: leader/architecture
created: 2026-08-21
updated: 2026-08-21
source: internal
type: assessment
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "DORA metrics baseline for the YrY monorepo as of 2026 Q2"
---

# DORA Metrics Baseline — 2026 Q2

> Initial baseline. Single-developer project — metrics reflect individual velocity, not team throughput.

## Metrics

| Metric | Value | Elite Threshold | Assessment |
|--------|-------|-----------------|------------|
| **Deployment Frequency** | On-demand (multiple/day) | On-demand | Elite |
| **Lead Time for Changes** | < 1 hour (commit → deploy) | < 1 hour | Elite |
| **Change Failure Rate** | ~5% (estimated) | < 5% | High |
| **Time to Restore Service** | < 30 min (local dev) | < 1 hour | Elite |

## Caveats

- **Single developer** — DORA metrics are designed for teams, not individuals
- **Local dev only** — no production deployment, no CI/CD pipeline
- **Change failure rate** is estimated from known bug fixes, not systematically tracked
- **Time to restore** is trivial (restart uvicorn) — not meaningful in local dev context

## Action items

1. Track change failure rate systematically (tag bug-fix commits)
2. Establish CI/CD pipeline for at least YiAi
3. Re-assess when a second developer joins

## Next assessment

2026 Q3 (end of September)
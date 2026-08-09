---
title: developer experience dashboard
aliases:
- devex dashboard
- dev tools dashboard
- developer productivity dashboard
- DX dashboard
tags:
- dashboard
- developer-experience
- devex
- dev-tools
- build
- ide
- developer-satisfaction
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
- tech-lead
- executive
benefit: developer experience and toolchain effectiveness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- set-up-testing-infrastructure.md
- ../infrastructure/set-up-ci-cd.md
- ../infrastructure/dev-environment-hmr.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
tacit: false
---

# developer experience dashboard

> **As a** tech lead, **I want to** track developer experience and toolchain effectiveness, **so that** friction points are identified and fixed before they erode productivity and morale.

> Developer experience is a leading indicator of engineering velocity. Slow builds, flaky tests, and poor local dev environments compound into significant productivity loss. This dashboard measures DX across the full development lifecycle.

## Summary

- 5 DX dimensions: build and CI performance, local development environment, test infrastructure, code review experience, developer satisfaction
- Build times tracked by project with P50/P95; CI queue time and flaky rate monitored
- Local dev: environment setup time, HMR latency, dependency install time
- Developer satisfaction measured via quarterly DX survey (SPACE framework)
- Dashboard refreshes per-build; survey quarterly; trends reviewed monthly

## Core viewpoints

- Developer time is the most expensive resource — saving 10 minutes per developer per day = 40+ hours/year for a 10-person team
- DX is not about free snacks — it's about removing friction from the inner dev loop (write → build → test → deploy)
- Build time is the #1 DX killer — every minute of build time is a minute of lost flow state
- Flaky tests erode trust in the entire CI system — a 1% flaky rate means 1 in 100 builds fails for no reason

## Key information

### 5-panel DX overview

```
┌──────────────────────────────────────────────────────────────────┐
│  BUILD & CI PERFORMANCE          │  LOCAL DEVELOPMENT              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Build P50:  2.8 min    │   │  │  Setup time: 12 min      │   │
│  │  Build P95:  6.5 min    │   │  │  HMR latency: 120ms      │   │
│  │  CI queue:   1.2 min    │   │  │  npm install: 45s        │   │
│  │  Flaky rate: 1.2%       │   │  │  Hot reload: 85% success │   │
│  │  CI success: 92%        │   │  │  Env parity:  88%        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TEST INFRASTRUCTURE             │  CODE REVIEW EXPERIENCE         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Unit run:   12s         │   │  │  Time-to-review: 3.2h   │   │
│  │  Integ run:  2.4 min     │   │  │  PRs waiting:   4       │   │
│  │  E2E run:    8.5 min     │   │  │  Stale PRs:     2       │   │
│  │  Coverage:   82%         │   │  │  Review depth:  4.2/PR  │   │
│  │  Test value: 18%         │   │  │  Reviewer load: 3.2/day │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Build performance by project

| Project | Build tool | Cold build | Warm build | HMR | CI build | CI queue | Flaky % |
|---|---|---|---|---|---|---|---|
| YiVad (Web) | Rsbuild | 45s | 8s | 120ms | 2.8 min | 1.2 min | 0.8% |
| YiAi (API) | Uvicorn | 12s | 3s | N/A | 1.5 min | 0.5 min | 0.3% |
| YiPet (Ext) | Webpack | 85s | 22s | 450ms | 3.5 min | 1.8 min | 1.8% |
| YiWeb (Web) | Vite | 32s | 6s | 80ms | 2.2 min | 1.0 min | 0.5% |
| Shared Lib | Rollup | 18s | 5s | N/A | 1.2 min | 0.3 min | 0.2% |

### Build time trend (P95)

| Month | YiVad | YiAi | YiPet | YiWeb | Shared Lib |
|---|---|---|---|---|---|
| Jan | 3.8 min | 2.0 min | 4.5 min | 2.8 min | 1.5 min |
| Feb | 3.5 min | 1.8 min | 4.2 min | 2.6 min | 1.4 min |
| Mar | 3.2 min | 1.8 min | 4.0 min | 2.4 min | 1.3 min |
| Apr | 3.0 min | 1.6 min | 3.8 min | 2.3 min | 1.3 min |
| May | 2.8 min | 1.5 min | 3.6 min | 2.2 min | 1.2 min |
| Jun | 2.8 min | 1.5 min | 3.5 min | 2.2 min | 1.2 min |
| Jul | 2.8 min | 1.5 min | 3.5 min | 2.2 min | 1.2 min |
| **Trend** | ↓ 26% | ↓ 25% | ↓ 22% | ↓ 21% | ↓ 20% |

### Local development environment

| Metric | Current | Target | Status |
|---|---|---|---|
| Time to first commit (new hire) | 12 min | < 15 min | Green |
| Time to first commit (new machine) | 8 min | < 10 min | Green |
| Dependency install time | 45s | < 60s | Green |
| HMR latency (P95) | 120ms | < 200ms | Green |
| Hot reload success rate | 85% | > 95% | Yellow |
| Dev-prod parity score | 88% | > 90% | Yellow |
| macOS FSEvents reliability | Broken | N/A | Red (known issue) |

### CI pipeline health

| Pipeline stage | Avg duration | P95 duration | Timeout rate | Flaky rate |
|---|---|---|---|---|
| Lint | 18s | 35s | 0% | 0% |
| Type check | 45s | 1.2 min | 0% | 0% |
| Unit tests | 12s | 22s | 0% | 0.2% |
| Integration tests | 2.4 min | 4.5 min | 0.3% | 1.2% |
| Contract tests | 1.8 min | 3.2 min | 0.5% | 0.8% |
| E2E tests | 8.5 min | 15.2 min | 2.1% | 3.5% |
| Build & bundle | 1.2 min | 2.5 min | 0% | 0% |
| Security scan | 42s | 1.1 min | 0% | 0.1% |
| **Total pipeline** | **15.5 min** | **28.2 min** | | |

### CI weekly trend

| Week | Total builds | Success | Failed (real) | Failed (flaky) | Flaky rate | Avg duration |
|---|---|---|---|---|---|---|
| Jul W1 | 842 | 776 (92.2%) | 56 (6.7%) | 10 (1.2%) | 1.2% | 15.8 min |
| Jul W2 | 868 | 802 (92.4%) | 55 (6.3%) | 11 (1.3%) | 1.3% | 15.5 min |
| Jul W3 | 910 | 845 (92.9%) | 54 (5.9%) | 11 (1.2%) | 1.2% | 15.2 min |
| Jul W4 | 892 | 828 (92.8%) | 53 (5.9%) | 11 (1.2%) | 1.2% | 15.1 min |
| Aug W1 | 425 | 395 (92.9%) | 24 (5.6%) | 6 (1.4%) | 1.4% | 14.8 min |

### Developer satisfaction (SPACE framework)

| Dimension | Score (1-5) | Trend | Top concern |
|---|---|---|---|
| **S**atisfaction & well-being | 4.0 | ↑ | On-call burden for SRE team |
| **P**erformance | 4.2 | ↑ | Build times improving |
| **A**ctivity | 4.1 | → | PR volume stable |
| **C**ommunication & collaboration | 4.3 | → | Cross-team reviews working well |
| **E**fficiency & flow | 3.8 | ↑ | Context switching from interruptions |

### Inner dev loop measurement

```
┌─ Inner Loop ─────────────────────────────────────────────────────┐
│                                                                  │
│  Write Code ──→ Build ──→ Test ──→ Debug ──→ Commit            │
│     │            │         │         │          │                │
│     │   2.8 min  │  12s    │  45s    │  15s     │                │
│     │   (P95)    │  (unit) │  (avg)  │  (git)   │                │
│     │            │         │         │          │                │
│     └──────────────────────────────────────────┘                │
│                  Total inner loop: ~4 min                        │
│                  Target: < 3 min                                 │
│                  Industry elite: < 1 min                         │
└──────────────────────────────────────────────────────────────────┘

┌─ Outer Loop ─────────────────────────────────────────────────────┐
│                                                                  │
│  Push ──→ CI ──→ Review ──→ Merge ──→ Deploy                   │
│   │       │        │         │          │                        │
│   │  15.5 min   3.2h     seconds    5 min                        │
│   │  (pipeline)  (median) (auto)    (canary)                     │
│   │                                                              │
│   └──────────────────────────────────────────┘                   │
│            Total outer loop: ~3.5 hours                          │
│            Target: < 2 hours                                     │
│            Industry elite: < 30 min                              │
└──────────────────────────────────────────────────────────────────┘
```

### Toolchain satisfaction

| Tool | Satisfaction (1-5) | Adoption | Key pain point |
|---|---|---|---|
| VS Code | 4.5 | 85% | Extension conflicts |
| Biome (lint/format) | 4.3 | 95% | Missing some ESLint rules |
| Rsbuild | 4.2 | 60% | Migration from Vite ongoing |
| Vite | 4.0 | 40% | Being phased out |
| Playwright (E2E) | 3.8 | 75% | Flaky tests in CI |
| Vitest | 4.4 | 90% | Snapshot testing UX |
| Pytest | 4.1 | 80% | Fixture management |
| Docker Compose | 3.5 | 70% | Slow startup on macOS |
| GitHub Actions | 3.9 | 100% | Queue time during peak |
| Sentry | 4.0 | 85% | Alert noise |
| DataDog | 3.8 | 60% | Cost concerns |

## Action recommendations

1. **Target < 3 min inner loop**: reduce warm build time; YiPet webpack build (22s warm) is the biggest opportunity
2. **Fix flaky E2E tests**: 3.5% flaky rate is too high; quarantine flaky tests, fix within the sprint
3. **Improve hot reload reliability**: 85% → 95%; investigate macOS FSEvents workaround; polling as fallback
4. **Reduce CI queue time**: add 2 more CI runners during peak hours (10am-4pm); target < 1 min queue
5. **Docker Compose optimization**: pre-built images, volume caching; target < 30s startup
6. **DX survey quarterly**: run SPACE survey every quarter; track trends; address top 3 pain points
7. **E2E test parallelization**: 8.5 min E2E suite → target < 5 min with sharding
8. **Toolchain consolidation**: complete Vite → Rsbuild migration; remove Vite by Q4



- Ignoring flaky tests → "just re-run" culture; flaky tests erode trust and waste CI minutes
- Slow build acceptance → "it's always been this way"; build time is a metric worth optimizing
- Docker on macOS → known performance issues; use native binaries or remote dev environments
- Toolchain churn → switching tools without measuring impact; stabilize before optimizing
- Measuring activity not outcomes → lines of code, commits per day; measure flow time and satisfaction

## Related

- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — delivery performance
- Same class: [dashboard-quality-metrics](../quality-security/dashboard-quality-metrics.md) — quality metrics
- Downstream: [set-up-testing-infrastructure](set-up-testing-infrastructure.md) — testing infrastructure
- Downstream: [dev-environment-hmr](../infrastructure/dev-environment-hmr.md) — HMR setup
- References: SPACE — *DevEx Framework* (Nicole Forsgren et al.); Google — *DevOps Research*; GitHub — *Octoverse: Developer Experience*
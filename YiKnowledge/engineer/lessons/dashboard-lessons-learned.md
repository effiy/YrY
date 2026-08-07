---
title: lessons learned dashboard
aliases:
- lessons dashboard
- learning dashboard
- postmortem trends dashboard
- failure patterns dashboard
tags:
- dashboard
- lessons
- learning
- postmortem
- failures
- wins
- gotchas
category: engineer/lessons
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- tech-lead
- knowledge-curator
benefit: organizational learning patterns and knowledge capture visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./INDEX.md
- ../process/retrospective-cadence.md
- ../process/review-lessons.md
- ../../knowledge-curator/governance/dashboard-knowledge-health.md
tacit: false
---

# lessons learned dashboard

> **As a** tech lead, **I want to** track organizational learning patterns and knowledge capture, **so that** the team systematically improves by learning from wins, failures, and gotchas.

> Learning from experience is the highest-leverage engineering practice. This dashboard tracks wins, failures, gotchas, learning velocity, and whether lessons are actually applied.

## Summary

- 5 learning dimensions: wins and successes, failures and incidents, gotchas and pitfalls, learning velocity, knowledge application
- Wins tracked by category (technical, process, product, team) and impact (revenue, time saved, quality improved)
- Failures tracked with root cause recurrence rate — the same failure twice is a learning failure
- Gotchas tracked as reusable patterns; adoption rate of gotcha-prevention measures
- Dashboard reviewed at monthly learning review; quarterly patterns analysis

## Core viewpoints

- The same failure twice is a system failure — if a root cause recurs, the learning loop is broken
- Wins are under-leveraged — most teams don't systematically analyze why something worked
- Gotchas are the most practical knowledge — they're concrete, actionable, and immediately useful
- Learning velocity ≠ lesson count — it's lessons applied, not lessons documented

## Key information

### 5-panel lessons overview

```
┌──────────────────────────────────────────────────────────────────┐
│  WINS & SUCCESSES                │  FAILURES & INCIDENTS           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:     28 wins     │   │  │  Total:     18 failures │   │
│  │  This Q:     5 wins     │   │  │  This Q:     3 failures │   │
│  │  Technical: 45%         │   │  │  Root cause: 94% found   │   │
│  │  Process:   30%         │   │  │  Recurrence: 6% (1)     │   │
│  │  Product:   15%         │   │  │  Postmortem: 100% (SEV)  │   │
│  │  Team:      10%         │   │  │  Action done: 72%        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  GOTCHAS & PITFALLS              │  LEARNING VELOCITY             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:     22 gotchas  │   │  │  Lessons/month: 3.2     │   │
│  │  This Q:     4 gotchas  │   │  │  Applied:      68%      │   │
│  │  Prevention: 72% adopted│   │  │  Shared:       85%      │   │
│  │  Re-hit:     8% (1)     │   │  │  Reviewed:     2.8/mo  │   │
│  │  Severity:   2 critical │   │  │  Stale:         4       │   │
│  │  Platform:   3 macOS    │   │  │  Retention:     92%     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Wins by category

| Win | Category | Impact | Impact value | Date | Replicable? |
|---|---|---|---|---|---|
| Vite → Rsbuild migration (-26% build) | Technical | Build time | 8 min/day/eng | Jul 2026 | Yes (pattern) |
| LLM eval framework reduced incidents 40% | Technical | Quality | 12 fewer incidents | Jun 2026 | Yes (framework) |
| Contract testing caught 8 bugs pre-prod | Process | Quality | ~16 hours saved | Jul 2026 | Yes (process) |
| Biweekly architecture review | Process | Alignment | Better decisions | May 2026 | Yes (cadence) |
| Multi-model routing reduced cost 30% | Technical | Cost | $8,400/month | Jul 2026 | Yes (pattern) |
| AI Code Review launched (85% satisfaction) | Product | Revenue | New revenue stream | Jun 2026 | Partially |
| Onboarding program reduced ramp 25% | Team | Productivity | ~15 days/hire | May 2026 | Yes (program) |
| Hackathon produced 3 shipped features | Team | Innovation | 3 features | Apr 2026 | Yes (event) |

### Win pattern analysis

| Pattern | Occurrences | Most recent | Replicability | Leverage |
|---|---|---|---|---|
| Toolchain migration → build performance | 3 (Webpack→Vite, Vite→Rsbuild, ESLint→Biome) | Jul 2026 | High | High |
| Eval-driven development → quality | 2 (LLM eval, contract testing) | Jul 2026 | High | High |
| Process cadence → alignment | 2 (Arch review, sprint retro) | May 2026 | Medium | Medium |
| AI optimization → cost reduction | 2 (Model routing, caching) | Jul 2026 | High | High |

### Failures by root cause

| Failure | Severity | Root cause | Date | Postmortem | Recurrence? | Action items |
|---|---|---|---|---|---|---|
| DB connection exhaustion | SEV1 | Connection pool misconfig | Jul 2026 | Yes | No | 4/5 done |
| LLM API outage (single provider) | SEV1 | No multi-provider failover | Jun 2026 | Yes | No | 3/4 done |
| Search index corruption | SEV2 | Race condition in reindex | May 2026 | Yes | No | 5/5 done |
| Staging data leak to production | SEV2 | Environment config mix-up | Apr 2026 | Yes | No | 3/3 done |
| macOS FSEvents silent drop | SEV3 | OS bug, no workaround | Mar 2026 | Yes | **Yes (3rd time)** | 2/2 done |
| Cache stampede on deployment | SEV2 | No cache warming | Mar 2026 | Yes | No | 4/4 done |

### Root cause recurrence analysis

| Root cause category | Total incidents | Recurred | Recurrence rate | Trend |
|---|---|---|---|---|
| Code logic error | 6 | 0 | 0% | → |
| Configuration error | 4 | 1 | 25% | ↑ |
| Infrastructure failure | 3 | 0 | 0% | → |
| Dependency issue | 3 | 0 | 0% | → |
| Human/process error | 2 | 0 | 0% | → |
| **Total** | **18** | **1** | **5.6%** | ↓ |

### Gotchas by category

| Gotcha | Category | Severity | Platforms | Prevention adopted | Re-hit? |
|---|---|---|---|---|---|
| macOS FSEvents silently drops events | Platform | Critical | macOS | 85% (polling fallback) | Yes |
| SSE onDone callback never fires | Integration | High | All | 95% (timeout guard) | No |
| No lockfile = supply chain risk | Security | High | All | 100% (CI check) | No |
| Docker on macOS performance | Platform | Medium | macOS | 60% (native alt) | No |
| Hot reload fails with production NODE_ENV | Build | Medium | All | 90% (env check) | No |
| jsxDEV mismatch in dev mode | Build | High | React | 95% (mode check) | No |
| Database migration without dry-run | Data | High | All | 80% (dry-run CI) | No |
| Stale feature flags cause silent bugs | Code | Medium | All | 70% (flag audit) | No |

### Gotcha prevention adoption

| Prevention measure | Adopted by | % of teams | Target | Gap |
|---|---|---|---|---|
| Polling fallback for file watchers | YiVad, YiAi | 67% | 100% | YiPet needs adoption |
| SSE timeout guard | YiVad, YiAi, YiPet | 100% | 100% | At target |
| CI lockfile check | YiVad, YiAi, YiPet | 100% | 100% | At target |
| Native dev setup (no Docker) | YiAi | 33% | 80% | YiVad, YiPet on Docker |
| NODE_ENV check in build | YiPet | 33% | 100% | YiVad, YiAi need adoption |
| DB migration dry-run | YiAi | 33% | 100% | YiVad, YiPet need adoption |
| Feature flag audit | YiVad | 33% | 100% | YiAi, YiPet need adoption |

### Learning velocity

| Metric | Current | Target | Trend |
|---|---|---|---|
| Lessons documented per month | 3.2 | > 3 | → |
| Lessons applied (% of documented) | 68% | > 80% | ↑ |
| Lessons shared (% presented to team) | 85% | > 90% | ↑ |
| Lessons reviewed (monthly review) | 2.8/month | > 3 | ↑ |
| Stale lessons (not reviewed > 12 months) | 4 | 0 | ↓ |
| Knowledge retention (lessons still relevant) | 92% | > 90% | → |

### Learning loop health

```
Document ──→ Share ──→ Apply ──→ Review ──→ Retain
   │           │         │         │          │
   │  3.2/mo   │  85%    │  68%    │  2.8/mo  │  92%
   │           │         │         │          │
   └──────────────────────────────────────────┘
                Learning loop efficiency: 58%
                Target: > 70%
```

**Learning loop efficiency** = Document × Share × Apply × Review × Retain. Current: 0.93 × 0.85 × 0.68 × 0.82 × 0.92 = 58%.

### Quarterly learning summary

| Quarter | Wins | Failures | Gotchas | Lessons applied | Recurrence rate | Loop efficiency |
|---|---|---|---|---|---|---|
| 2025-Q4 | 5 | 5 | 4 | 55% | 12% | 48% |
| 2026-Q1 | 7 | 4 | 6 | 60% | 8% | 52% |
| 2026-Q2 | 8 | 3 | 5 | 65% | 6% | 55% |
| 2026-Q3 (to date) | 5 | 3 | 4 | 68% | 6% | 58% |
| **Trend** | ↑ | ↓ | → | ↑ | ↓ | ↑ |

## Action recommendations

1. **Fix the learning loop bottleneck**: Apply (68%) is the weakest link; focus on turning lessons into action items
2. **Eliminate recurrence**: 1 recurrence (macOS FSEvents) is too many; every recurrence gets a dedicated fix project
3. **Close gotcha prevention gaps**: 4 prevention measures below 50% adoption; create adoption plan per team
4. **Replicate top wins**: toolchain migration pattern (3 wins) and eval-driven development (2 wins) should be cross-team standards
5. **Monthly learning review**: review top 3 wins, failures, and gotchas; assign action items; track application
6. **Stale lesson cleanup**: 4 stale lessons need review; update or archive
7. **Win celebration**: public recognition for wins; share in all-hands; build a culture of learning from success
8. **Target 70% loop efficiency**: improve Apply from 68% → 80% and Review from 82% → 90%



- Blame-oriented postmortems → focusing on "who" instead of "what"; blameless postmortems are essential for learning
- Lessons documented but forgotten → write-only knowledge base; monthly review is the immune system
- Ignoring wins → only analyzing failures; wins contain the blueprint for success
- Gotcha fatigue → "we know about that gotcha" but no prevention adopted; a known gotcha without prevention is a future incident
- Learning theater → rituals without substance; the measure of learning is changed behavior, not documented lessons

## Related

- Same class: [dashboard-knowledge-health](../../knowledge-curator/governance/dashboard-knowledge-health.md) — knowledge base health
- Same class: [dashboard-incident-trends](../../oncall-sre/incident-response/dashboard-incident-trends.md) — incident trends
- Downstream: [retrospective-cadence](../process/retrospective-cadence.md) — retrospective process
- Downstream: [review-lessons](../process/review-lessons.md) — lesson review process
- References: Google — *Postmortem Culture* (SRE Book); Amy Edmondson — *The Fearless Organization*; John Allspaw — *Blameless Postmortems*
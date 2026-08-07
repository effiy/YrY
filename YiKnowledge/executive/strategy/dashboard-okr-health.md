---
title: OKR health dashboard
aliases:
- objectives and key results dashboard
- goal tracking dashboard
- OKR adoption dashboard
- alignment dashboard
tags:
- dashboard
- okr
- goals
- alignment
- strategy-execution
- kpi
category: executive/strategy
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- executive
- tech-lead
- product-manager
benefit: OKR adoption, alignment, and achievement health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- OKR adoption, alignment, progress, achievement rate, and cascade quality defined
related:
- ./dashboard-executive-kpi.md
- ../roadmap/dashboard-strategic-roadmap.md
- ../../product-manager/frameworks/dashboard-pm-frameworks.md
- ../../product-manager/strategy/dashboard-product-strategy.md
- ../../tech-lead/roadmap/dashboard-roadmap-progress.md
tacit: false
---

# OKR health dashboard

> **As an** executive, **I want to** track OKR adoption, alignment, and achievement across the organization, **so that** every team is aligned to strategic goals, progress is transparent, and OKRs are a tool for focus, not a compliance exercise.

> OKRs are the operating system for strategy execution. This dashboard tracks OKR adoption, alignment quality, progress velocity, achievement rate, and cascade health — turning OKRs from a quarterly paperwork exercise into a real-time strategy execution framework.

## Summary

- 5 OKR dimensions: adoption, alignment, progress velocity, achievement rate, cascade quality
- 12 company objectives, 48 company KRs; 85 team objectives, 340 team KRs across 8 teams
- OKR adoption: 92% of teams have active OKRs; 78% of KRs are measurable (vs 90% target)
- Average achievement rate: 72% (target 70% — OKRs should be ambitious, not guaranteed)
- OKR cycle: quarterly; mid-quarter check-ins at 85% completion rate; quarter-end scoring at 95%
- Dashboard reviewed monthly; OKR health review quarterly with executive leadership

## Core viewpoints

- OKRs are a communication tool, not a performance management tool — if OKRs are tied to compensation, they will be sandbagged; OKRs should be ambitious (60-70% is success)
- Alignment is multiplicative — if company objectives → team objectives → individual objectives are misaligned, effort is wasted; every level of misalignment compounds
- Measurability is the hardest part — "improve developer experience" is not a key result; "reduce build time from 12 min to 4 min" is; if it can't be measured, it's not a KR
- The mid-quarter check-in is the most important ceremony — end-of-quarter scoring is too late to course-correct; mid-quarter check-ins surface problems while there's still time to fix them

## Key information

### 5-panel OKR overview

```
┌──────────────────────────────────────────────────────────────────┐
│  OKR ADOPTION                      │  OKR ALIGNMENT                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Teams with OKRs: 92%   │   │  │  Company→Team: 88%       │   │
│  │  KRs measurable: 78%    │   │  │  Team→Individual: 72%    │   │
│  │  Check-ins done: 85%    │   │  │  Cross-team deps: 65%    │   │
│  │  Scored on time: 95%    │   │  │  Orphaned KRs: 8 (2%)    │   │
│  │  Teams without: 1 (8%)  │   │  │  Duplicate KRs: 5 (1%)   │   │
│  │  "OKR theater": 3 teams │   │  │  Conflict KRs: 3 (1%)    │   │
│  │  OKR maturity: L3.5     │   │  │  Alignment score: 82/100 │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  PROGRESS VELOCITY                 │  ACHIEVEMENT RATE                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  On track:    62% ███   │   │  │  Exceeded (>100%): 12%   │   │
│  │  At risk:     25% █▌    │   │  │  Achieved (70-100%):48% │   │
│  │  Behind:      10% ▌     │   │  │  Partial (40-70%): 25%   │   │
│  │  Not started:  3% ▏    │   │  │  Missed (<40%):   15%    │   │
│  │  Velocity:    0.78      │   │  │  Avg achievement: 72%    │   │
│  │  (should be 0.5-0.7)    │   │  │  Stretch target: 70%     │   │
│  │  Confidence:  72%       │   │  │  Sandbagging: 12% of KRs │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Company OKRs (Q3 2026)

| Objective | Key result | Target | Current | Progress | Confidence | Status |
|---|---|---|---|---|---|---|
| **O1: Accelerate AI-powered features** | KR1.1: AI features drive 30% of new revenue | $1.2M | $820K | 68% | 75% | On track |
| | KR1.2: 50% of users use ≥ 1 AI feature weekly | 50% | 38% | 76% | 80% | On track |
| | KR1.3: AI feature NPS > 45 | 45 | 42 | 93% | 85% | On track |
| | KR1.4: Launch 3 new AI features | 3 | 2 | 67% | 90% | On track |
| **O2: Scale enterprise adoption** | KR2.1: Enterprise ARR growth 40% YoY | $8.5M | $6.2M | 55% | 60% | At risk |
| | KR2.2: 20 new enterprise logos | 20 | 8 | 40% | 50% | At risk |
| | KR2.3: Enterprise churn < 2% | < 2% | 2.8% | 60% | 45% | At risk |
| | KR2.4: SSO/SAML adoption 80% | 80% | 65% | 81% | 70% | On track |
| **O3: Strengthen platform reliability** | KR3.1: 99.95% uptime for Tier 0 services | 99.95% | 99.93% | 60% | 65% | At risk |
| | KR3.2: P1 incident MTTR < 30 min | 30 min | 42 min | 40% | 55% | Behind |
| | KR3.3: All Tier 0 services pass chaos testing | 6/6 | 4/6 | 67% | 70% | On track |
| | KR3.4: Reduce critical CVEs to 0 | 0 | 3 | 25% | 40% | Behind |
| **Overall** | | | | **62%** | **72%** | |

### OKR adoption by team

| Team | Active OKRs | KRs | Measurable KRs | Check-in rate | Scoring rate | Maturity | Health |
|---|---|---|---|---|---|---|---|
| Platform | Yes | 20 | 18 (90%) | 92% | 100% | L4 | A (92) |
| AI/ML | Yes | 24 | 20 (83%) | 88% | 100% | L4 | A (90) |
| Web Frontend | Yes | 22 | 18 (82%) | 85% | 95% | L3 | B+ (84) |
| Mobile | Yes | 18 | 14 (78%) | 80% | 90% | L3 | B (78) |
| Data | Yes | 16 | 12 (75%) | 75% | 85% | L3 | B- (72) |
| SRE | Yes | 20 | 16 (80%) | 90% | 100% | L4 | A (88) |
| Product | Yes | 18 | 15 (83%) | 82% | 95% | L3 | B+ (82) |
| Design | Yes | 12 | 8 (67%) | 70% | 80% | L2 | C+ (65) |
| **Overall** | **92%** | **150** | **121 (78%)** | **85%** | **95%** | **L3.5** | **B+ (83)** |

### OKR alignment analysis

| Alignment metric | Current | Target | Gap | Issue |
|---|---|---|---|---|
| **Company → Team cascade** | 88% | 95% | -7% | 5 team KRs have no clear company KR parent |
| **Team → Individual cascade** | 72% | 85% | -13% | Individual OKRs not consistently adopted |
| **Cross-team dependency alignment** | 65% | 80% | -15% | Teams don't review peer team OKRs for conflicts |
| **Orphaned KRs** | 8 (2%) | 0% | +2% | KRs without parent objectives |
| **Duplicate KRs** | 5 (1%) | 0% | +1% | Two teams tracking the same KR independently |
| **Conflicting KRs** | 3 (1%) | 0% | +1% | Speed vs reliability, growth vs cost |
| **Overall alignment score** | 82/100 | 90/100 | -8 pts | |

### OKR cascade quality

| Level | Objectives | KRs | Measurable | Graded | Avg confidence | Cascade fidelity |
|---|---|---|---|---|---|---|
| **Company** | 4 | 16 | 16 (100%) | 100% | 72% | — |
| **Department** | 8 | 32 | 30 (94%) | 95% | 68% | 92% |
| **Team** | 24 | 85 | 68 (80%) | 88% | 65% | 85% |
| **Individual** | 45 | 120 | 72 (60%) | 65% | 58% | 72% |
| **Overall** | **81** | **253** | **186 (74%)** | **78%** | **62%** | **82%** |

### Progress velocity by quarter week

| Week | Expected progress | Actual progress | On track % | At risk % | Behind % | Check-in rate |
|---|---|---|---|---|---|---|
| **Week 1-2** (Planning) | 5% | 5% | 95% | 3% | 2% | 92% |
| **Week 3-4** (Ramp) | 20% | 18% | 85% | 12% | 3% | 88% |
| **Week 5-6** (Execute) | 40% | 35% | 78% | 15% | 7% | 85% |
| **Week 7-8** (Mid-quarter) | 55% | 48% | 72% | 18% | 10% | 82% |
| **Week 9-10** (Accelerate) | 70% | 62% | 68% | 22% | 10% | 80% |
| **Week 11-12** (Finish) | 90% | 78% | 65% | 25% | 10% | 78% |
| **Week 13** (Score) | 100% | 72% | — | — | — | 95% |

### OKR achievement rate by quarter

| Quarter | Company OKRs | Achieved (>70%) | Partial (40-70%) | Missed (<40%) | Avg achievement | Sandbagging rate |
|---|---|---|---|---|---|---|
| **Q3 2026** (current) | 4 | In progress | — | — | 62% (mid-Q) | — |
| **Q2 2026** | 4 | 3 (75%) | 1 (25%) | 0 (0%) | 78% | 8% |
| **Q1 2026** | 4 | 2 (50%) | 1 (25%) | 1 (25%) | 68% | 12% |
| **Q4 2025** | 4 | 3 (75%) | 1 (25%) | 0 (0%) | 82% | 15% |
| **Q3 2025** | 3 | 2 (67%) | 1 (33%) | 0 (0%) | 74% | 10% |
| **Overall** | **19** | **10 (53%)** | **4 (21%)** | **1 (5%)** | **72%** | **11%** |

### OKR health check — mid-quarter Q3 2026

| Health check item | Score | Notes |
|---|---|---|
| **Are OKRs still relevant?** | 85/100 | O2 (Enterprise) needs revision — market conditions changed |
| **Are KRs measuring the right things?** | 78/100 | 3 KRs are activity metrics, not outcome metrics |
| **Is progress transparent?** | 82/100 | 6 teams have stale check-ins (> 2 weeks) |
| **Are blockers surfaced?** | 72/100 | Only 45% of teams flag blockers in OKR tool |
| **Are we celebrating wins?** | 65/100 | Wins celebrated only at quarter-end, not continuously |
| **Are we course-correcting?** | 70/100 | 3 at-risk KRs have no documented mitigation plan |
| **Overall health** | **75/100** | |

### OKR maturity model

| Level | Description | Current | Teams at level |
|---|---|---|---|
| **L1: Ad-hoc** | No formal OKRs, goals in email/docs | — | 0 teams |
| **L2: Basic** | OKRs set quarterly, limited tracking | — | 1 (Design) |
| **L3: Defined** | OKRs in tool, check-ins, scoring | ← We are here (3.5) | 4 teams |
| **L4: Managed** | Cascade aligned, data-driven, mid-quarter reviews | — | 3 teams |
| **L5: Optimizing** | Continuous OKR, real-time dashboards, predictive | — | 0 teams |

### OKR anti-pattern detection

| Anti-pattern | Occurrences | Teams affected | Example | Remediation |
|---|---|---|---|---|
| **Activity as KR** | 12 KRs | 5 teams | "Run 10 user interviews" vs "Reduce churn by 15%" | Replace with outcome metrics |
| **Sandbagging** | 8 KRs | 3 teams | Target set at 5% when 15% is achievable | Review historical achievement |
| **Vanity metrics** | 10 KRs | 4 teams | "Page views" without conversion | Tie to business outcome |
| **Too many OKRs** | 2 teams | 2 teams | 8 objectives, 40 KRs | Cap at 3-5 O, 3-5 KR per O |
| **Set-and-forget** | 3 teams | 3 teams | No check-ins after week 2 | Mid-quarter review required |
| **OKR cascade as copy-paste** | 5 KRs | 2 teams | Team KR = Company KR verbatim | Require team-specific KR |
| **Total** | **40 issues** | **8 teams** | | |

## Action recommendations

1. **Measurable KR gap**: 78% measurable vs 90% target; audit all KRs, convert activity-based KRs to outcome-based, provide KR writing training
2. **Design team OKR maturity**: L2 maturity, 67% measurable; pair with Platform team for OKR coaching, implement OKR tooling
3. **Enterprise OKR at risk (O2)**: 55% progress, 45% confidence; escalate to executive team, revise KR targets based on market conditions, add dedicated sales resources
4. **Individual OKR cascade**: 72% alignment, 60% measurable; pilot individual OKRs in 2 teams before rolling out, ensure quality over quantity
5. **Mid-quarter check-in compliance**: 85% completion, 78% by week 11-12; automate check-in reminders, add to team meeting agenda, tie to sprint review
6. **Cross-team dependency alignment**: 65% score; add cross-team OKR review session during planning week, flag conflicting KRs
7. **OKR "theater" detection**: 40 anti-patterns across 8 teams; add anti-pattern auto-detection to OKR tool, coach teams during planning
8. **Win celebration cadence**: 65/100 score; add "OKR wins" segment to monthly all-hands, celebrate partial wins, not just 100% achievement
9. **Confidence scoring adoption**: 72% company, 58% individual; require confidence score with every check-in, use for risk escalation
10. **Monthly OKR health review**: review adoption, alignment, progress velocity, anti-patterns, and achievement trends with executive leadership



- OKRs as performance review → tying OKR achievement to compensation; this guarantees sandbagging and kills ambition — OKRs should be stretch goals, not quotas
- Activity as key result → "Launch feature X" is an activity, not a result; "Increase user engagement by 20% through feature X" is a key result — output vs outcome
- The "everything is priority" trap → setting 8 objectives with 40 KRs; OKRs are about focus — if everything is important, nothing is
- OKR cascade as waterfall → each level breaking down OKRs in isolation over 4 weeks; cascading should be a conversation, not a decomposition exercise
- Set-and-forget → setting OKRs in week 1 and never looking at them until week 13; OKRs are a weekly management tool, not a quarterly report

## Related

- Same class: [dashboard-executive-kpi](dashboard-executive-kpi.md) — executive KPI and business health
- Same class: [dashboard-strategic-roadmap](../roadmap/dashboard-strategic-roadmap.md) — strategic roadmap and initiatives
- Same class: [dashboard-pm-frameworks](../../product-manager/frameworks/dashboard-pm-frameworks.md) — PM frameworks
- Same class: [dashboard-product-strategy](../../product-manager/strategy/dashboard-product-strategy.md) — product strategy
- Same class: [dashboard-roadmap-progress](../../tech-lead/roadmap/dashboard-roadmap-progress.md) — roadmap progress
- References: John Doerr — *Measure What Matters*; Google — *OKR Playbook*; Christina Wodtke — *Radical Focus*; Rick Klau — *How Google Sets Goals*; Felipe Castro — *OKR Maturity Model*
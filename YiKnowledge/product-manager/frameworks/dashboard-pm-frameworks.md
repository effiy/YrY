---
title: pm frameworks dashboard
aliases:
- product management frameworks dashboard
- PM methodology dashboard
- frameworks adoption dashboard
- product practice dashboard
tags:
- dashboard
- pm
- frameworks
- methodology
- adoption
- product-management
category: product-manager/frameworks
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- product-manager
- tech-lead
- executive
benefit: PM framework adoption and effectiveness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../discovery/metrics--dashboard-product-portfolio.md
- ../delivery/dashboard-product-delivery.md
- ../strategy/dashboard-product-strategy.md
- ../../tech-lead/decisions/dashboard-architecture-decisions.md
tacit: false
---

# pm frameworks dashboard

> **As a** product manager, **I want to** track which PM frameworks are adopted and how effectively they're used, **so that** the PM practice is consistent, data-driven, and continuously improving.

> Frameworks are only as good as their application. This dashboard tracks adoption, training, effectiveness, consistency, and maturity of the PM framework toolkit across all product teams.

## Summary

- 5 framework dimensions: adoption coverage, training & enablement, framework effectiveness, cross-team consistency, PM maturity
- 15 frameworks tracked: JTBD, Kano, RICE, ICE, Dual-Track Agile, HEART, AARRR, OKR, BRD, PRD, User Story Mapping, Product Discovery, Edge Case Backlog, Prioritization Matrix, Weekly Report
- Adoption measured by % of PMs actively using each framework; effectiveness by self-assessment and outcome correlation
- Training tracked by % of PMs formally trained per framework; consistency by cross-team application variance
- Dashboard reviewed quarterly; PM practice retrospective biannually

## Core viewpoints

- Frameworks are tools, not goals — the measure of a framework is whether it leads to better product decisions, not whether it's used
- Consistency amplifies collaboration — when all PMs use the same prioritization framework, cross-team trade-off conversations are faster
- Training without practice is waste — framework training must be followed by coached application within 30 days
- Framework maturity is a journey — teams progress from ad-hoc → defined → managed → optimized

## Key information

### 5-panel frameworks overview

```
┌──────────────────────────────────────────────────────────────────┐
│  FRAMEWORK ADOPTION               │  TRAINING & ENABLEMENT          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  JTBD:       75% ███▌   │   │  │  Trained:    72% ███▌   │   │
│  │  RICE:       85% ████   │   │  │  Certified:  45% ██     │   │
│  │  Kano:       55% ██▌    │   │  │  Playbooks:  12 of 15  │   │
│  │  Dual-Track: 60% ███    │   │  │  Templates:  14 of 15  │   │
│  │  HEART:      70% ███▌   │   │  │  Coaching:   8 sess/mo │   │
│  │  OKR:        90% ████▌  │   │  │  NPS (PM):   42        │   │
│  │  BRD:        95% ████▌  │   │  │  Time-to-comp: 45 days │   │
│  │  PRD:        80% ████   │   │  │  New PM ramp: 60 days  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  FRAMEWORK EFFECTIVENESS         │  CROSS-TEAM CONSISTENCY         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Decision quality: 78%  │   │  │  Variance:    0.28      │   │
│  │  Cycle time Δ:   -15%   │   │  │  Shared defs: 82%       │   │
│  │  Stakeholder align: 82% │   │  │  Template use: 88%      │   │
│  │  Re-work rate:  -22%    │   │  │  Review std:   75%      │   │
│  │  Outcome link:  0.72 r  │   │  │  Calibration:  2/yr     │   │
│  │  Perceived value: 3.8/5 │   │  │  Drift alerts: 3        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Framework adoption by team

| Framework | AI/ML | Web | Platform | Mobile | Data | Overall | Trend |
|---|---|---|---|---|---|---|---|
| Jobs-to-be-Done | 80% | 70% | 60% | 75% | 50% | 75% | ↑ |
| RICE Prioritization | 90% | 85% | 80% | 85% | 75% | 85% | → |
| Kano Model | 60% | 55% | 40% | 50% | 45% | 55% | ↑ |
| Dual-Track Agile | 70% | 65% | 50% | 55% | 40% | 60% | ↑ |
| HEART/AARRR Metrics | 75% | 70% | 55% | 65% | 60% | 70% | → |
| OKR Design | 95% | 90% | 85% | 90% | 80% | 90% | → |
| BRD (Business Req Doc) | 95% | 95% | 90% | 95% | 95% | 95% | → |
| PRD/Spec Writing | 85% | 80% | 75% | 80% | 70% | 80% | ↑ |
| User Story Mapping | 80% | 75% | 70% | 70% | 60% | 75% | ↑ |
| Product Discovery | 75% | 70% | 55% | 65% | 50% | 70% | ↑ |
| Edge Case Backlog | 60% | 55% | 50% | 45% | 40% | 55% | ↑ |
| Prioritization Matrix | 85% | 80% | 75% | 80% | 70% | 80% | → |
| Weekly Report | 90% | 90% | 85% | 90% | 85% | 90% | → |
| Launch Framework | 80% | 75% | 70% | 75% | 65% | 75% | ↑ |
| **Team average** | **80%** | **76%** | **67%** | **73%** | **63%** | **75%** | |

### Framework effectiveness self-assessment

| Framework | Decision quality | Speed improvement | Alignment improvement | Perceived value (1-5) | Would recommend? |
|---|---|---|---|---|---|
| JTBD | 82% | +18% | 85% | 4.2 | 88% |
| RICE | 78% | +25% | 80% | 4.0 | 85% |
| Kano | 75% | +10% | 72% | 3.5 | 62% |
| Dual-Track Agile | 80% | -5% (initial) | 85% | 3.8 | 70% |
| HEART/AARRR | 76% | +12% | 78% | 3.7 | 72% |
| OKR | 85% | +20% | 90% | 4.5 | 92% |
| BRD | 80% | +15% | 88% | 4.0 | 82% |
| PRD | 82% | +22% | 82% | 4.2 | 85% |
| User Story Mapping | 78% | +15% | 80% | 3.9 | 78% |
| Product Discovery | 84% | +30% | 82% | 4.3 | 88% |
| Edge Case Backlog | 72% | +8% | 70% | 3.2 | 55% |
| Weekly Report | 70% | +5% | 85% | 3.8 | 75% |
| **Overall** | **78%** | **+15%** | **82%** | **3.8** | **78%** |

### PM training & enablement pipeline

| Training stage | PMs | % of 15 PMs | Target |
|---|---|---|---|
| Framework playbook read | 12 | 80% | 100% |
| Formal workshop completed | 10 | 67% | 85% |
| coached application (30 days) | 8 | 53% | 75% |
| Peer review passed | 7 | 47% | 60% |
| Certified (teaches others) | 5 | 33% | 40% |
| **Avg time from hire to certified** | **4.5 months** | | **< 4 months** |

### Framework playbook & template inventory

| Framework | Playbook exists? | Template exists? | Last updated | Quality score |
|---|---|---|---|---|
| JTBD | Yes | Yes | 2026-07 | 85% |
| RICE | Yes | Yes | 2026-06 | 90% |
| Kano | Yes | Yes | 2025-12 | 70% |
| Dual-Track Agile | Yes | Yes | 2026-05 | 82% |
| HEART/AARRR | Yes | Yes | 2026-04 | 78% |
| OKR | Yes | Yes | 2026-07 | 92% |
| BRD | Yes | Yes | 2026-07 | 88% |
| PRD | Yes | Yes | 2026-06 | 85% |
| User Story Mapping | Yes | Yes | 2026-03 | 75% |
| Product Discovery | Yes | Yes | 2026-07 | 88% |
| Edge Case Backlog | Yes | Yes | 2025-11 | 62% |
| Prioritization Matrix | Yes | Yes | 2026-05 | 80% |
| Weekly Report | Yes | Yes | 2026-07 | 85% |
| Launch Framework | No | Yes | 2026-02 | 65% |
| AI Product Launch | Yes | No | 2026-07 | 78% |

### Cross-team consistency audit

| Consistency dimension | Score | Variance | Issue |
|---|---|---|---|
| BRD structure and depth | 88% | 0.15 | Minor — some teams skip risk section |
| PRD format and granularity | 82% | 0.22 | Moderate — user story detail varies |
| Prioritization criteria | 75% | 0.32 | High — RICE vs ICE vs custom mix |
| OKR cascading (company→team) | 85% | 0.18 | Minor — Platform team OKRs less specific |
| Metric definitions (MAU, DAU, etc.) | 80% | 0.25 | Moderate — adoption metric varies |
| Discovery artifact standards | 70% | 0.38 | High — some teams skip discovery docs |
| Launch checklist | 78% | 0.28 | Moderate — Mobile team uses custom list |
| Stakeholder communication format | 88% | 0.12 | Minor — well-aligned |
| **Overall consistency** | **82%** | **0.28** | **Target: > 85%, variance < 0.20** |

### PM maturity model by team

| Maturity level | AI/ML | Web | Platform | Mobile | Data | Criteria |
|---|---|---|---|---|---|---|
| L1: Ad-hoc | — | — | — | — | — | No standard frameworks |
| L2: Defined | — | — | Platform | Mobile | Data | Frameworks defined, spotty use |
| L3: Managed | AI/ML | Web | — | — | — | Frameworks used consistently |
| L4: Optimized | — | — | — | — | — | Data-driven improvement |
| **Current level** | **L3** | **L3** | **L2** | **L2** | **L2** | |

### Framework correlation with business outcomes

| Framework | Adoption | Correlation with feature success | Correlation with on-time delivery | Correlation with NPS |
|---|---|---|---|---|
| Product Discovery | 70% | **0.78** | 0.45 | **0.72** |
| JTBD | 75% | **0.74** | 0.38 | **0.68** |
| OKR | 90% | 0.62 | **0.58** | 0.42 |
| Dual-Track Agile | 60% | 0.65 | 0.42 | 0.55 |
| RICE | 85% | 0.52 | **0.62** | 0.35 |
| HEART/AARRR | 70% | 0.48 | 0.32 | **0.58** |
| User Story Mapping | 75% | 0.55 | 0.48 | 0.40 |

## Action recommendations

1. **Platform and Data teams to L3**: both at L2 maturity; assign PM coach, schedule framework workshops, mandate BRD/PRD templates
2. **Kano Model adoption**: 55% adoption, lowest perceived value (3.5/5); refresh playbook, add AI-era Kano examples, run workshop
3. **Edge Case Backlog**: 55% adoption, lowest satisfaction; template is from 2025-11; redesign with automation triggers
4. **Create Launch Framework playbook**: template exists but no playbook; 65% quality score; write playbook by Q3 end
5. **Reduce cross-team variance**: 0.28 variance, 3 teams with high drift; standardize prioritization criteria and discovery artifacts
6. **Accelerate PM certification**: 33% certified, 4.5 months to certify; create PM buddy program, reduce time-to-certify to 3 months
7. **Product Discovery correlation**: 0.78 with feature success — highest of all frameworks; invest in discovery training for all PMs
8. **Quarterly calibration session**: review framework usage, share best practices, update playbooks based on real outcomes
9. **AI Product Launch framework**: template missing; create template based on lessons from AI Platform Launch
10. **Measure framework ROI**: link framework usage to feature outcomes systematically; retire frameworks with < 0.30 correlation



- Framework cargo cult → applying a framework because "that's what we do" without understanding why; every framework must earn its place
- Framework overload → teaching 15 frameworks to a new PM in month 1; start with BRD + OKR + one prioritization framework
- One-size-fits-all → forcing RICE on every decision including small bugs; match framework to decision size
- Template as framework → filling in a template without the thinking behind it; BRD is not a form, it's a thinking tool
- Framework abandonment → switching prioritization frameworks every quarter; pick one, use it for 6 months, then evaluate

## Related

- Same class: [dashboard-product-portfolio](../discovery/metrics--dashboard-product-portfolio.md) — product metrics
- Same class: [dashboard-product-delivery](../delivery/dashboard-product-delivery.md) — delivery execution
- Same class: [dashboard-product-strategy](../strategy/dashboard-product-strategy.md) — product strategy
- Downstream: [write-a-brd](write-a-brd.md), [write-a-spec-or-prd](write-a-spec-or-prd.md), [jobs-to-be-done](jobs-to-be-done.md), [rice-ice-prioritization](rice-ice-prioritization.md), [kano-model](kano-model.md), [dual-track-agile](dual-track-agile.md), [okr-design](okr-design.md)
- References: Teresa Torres — *Continuous Discovery Habits*; Marty Cagan — *Inspired*; Dan Olsen — *The Lean Product Playbook*; Christina Wodtke — *Radical Focus*
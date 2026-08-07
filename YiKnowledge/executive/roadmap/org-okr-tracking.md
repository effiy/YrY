---
title: Org-Level OKR Tracking
aliases:
- org-okr-tracking
- okr
- objectives-key-results
- goal-setting
- goal-cascade
tags:
- roadmap
- okr
- goal-setting
- performance-management
- strategy-execution
category: executive/roadmap
created: 2026-08-07
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- executive
- tech-lead
- product-manager
benefit: "Organizational goals cascade coherently from company vision to team-level key results, creating alignment and accountability"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./annual-strategic-planning.md
- ./quarterly-business-review.md
- ../strategy/product-strategy-instance.md
- ../../product-manager/frameworks/okr-design.md
tacit: false
---

# Org-Level OKR Tracking

> **As an** executive, **I want to** implement an org-level OKR system that cascades from company strategy to team execution, **so that** everyone understands what matters, how their work contributes, and whether we're winning.

> OKRs (Objectives and Key Results) are a goal-setting framework originated at Intel and popularized by Google. At the org level, they are a strategy execution tool, not a performance management tool. The distinction is critical: OKRs drive alignment and focus; performance reviews drive individual development.

## Summary

- OKR = Objective (what we want to achieve, qualitative and inspirational) + Key Results (how we measure progress, quantitative and time-bound, typically 3-5 per objective)
- Cadence: Company-level OKRs set annually, team-level OKRs set quarterly, with mid-quarter check-ins
- Core principle: OKRs should be ambitious (60-70% achievement is good; 100% means objectives weren't ambitious enough)
- Key distinction: OKRs are for strategy execution, not for individual performance evaluation. Mixing the two creates sandbagging and kills ambition.
- Success metric: Every team member can state their team's top objective and how it connects to the company's top objective

## Core viewpoints

### 1. OKRs are a communication tool, not a measurement tool

The primary value of OKRs is alignment — ensuring everyone in the organization understands what matters most and how their work contributes. If OKRs are used primarily for measurement and control, they produce gaming behavior (sandbagging, conservative targets, local optimization). The communication value exceeds the measurement value.

### 2. The cascade is a negotiation, not a decomposition

Company OKRs should not be mechanically decomposed into team OKRs (e.g., company KR of "20% revenue growth" becomes "5% revenue growth" for each of 4 teams). Instead, each team should ask: "Given the company's objectives, what is the most impactful thing our team can achieve this quarter?" This produces aligned but autonomous goal-setting.

### 3. Key Results must be measurable outcomes, not activities

"Launch feature X" is an activity, not a key result. "Feature X achieves 30% weekly active user adoption within 6 weeks of launch" is a key result. The distinction is between output (what you did) and outcome (what changed). OKRs track outcomes; project plans track outputs.

### 4. The 60-70% achievement target is a feature, not a bug

If teams consistently achieve 100% of their KRs, the KRs are too conservative. Ambitious KRs should stretch the team and produce a 60-70% achievement rate. This requires psychological safety — teams must feel safe setting ambitious targets they might not fully achieve.

### 5. OKR check-ins are more important than OKR setting

Setting OKRs takes a few days per quarter. The real work is the weekly or bi-weekly check-in: are we on track? What's blocking us? What have we learned that changes our approach? OKRs without regular check-ins are New Year's resolutions — set with good intentions and forgotten by February.

## Key info

### OKR structure

**Objective**: Qualitative, inspirational, time-bound (quarterly or annually)
- Answers: "Where do we want to go?"
- Example: "Become the most trusted AI after-sales platform in the automotive industry"

**Key Results** (3-5 per objective): Quantitative, measurable, time-bound
- Answers: "How do we know we're getting there?"
- Example KRs:
  - KR1: Achieve 90%+ BRD compliance audit pass rate with 3 enterprise customers
  - KR2: Reduce average after-sales case resolution time by 40% for deployed customers
  - KR3: Reach 50+ weekly active users on YiVad with >60% weekly retention

### OKR grading scale

| Score | Meaning | Action |
|---|---|---|
| 0.0-0.3 | Far from target | Root cause analysis: wrong approach or wrong target? |
| 0.4-0.6 | Making progress, below target | Normal for ambitious KRs. Continue. |
| 0.7-0.8 | Delivered substantial results | Good. Target was appropriately ambitious. |
| 0.9-1.0 | Fully achieved | Suspicious. Target was likely too conservative. Recalibrate next quarter. |

### OKR cascade example

| Level | Objective | Key Results |
|---|---|---|
| **Company** | Become the most trusted AI after-sales platform | KR1: 3 enterprise customers with 90%+ compliance pass rate; KR2: 40% resolution time reduction; KR3: NPS > 50 |
| **Product** | Deliver a compliance-grade BRD agent | KR1: BRD agent passes 90%+ of compliance audit checks; KR2: BRD generation time < 5 minutes; KR3: 3 customer onboarding completions |
| **Engineering** | Build the evaluation infrastructure for LLM quality | KR1: Automated eval pipeline covers 100% of BRD scenarios; KR2: Hallucination rate < 2%; KR3: P95 latency < 10s |
| **Team** | Implement multi-provider LLM routing | KR1: 3 providers integrated with automatic failover; KR2: Cost per BRD generation reduced 30%; KR3: 99.9% uptime for routing layer |

## Action recommendations

1. **Start with company-level OKRs, then cascade**: Don't let teams set OKRs before company OKRs are defined. The cascade is top-down alignment, bottom-up commitment.
2. **Limit to 3-5 objectives with 3-5 KRs each**: More than 5 objectives means nothing is a priority. More than 5 KRs per objective means the objective isn't clear enough.
3. **Separate OKRs from performance reviews**: OKRs inform performance but don't determine it. Use a separate process for compensation and promotion decisions.
4. **Run weekly 15-minute OKR check-ins**: Each team does a quick stand-up on OKR progress. Red/yellow/green status. Blockers identified. No solving problems — just surfacing them.
5. **Make OKRs visible to everyone**: Publish all OKRs (company, department, team) in a shared, accessible place. Transparency drives alignment and peer accountability.

## Anti-patterns

- **OKRs as performance management**: Using OKR achievement scores to determine bonuses or promotions. This guarantees sandbagging and kills ambition.
- **Too many OKRs**: 10+ objectives or 8+ KRs per objective. This is a task list, not a strategy. Force prioritization.
- **Activity-based KRs**: "Launch feature," "Complete migration," "Write documentation." These are tasks, not outcomes. KRs must measure impact, not effort.
- **Set and forget**: OKRs are set at the start of the quarter and never reviewed until the end. Weekly check-ins are essential.
- **Cascading by decomposition**: Mechanically dividing company KRs into team KRs. Each team should define how they best contribute to the objective.
- **No stretch**: KRs that are 100% achievable with normal effort. OKRs should be uncomfortable. If you know exactly how to achieve them, they're not ambitious enough.

## Related

- [Annual Strategic Planning](./annual-strategic-planning.md) — Annual plan that OKRs execute against
- [Quarterly Business Review](./quarterly-business-review.md) — Quarterly review of OKR progress
- [OKR Design](../../product-manager/frameworks/okr-design.md) — Team-level OKR methodology
- [Product Strategy Instance](../strategy/product-strategy-instance.md) — Our strategy
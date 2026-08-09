---
title: BRD-2026-059 Progressive delivery platform and experiment governance
lifecycle: active
created: 2026-08-07
updated: 2026-08-09
key: brd_brd-engineer_msfe6wne5ccp3v
tags:
- engineer
- yipet
- progressive-delivery
- openfeature
- canary
- l3-maturity
brd_id: BRD-2026-059
project: yipet
domain: Progressive Delivery
quarter: 2026 Q3
priority: p1
status: draft
roles:
  - engineer
  - tech-lead
owner: Release Platform Team
benefit: >-
  Tracks 5-phase progressive delivery rollout milestones with quantified
  success metrics (80% onboarding reduction, 83% failure-rate reduction);
  single source for go/no-go decisions at each phase gate.
tech_stack: OpenFeature, Unleash, Canary, Kill Switch, Experiment Platform, Approval
  Flow
key_metrics: Onboarding time 5d→1d (down 80%); change failure rate 18%→3% (down 83%); MTTR 52min→10min (down 81%); per-capita maintenance 1.6→0.1 FTE (down 94%); flag directory 0%→100%; canary 0%→100%; experiment 0%→60%
acceptance_criteria: '1. Unified flag platform (OpenFeature + Unleash self-hosted) + directory portal + approval process launched

  2. canary + kill switch 100% coverage of core business

  3. Experiment platform MVP launch (A/B test)

  4. Onboarding time <1 day (stress test with 5 new businesses)

  5. Change failure rate <3%

  6. MTTR <10 minutes

  7. flag directory coverage 100%'
stakeholders: CTO Office (decision); Release Platform Team (execution); 5 business teams (consumption); SRE (operations); security & compliance (approval);
  finance (budget); HR (recruiting); architecture committee (review)
kb_path: engineer/projects/yipet/brd/brd-2026-059-progressive-delivery
notes: Unify the flag platform (OpenFeature + Unleash self-hosted) + directory portal + approval process, achieve canary + kill switch
  100% coverage of core business, support A/B test with experiment platform MVP, 1000+ flags in directory and 800+ experiment records within 3 years.
review_cycle: quarterly
tacit: false
related: []
type: summary
category: engineer/projects/yipet/brd/brd-2026-059-progressive-delivery
source: internal
---
source: internal
# BRD-2026-059 Progressive delivery platform and experiment governance

**BRD ID**: BRD-2026-059  |  **Project**: yipet  |  **Domain**: Progressive Delivery  |  **Quarter**: 2026 Q3
**Priority**: P1  |  **Status**: In Progress  |  **Owner**: Release Platform Team
**KB Source**: engineer/projects/yipet/brd/brd-2026-059-progressive-delivery

## Context
Unify the flag platform (OpenFeature + Unleash self-hosted) + directory portal + approval process, achieve canary + kill switch 100% coverage of core business, support A/B test with experiment platform MVP, 1000+ flags in directory and 800+ experiment records within 3 years.

## Objectives & Key Metrics
Onboarding time 5d→1d (down 80%); change failure rate 18%→3% (down 83%); MTTR 52min→10min (down 81%); per-capita maintenance 1.6→0.1 FTE (down 94%); flag directory 0%→100%; canary 0%→100%; experiment 0%→60%

## Acceptance Criteria
1. Unified flag platform (OpenFeature + Unleash self-hosted) + directory portal + approval process launched
2. canary + kill switch 100% coverage of core business
3. Experiment platform MVP launch (A/B test)
4. Onboarding time <1 day (stress test with 5 new businesses)
5. Change failure rate <3%
6. MTTR <10 minutes
7. flag directory coverage 100%

## Stakeholders
CTO Office (decision); Release Platform Team (execution); 5 business teams (consumption); SRE (operations); security & compliance (approval); finance (budget); HR (recruiting); architecture committee (review)

## Milestones
M1 (2026 Q3): team formed + flag platform unified + 5 businesses onboarded
M2 (2026 Q4): portal MVP + approval process + canary landing + 20 businesses
M3 (2027 Q1): experiment platform pilot + A/B test + 50 businesses
M4 (2027 Q2-Q4): legacy migration 100% + L3 achieved
M5 (2028 Q1-Q2): auto canary advancement MVP
M6 (2028 Q3-Q4): automation GA + L4 60%

## Risks
1. Flag platform adoption progresses slowly (P1) — Champion mentoring + bonus incentives
2. Canary configuration is complex (P1) — templates + automation tools
3. Experiment evaluation cadence is long (P2) — 5% gradual rollout + 7-day evaluation
4. Kill switch abuse risk (P1) — approval process + operation audit

## Long-term Evolution
3 years later: onboarding time 1 day, change failure rate 3%, MTTR 10 minutes, per-capita maintenance 0.1 FTE, flag directory 1000+ flags, 800+ experiment records, canary coverage 100%, experiment coverage 60%.

## References
- **KB Source**: `YiKnowledge/engineer/projects/yipet/brd/brd-2026-059-progressive-delivery`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents

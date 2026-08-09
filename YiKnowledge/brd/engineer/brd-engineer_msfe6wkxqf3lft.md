---
title: BRD-2026-058 Async Processing Platform and Event Stream Governance
lifecycle: active
key: brd_brd-engineer_msfe6wkxqf3lft
tags:
- engineer
- yipet
- async
- kafka
- flink
- l3-maturity
brd_id: BRD-2026-058
project: yipet
domain: Async Processing
quarter: 2026 Q3
priority: p0
status: in_progress
owner: Stream Platform Team
tech_stack: Kafka, Flink, Schema Registry, OpenTelemetry, Event Catalog Portal
key_metrics: Onboarding time 5d→1d (down 80%); change failure rate 18%→5% (down 72%); MTTR 52min→15min (down 71%); per-person
  maintenance 0.4→0.15 FTE (down 62%); event directory 0%→100%; schema registry 0%→100%
acceptance_criteria: '1. Event directory portal MVP launch, including 200+ topics (completed within 2 weeks)

  2. Schema registry 100% coverage, CI mandatory check

  3. Self-service application 8-step process, completed within 2 days

  4. Onboarding time <2 days (average across 5 new business lines)

  5. Change failure rate <8% (3-month statistics)

  6. MTTR <20 minutes

  7. 8 new business lines 100% following the process

  8. Oncall manual 100% coverage'
stakeholders: CTO Office (decision + budget); Stream Platform Team 8 FTE (execution); 5 business teams (consumption); SRE/DevOps (operations);
  security compliance (approval); finance (budget); HR (recruiting); architecture committee (technical review)
kb_path: engineer/projects/yipet/brd/brd-2026-058-async-processing
notes: Consolidate scattered message middleware into a unified Kafka cluster + Schema Registry + event directory portal; through a platform-based
  self-service application process, compress topic onboarding time from 5 days to 1 day; targeting L3 platform maturity, evolve over 3 years to event mesh GA (L4 100%).
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# BRD-2026-058 Async Processing Platform and Event Stream Governance

**BRD ID**: BRD-2026-058  |  **Project**: yipet  |  **Domain**: Async Processing  |  **Quarter**: 2026 Q3
**Priority**: P0  |  **Status**: In Progress  |  **Owner**: Stream Platform Team
**KB Source**: engineer/projects/yipet/brd/brd-2026-058-async-processing

## Context
Consolidate scattered message middleware into a unified Kafka cluster + Schema Registry + event directory portal; through a platform-based self-service application process, compress topic onboarding time from 5 days to 1 day; targeting L3 platform maturity, evolve over 3 years to event mesh GA (L4 100%).

## Objectives & Key Metrics
Onboarding time 5d→1d (down 80%); change failure rate 18%→5% (down 72%); MTTR 52min→15min (down 71%); per-person maintenance 0.4→0.15 FTE (down 62%); event directory 0%→100%; schema registry 0%→100%

## Acceptance Criteria
1. Event directory portal MVP launch, including 200+ topics (completed within 2 weeks)
2. Schema registry 100% coverage, CI mandatory check
3. Self-service application 8-step process, completed within 2 days
4. Onboarding time <2 days (average across 5 new business lines)
5. Change failure rate <8% (3-month statistics)
6. MTTR <20 minutes
7. 8 new business lines 100% following the process
8. Oncall manual 100% coverage

## Stakeholders
CTO Office (decision + budget); Stream Platform Team 8 FTE (execution); 5 business teams (consumption); SRE/DevOps (operations); security compliance (approval); finance (budget); HR (recruiting); architecture committee (technical review)

## Milestones
M1 (2026 Q3, 8 weeks): team 4 FTE + schema registry launch + 5 topics onboarded
M2 (2026 Q4, 12 weeks): portal MVP + self-service application + 20 topics
M3 (2027 Q1): Flink SQL pilot + contract testing + 50 topics
M4 (2027 Q2): legacy migration 50% (106 topics)
M5 (2027 Q4): migration 100% + L3 achieved
M6 (2028 Q2): event mesh MVP

## Risks
1. Platform team hiring progress behind (P0) — HR increases investment + outsourcing fallback + internal transfer
2. Legacy topic migration resistance (P0) — migration tool + OKR bonus incentive
3. Cross-language version alignment (P1) — architecture committee drives + platform layer abstraction
4. Trace full-chain migration (P1) — OpenTelemetry unified onboarding
5. Compliance requirements (MLPS 2.0) (P1) — security compliance early involvement
6. Budget freeze (P2) — finance quarterly review + risk reserve fund

## Long-term Evolution
3 years out: onboarding time 1 day, change failure rate 3%, MTTR 10 minutes, event directory 1000+ topics, schema registry 100% coverage, platform coverage 100%, self-service rate 90%; 5 years out: event mesh GA, L4 100%.

## References
- **KB Source**: `YiKnowledge/engineer/projects/yipet/brd/brd-2026-058-async-processing`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents

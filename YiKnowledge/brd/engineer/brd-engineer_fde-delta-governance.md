---
title: BRD-2026-070 FDE Practice role discipline and Delta governance
lifecycle: active
key: brd_brd-engineer_fde-delta-governance
tags:
- engineer
- fde-playbook
- fde
- delta
- sow
- three-whys
- consulting
brd_id: BRD-2026-070
project: fde-playbook
domain: Forward Deployment Engineering
quarter: 2026 Q3
priority: p1
status: proposed
owner: FDE Practice Team
tech_stack: SOW, Site Survey, Three Whys, Pyramid Principle, MECE, Trusted Advisor,
  MVA
key_metrics: Delta misjudgment rate < 10%; SOW exit criteria 100% coverage; renewal rate >= 75%; scope-creep rate < 15%; FDE
  project survival rate 12 months after exit >= 90%; Day 2 owner 100% identified by Week 1
acceptance_criteria: '1. SOW template Delta appendix 4 fields (proposal glue + business metric + exit
  criteria + owner) required

  2. Site Survey must produce >= 3 Delta candidates

  3. Discovery Call must run Three Whys (System of Record + Cost of Inaction + Day 2 owner) 

  4. FDE Practice Lead quarterly audit of 20% Discovery recordings

  5. Exit criteria acceptance signature

  6. Renewal rate >= 75%'
stakeholders: CTO Office(decision); FDE Practice Team(execution); customer CISO/CTO(consumption); legal(approval); PMO(tracking);
  architecture committee(review)
kb_path: engineer/strategies/operate-as-a-forward-deployed-engineer
notes: Reference Awesome-FDE-Roadmap, treat Delta as a contract rather than a feature backlog item. Enforce Three Whys diagnosis + SOW
  exit criteria + Day 2 owner identification. Landing references operate-as-a-forward-deployed-engineer + apply-consulting-frameworks
  + write-a-statement-of-work + run-a-site-survey + plan-day-two-operations. 
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# BRD-2026-070 FDE Practice role discipline and Delta governance

**BRD ID**: BRD-2026-070  |  **Project**: fde-playbook  |  **Domain**: Forward Deployment Engineering  |  **Quarter**: 2026 Q3
**Priority**: P1  |  **Status**: Proposed  |  **Owner**: FDE Practice Team
**KB Source**: engineer/strategies/operate-as-a-forward-deployed-engineer

## Context
Reference Awesome-FDE-Roadmap. FDE (Forward Deployment Engineering) is a "technical special forces" role between SWE / AI architect / strategy consultant, deployed on-site at customers to glue the core product into messy reality. Core concept: The Delta = the gap between out-of-the-box product capability and the customer's mission; FDE writes gap code (50% integration / 50% strategy), not feature code. 

This BRD treats Delta as a contract rather than a feature backlog item, enforcing Three Whys diagnosis (System of Record + Cost of Inaction + Day 2 owner) + SOW exit criteria + Day 2 owner identification. Landing references: [operate-as-a-forward-deployed-engineer](../../engineer/strategies/operate-as-a-forward-deployed-engineer.md) + [apply-consulting-frameworks](../../engineer/strategies/apply-consulting-frameworks.md) + [write-a-statement-of-work](../../engineer/processes/write-a-statement-of-work.md) + [run-a-site-survey](../../engineer/processes/run-a-site-survey.md) + [plan-day-two-operations](../../engineer/processes/plan-day-two-operations.md). 

## Objectives & Key Metrics
Delta misjudgment rate < 10% (baseline 30%); SOW exit criteria 100% coverage (baseline 20%); renewal rate >= 75% (baseline 50%); scope-creep rate < 15% (baseline 35%); FDE project survival rate 12 months after exit >= 90% (baseline 50%); Day 2 owner 100% identified by Week 1 (baseline 40%)

## Acceptance Criteria
1. SOW template Delta appendix 4 fields (proposal glue + business metric + exit criteria + owner) required
2. Site Survey must produce >= 3 Delta candidates
3. Discovery Call must run Three Whys (System of Record + Cost of Inaction + Day 2 owner) 
4. FDE Practice Lead quarterly audit of 20% Discovery recordings
5. Exit criteria acceptance signature (hard legal + soft business) 
6. Renewal rate >= 75%
7. Day 2 owner 100% identified by Week 1
8. scope-creep rate < 15%

## Stakeholders
CTO Office(decision); FDE Practice Team(execution); customer CISO/CTO(consumption); legal(approval); PMO(tracking); architecture committee(review)

## Milestones
M1(2026 Q3): SOW + Site Survey + Discovery SOP template launch + FDE Practice Lead quarterly audit mechanism landed
M2(2026 Q4): 5 new customer projects run through the process; first quarter scope-creep rate < 20%
M3(2027 Q1): Day 2 owner Week 1 identification rate >= 90%; exit criteria signature rate >= 80%
M4(2027 Q2-Q3): renewal rate >= 75%; FDE project survival rate 12 months after exit >= 90%
M5(2027 Q4): L3 maturity — Delta governance template cross-customer reuse rate >= 60%

## Risks
1. SOW template too heavy; legal slows signing (P1) — split template into must/nice-to-have; review only when Delta items >= 3; < 3 use lightweight version
2. Delta exit criteria too strict; customer won't accept (P1) — split exit criteria into hard (legal) + soft (business); soft signed by customer internal owner
3. Product team thinks Delta enters backlog and competes for budget (P2) — SOW appendix explicitly marked "not a product commitment"; PMO and product team align quarterly
4. scope-creep rate statistics inconsistent (P2) — quarterly review of metric definition; PMO + FDE Practice jointly set
5. FDE exit when customer internal owner won't sign exit (P2) — split exit criteria into "satisfied" / "not satisfied but has plan"; the latter PMO takes over
6. Delta business measurement unmeasured (P2) — measurement sourced from SOW Acceptance Criteria; FDE Practice quarterly audit

## Long-term Evolution
3 years later: Delta misjudgment rate < 5%; renewal rate >= 80%; FDE project survival rate 12 months after exit >= 95%; Day 2 owner 100% identified by Week 1; scope-creep rate < 10%. FDE Practice Lead abstracts the Delta governance template into a product-level "customer delivery contract" feature, feeding back into the core product. 

## References
- **KB Source**: `YiKnowledge/engineer/strategies/operate-as-a-forward-deployed-engineer.md`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents
- **Related leaves**: [apply-consulting-frameworks](../../engineer/strategies/apply-consulting-frameworks.md) / [write-a-statement-of-work](../../engineer/processes/write-a-statement-of-work.md) / [run-a-site-survey](../../engineer/processes/run-a-site-survey.md) / [plan-day-two-operations](../../engineer/processes/plan-day-two-operations.md)
- **Related ADR**: [ADR Delta-as-contract](../../tech-lead/decisions/fde--delta-as-a-contract.md)
- **Related failures**: [FDE Day 2 without internal owner](../../engineer/lessons/failures/fde-day-two-without-internal-owner.md) / [Discovery Three Whys skipped](../../engineer/lessons/gotchas/discovery-three-whys-skipped.md)
- **External**: [Awesome-FDE-Roadmap](https://github.com/pierpaolo28/Awesome-FDE-Roadmap)

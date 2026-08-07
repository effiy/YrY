---
title: ADR — YiVad aicr 7-Phase Port Methodology
lifecycle: active
key: brd_brd-tech-lead_msfev73mxy7t32
tags:
- adr
- yi-vad
- aicr
- port
- parity
adr_id: ADR-Aicr-7-Phase-Port
project: yivad
domain: AICR Port Methodology
decision_type: architectural
team_size: 5
status: accepted
owner: YiVad lead owner + architecture team
review_cycle: quarterly
kb_path: tech-lead/decisions/yivad/aicr-phase-port.md
context: YiVad ports the aicr (AI Code Review) page from YiWeb. Involves 9 Pinia stores + 8 modals + cards/graph views
  + CodeViewer + ChatPanel. Methodology guidance is needed for slicing. 
decision: Adopt 7-phase slicing + baseline alignment + parity test + store/modal decoupling + /loop automated regression. Each phase is independently launchable
  + parity diff < 0.5%. 
alternatives: B. Big-bang port (single PR) — 80% stalled; C. 3-phase coarse slicing — single-phase size still large; D. Wait for component library extraction — cadence uncontrollable. A chosen (7
  phases). 
risks: 1. parity drift — side-by-side dual-track verification; 2. store/modal decoupling insufficient — migrate separately; 3. /loop regression coverage incomplete
  — keep adding cases; 4. YiWeb upstream changes — baseline lock version. 
rollback: Phase failure → switch back to previous phase + fix + retry (1 business day). 
stakeholders: YiVad lead owner + architecture team (decision); CTO (approval); frontend lead; YiWeb maintainers (baseline)
tacit: false
related: []
---

# ADR — YiVad aicr 7-Phase Port Methodology

**ADR ID**: ADR-Aicr-7-Phase-Port  |  **Project**: yivad  |  **Domain**: AICR Port Methodology
**Decision Type**: architectural  |  **Team Size**: 5  |  **Status**: accepted  |  **Owner**: YiVad lead owner + architecture team
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yivad/aicr-phase-port.md

## Context
YiVad ports the aicr (AI Code Review) page from YiWeb. Involves 9 Pinia stores + 8 modals + cards/graph views + CodeViewer + ChatPanel. Methodology guidance is needed for slicing. 

## Decision
Adopt 7-phase slicing + baseline alignment + parity test + store/modal decoupling + /loop automated regression. Each phase is independently launchable + parity diff < 0.5%. 

## Alternatives
B. Big-bang port (single PR) — 80% stalled; C. 3-phase coarse slicing — single-phase size still large; D. Wait for component library extraction — cadence uncontrollable. A chosen (7 phases). 

## Risks & Mitigations
1. parity drift — side-by-side dual-track verification; 2. store/modal decoupling insufficient — migrate separately; 3. /loop regression coverage incomplete — keep adding cases; 4. YiWeb upstream changes — baseline lock version. 

## Rollback Plan
Phase failure → switch back to previous phase + fix + retry (1 business day). 

## Stakeholders
YiVad lead owner + architecture team (decision); CTO (approval); frontend lead; YiWeb maintainers (baseline)

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yivad/aicr-phase-port.md`

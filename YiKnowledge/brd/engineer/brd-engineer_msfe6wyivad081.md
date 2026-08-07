---
title: BRD-2026-081 BRD business requirement document database export and RAG recall
lifecycle: active
key: brd_brd-engineer_msfe6wyivad081
tags:
- engineer
- yivad
- brd-export
- rag
- split-storage
- l3-maturity
brd_id: BRD-2026-081
project: yivad
domain: BRD DB Export & RAG Recall
quarter: 2026 Q3
priority: p1
status: in_progress
owner: YiVad BRD Sync Team
tech_stack: Vue 3.5, Element Plus, MongoDB, YiKnowledge scanner, FastAPI
key_metrics: BRD sync coverage 12→24 records (+100%); RAG recall hit rate 42%→85% (+43pp); static .md export 0→100% (+100pp); cross-role consumption 0→9 roles (+100%); sync failures 12%→0% (-100%); on-call handbook coverage 0%→100%
acceptance_criteria: '1. 9 role subdirectories 100% covered (brd-ai-engineer / brd-engineer / brd-executive / brd-knowledge-curator / brd-new-hire / brd-oncall-sre / brd-product-manager / brd-tech-lead)

 2. 100% static .md export (RAG recall snapshot)

 3. RAG recall hit rate >80%

 4. 0 sync failures (3 consecutive months)

 5. cross-role consumption 9 roles 100%

 6. 24 BRD records 100% synced (12 yipet + 12 yiai/yivad)

 7. on-call handbook 100% covered'
stakeholders: YiVad Tech Lead (decision); YiVad BRD Sync Team 3 FTE (execution); YiAi Backend Team (integration);
 5 business teams (consumption); SRE/DevOps (ops); Architecture committee (tech review); knowledge manager (governance)
kb_path: brd/brd-engineer
notes: BRD content managed in MongoDB database (SSOT), static .md only for RAG recall snapshot, generated from DB via YiVad BRD sync tool into the brd-<role>/ subdirectory; L3 platform-maturity as target; within 3 years evolve to real-time sync + multi-language (L4 100%).
review_cycle: quarterly
tacit: false
related: []
---

# BRD-2026-081 BRD business requirement document database export and RAG recall

**BRD ID**: BRD-2026-081 | **Project**: yivad | **Domain**: BRD DB Export & RAG Recall | **Quarter**: 2026 Q3
**Priority**: P1 | **Status**: In Progress | **Owner**: YiVad BRD Sync Team
**KB Source**: brd/brd-engineer

## Context
BRD content is managed in MongoDB database (SSOT); static .md is only for RAG recall snapshot, generated from DB via the YiVad BRD sync tool into the appropriate brd-<role>/ subdirectory; L3 platform-maturity as target; within 3 years evolve to real-time sync + multi-language (L4 100%).

## Objectives & Key Metrics
BRD sync coverage 12→24 records (+100%); RAG recall hit rate 42%→85% (+43pp); static .md export 0→100% (+100pp); cross-role consumption 0→9 roles (+100%); sync failures 12%→0% (-100%); on-call handbook coverage 0%→100%

## Acceptance Criteria
1. 9 role subdirectories 100% covered (brd-ai-engineer / brd-engineer / brd-executive / brd-knowledge-curator / brd-new-hire / brd-oncall-sre / brd-product-manager / brd-tech-lead)
2. 100% static .md export (RAG recall snapshot)
3. RAG recall hit rate >80%
4. 0 sync failures (3 consecutive months)
5. cross-role consumption 9 roles 100%
6. 24 BRD records 100% synced (12 yipet + 12 yiai/yivad)
7. on-call handbook 100% covered

## Stakeholders
YiVad Tech Lead (decision); YiVad BRD Sync Team 3 FTE (execution); YiAi Backend Team (integration); 5 business teams (consumption); SRE/DevOps (ops); Architecture committee (tech review); knowledge manager (governance)

## Milestones
M1 (2026 Q3, 2 weeks): 9 roles 100% coverage + static .md export; M2 (2026 Q3, 2 weeks): 24 BRD records synced + RAG recall 80%; M3 (2026 Q4, 3 weeks): cross-role consumption + on-call handbook; M4 (2027 Q1): real-time sync pilot + 50% coverage; M5 (2027 Q3): 100% coverage + L3 reached; M6 (2028 Q1): multi-language GA + L4 60%

## Risks
1. Sync failures (P0) — retry + failure queue + tacit-knowledge-backlog
2. RAG recall hit rate (P0) — eval infrastructure + eval set expansion
3. Cross-role consumption deviation (P1) — role alignment + audit
4. Business team rejects integration (P1) — OKR + incentive alignment
5. Multi-language compatibility (P2) — i18n + translation

## Long-term Evolution
3 years: sync failures 0, RAG recall 95%, real-time sync 100%, multi-language 50%; 5 years: real-time sync + multi-language GA, L4 100%.

## References
- **KB Source**: `YiKnowledge/brd/brd-engineer`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents

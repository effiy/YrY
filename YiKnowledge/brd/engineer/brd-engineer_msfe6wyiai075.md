---
title: BRD-2026-075 RAG Evaluation Infrastructure and Recall Regression Gate
lifecycle: active
key: brd_brd-engineer_msfe6wyiai075
tags:
- engineer
- yiai
- rag
- evaluation
- ragas
- llama-datasets
- l3-maturity
brd_id: BRD-2026-075
project: yiai
domain: RAG Evaluation Infrastructure
quarter: 2026 Q3
priority: p0
status: in_progress
owner: YiAi Platform Team + AI Eng
tech_stack: FastAPI, llama-datasets, ragas, pytest, CI, MongoDB
key_metrics: RAG recall regression 0 detection → 100% detection (+100%); regression block rate 0%→100% (+100%); eval set coverage
  0 documentation → 50 documentation bilingual (+100%); evaluation 4 metrics (faithfulness/answer relevancy/context precision/context
  recall) 0→100%; evaluation duration 0→8min/PR
acceptance_criteria: '1. llama-datasets + ragas 4 metrics 100% integrated

  2. 50 documentation bilingual eval set 100% covers core domains

  3. CI recall regression >5% block 100%

  4. evaluation duration <10 minutes/PR

  5. 8 new business lines 100% go through evaluation process

  6. evaluation report 100% auto-generated

  7. oncall runbook 100% covered'
stakeholders: CTO Office (decision); YiAi Platform Team 4 FTE (execution); AI Engineer Team (eval set);
  5 business teams (consumption); SRE/DevOps (CI ops); architecture committee (tech review)
kb_path: tech-lead/decisions/yiai/rag-evaluation-infra
notes: Through llama-datasets bilingual eval set + ragas 4 metrics + CI recall regression >5% block, change RAG quality
  from manual spot-check to CI automation, with L3 platform maturity as the goal, evolving to online A/B evaluation (L4 100%)
  within 3 years. 
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# BRD-2026-075 RAG Evaluation Infrastructure and Recall Regression Gate

**BRD ID**: BRD-2026-075  |  **Project**: yiai  |  **Domain**: RAG Evaluation Infrastructure  |  **Quarter**: 2026 Q3
**Priority**: P0  |  **Status**: In Progress  |  **Owner**: YiAi Platform Team + AI Eng
**KB Source**: tech-lead/decisions/yiai/rag-evaluation-infra

## Context
Through llama-datasets bilingual eval set + ragas 4 metrics + CI recall regression >5% block, change RAG quality from manual spot-check to CI automation, with L3 platform maturity as the goal, evolving to online A/B evaluation (L4 100%) within 3 years. 

## Objectives & Key Metrics
RAG recall regression 0 detection → 100% detection (+100%); regression block rate 0%→100% (+100%); eval set coverage 0 documentation → 50 documentation bilingual (+100%); evaluation 4 metrics (faithfulness/answer relevancy/context precision/context recall) 0→100%; evaluation duration 0→8min/PR

## Acceptance Criteria
1. llama-datasets + ragas 4 metrics 100% integrated
2. 50 documentation bilingual eval set 100% covers core domains
3. CI recall regression >5% block 100%
4. evaluation duration <10 minutes/PR
5. 8 new business lines 100% go through evaluation process
6. evaluation report 100% auto-generated
7. oncall runbook 100% covered

## Stakeholders
CTO Office (decision); YiAi Platform Team 4 FTE (execution); AI Engineer Team (eval set); 5 business teams (consumption); SRE/DevOps (CI ops); architecture committee (tech review)

## Milestones
M1 (2026 Q3, 3 weeks): 50 documentation bilingual eval set + ragas integration; M2 (2026 Q3, 2 weeks): CI recall regression >5% block; M3 (2026 Q4, 4 weeks): 8 new business lines onboarded + evaluation report automation; M4 (2027 Q1): online A/B pilot + 50% coverage; M5 (2027 Q3): 100% coverage + L3 achieved; M6 (2028 Q1): online A/B GA + L4 60%

## Risks
1. Eval set quality (P0) — AI Engineer maintains + bilingual verification
2. CI evaluation duration (P0) — incremental evaluation + cache
3. 5% threshold false positive (P1) — gradual adjustment + hint
4. Business teams refuse to onboard (P1) — OKR bonus incentive
5. ragas upgrade compatibility (P2) — version lock + compatibility test

## Long-term Evolution
3 years later: recall regression 100% detection, evaluation 5 minutes/PR, online A/B 100%; 5 years later: online A/B engine GA, L4 100%. 

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yiai/rag-evaluation-infra`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents

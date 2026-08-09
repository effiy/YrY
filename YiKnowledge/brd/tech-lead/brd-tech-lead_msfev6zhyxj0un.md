---
title: ADR — YiAi RAG evaluation infrastructure
lifecycle: active
key: brd_brd-tech-lead_msfev6zhyxj0un
tags:
- adr
- yi-ai
- rag
- evaluation
- ragas
adr_id: ADR-Rag-Evaluation-Infrastructure
project: yiai
domain: RAG Evaluation
decision_type: architectural
team_size: 4
status: accepted
owner: YiAi main owner
review_cycle: quarterly
kb_path: tech-lead/decisions/yiai/rag-evaluation-infra.md
context: Weekly risk radar "YiAi RAG evaluation missing, recall rate not quantifiable". Need to quantify RAG recall quality + prevent regression caused by model upgrade. 
decision: Introduce `llama-datasets` format + ragas-style metrics (faithfulness / answer_relevancy / context_precision
  / context_recall) + 50 bilingual documentation evaluation set + CI recall regression > 5% block. Co-build `tests/eval/`
  with multi-provider ADR + pytest ADR. 
alternatives: B. Manual evaluation — subjective and unsustainable; C. Only faithfulness single metric — incomplete coverage. A selected (4 metrics + CI gate). 
risks: 1. Evaluation set maintenance cost — quarterly review + continuous update; 2. ragas metric drift — lock version + quarterly full rerun; 3. CI gate false block —
  threshold 5% adjustable; 4. Evaluation set vs production data drift — quarterly supplement new scenarios. 
rollback: Evaluation infrastructure exception → revert to previous baseline + fix + rerun (1 working day). 
stakeholders: YiAi main owner (decision); architecture team (review); CTO (approval); QA; BRD business (evaluation data)
tacit: false
related: []
type: reference
---

# ADR — YiAi RAG evaluation infrastructure

**ADR ID**: ADR-Rag-Evaluation-Infrastructure  |  **Project**: yiai  |  **Domain**: RAG Evaluation
**Decision Type**: architectural  |  **Team Size**: 4  |  **Status**: accepted  |  **Owner**: YiAi main owner
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yiai/rag-evaluation-infra.md

## Context
Weekly risk radar "YiAi RAG evaluation missing, recall rate not quantifiable". Need to quantify RAG recall quality + prevent regression caused by model upgrade. 

## Decision
Introduce `llama-datasets` format + ragas-style metrics (faithfulness / answer_relevancy / context_precision / context_recall) + 50 bilingual documentation evaluation set + CI recall regression > 5% block. Co-build `tests/eval/` with multi-provider ADR + pytest ADR. 

## Alternatives
B. Manual evaluation — subjective and unsustainable; C. Only faithfulness single metric — incomplete coverage. A selected (4 metrics + CI gate). 

## Risks & Mitigations
1. Evaluation set maintenance cost — quarterly review + continuous update; 2. ragas metric drift — lock version + quarterly full rerun; 3. CI gate false block — threshold 5% adjustable; 4. Evaluation set vs production data drift — quarterly supplement new scenarios. 

## Rollback Plan
Evaluation infrastructure exception → revert to previous baseline + fix + rerun (1 working day). 

## Stakeholders
YiAi main owner (decision); architecture team (review); CTO (approval); QA; BRD business (evaluation data)

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yiai/rag-evaluation-infra.md`

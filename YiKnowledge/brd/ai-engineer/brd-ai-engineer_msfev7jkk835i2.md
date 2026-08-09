---
title: LLM evaluation methodology
lifecycle: active
key: brd_brd-ai-engineer_msfev7jkk835i2
tags:
- ai
- llm
- evaluation
- ragas
model: Claude Opus 4.7 / GPT-5 / DeepSeek V3.2
task_type: eval
framework: ragas + llama-datasets
dataset: internal-eval-2026-08 50-document bilingual
eval_metric: faithfulness / answer_relevancy / context_precision / context_recall
status: accepted
owner: AI Engineer
kb_path: ai-engineer/methodology/llm-evaluation-methods.md
context: LLM evaluation requires 4-dimension metrics + a bilingual eval set + a CI gate. Ragas-style metrics + 50 bilingual documents.
methodology: ragas 4 metrics + 50-document bilingual eval set + CI recall regression > 5% blocks + quarterly full re-run.
baseline: faithfulness 0.78; answer_relevancy 0.82; context_precision 0.75; context_recall
  0.80
target: faithfulness >= 0.85; answer_relevancy >= 0.85; context_precision >= 0.85; context_recall
  >= 0.85; regression <= 5%
risks: 1. Eval set drift — add new scenarios quarterly; 2. ragas metric drift — pin version + full re-run; 3. CI gate false block — adjustable threshold
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# LLM evaluation methodology

**Model**: Claude Opus 4.7 / GPT-5 / DeepSeek V3.2  |  **Task Type**: eval  |  **Framework**: ragas + llama-datasets
**Dataset**: internal-eval-2026-08 50-document bilingual  |  **Eval Metric**: faithfulness / answer_relevancy / context_precision / context_recall  |  **Status**: accepted  |  **Owner**: AI Engineer
**KB Source**: ai-engineer/methodology/llm-evaluation-methods.md

## Context
LLM evaluation requires 4-dimension metrics + a bilingual eval set + a CI gate. Ragas-style metrics + 50 bilingual documents.

## Methodology
ragas 4 metrics + 50-document bilingual eval set + CI recall regression > 5% blocks + quarterly full re-run.

## Baseline -> Target
- **Baseline**: faithfulness 0.78; answer_relevancy 0.82; context_precision 0.75; context_recall 0.80
- **Target**: faithfulness >= 0.85; answer_relevancy >= 0.85; context_precision >= 0.85; context_recall >= 0.85; regression <= 5%

## Risks & Mitigations
1. Eval set drift — add new scenarios quarterly; 2. ragas metric drift — pin version + full re-run; 3. CI gate false block — adjustable threshold

## References
- **KB Source**: `YiKnowledge/ai-engineer/methodology/llm-evaluation-methods.md`

---
title: BRD Generation Prompt
lifecycle: active
key: brd_brd-ai-engineer_msfev7ldpj8tav
tags:
- ai
- prompt
- brd-generation
model: Claude Opus 4.7
task_type: code_gen
framework: Anthropic Prompt + JSON Schema
dataset: YiDoc BRD template
eval_metric: structural completeness / drafting time / edit-back-stream rate
status: accepted
owner: AI Engineer
kb_path: ai-engineer/methodology/prompts--brd-generation.md
context: "BRD agent phase 1 prompt design: multi-step reasoning (market -> user -> solution -> risk -> metrics) + structured"
  output (YiDoc BRD template JSON
  schema). 
methodology: 5-step reasoning + JSON schema output contract + YiKnowledge RAG retrieval + streaming SSE + editable back-stream
  + gradual feedback closed loop. 
baseline: BRD drafting 2h; structural completeness —; user edit-back-stream rate —
target: BRD drafting 25min (-79%); structural completeness 90%+; user edit-back-stream rate 60%+; P0 bug 0
risks: 1. prompt drift — eval set baseline; 2. RAG recall skew — multi-route recall + top-k; 3. generation hallucination —
  key number tracing; 4. structural contract drift
  — schema validation
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# BRD Generation Prompt

**Model**: Claude Opus 4.7  |  **Task Type**: code_gen  |  **Framework**: Anthropic Prompt + JSON Schema
**Dataset**: YiDoc BRD template  |  **Eval Metric**: structural completeness / drafting time / edit-back-stream rate  |  **Status**: accepted  |  **Owner**: AI Engineer
**KB Source**: ai-engineer/methodology/prompts--brd-generation.md

## Context
BRD agent phase 1 prompt design: multi-step reasoning (market -> user -> solution -> risk -> metrics) + structured output (YiDoc BRD template JSON schema). 

## Methodology
5-step reasoning + JSON schema output contract + YiKnowledge RAG retrieval + streaming SSE + editable back-stream + gradual feedback closed loop. 

## Baseline -> Target
- **Baseline**: BRD drafting 2h; structural completeness —; user edit-back-stream rate —
- **Target**: BRD drafting 25min (-79%); structural completeness 90%+; user edit-back-stream rate 60%+; P0 bug 0

## Risks & Mitigations
1. prompt drift — eval set baseline; 2. RAG recall skew — multi-route recall + top-k; 3. generation hallucination — key number tracing; 4. structural contract drift — schema validation

## References
- **KB Source**: `YiKnowledge/ai-engineer/methodology/prompts--brd-generation.md`

---
title: Prompt Engineering Guide
lifecycle: active
key: brd_brd-ai-engineer_msfev7kzm4ohwf
tags:
- ai
- prompt
- engineering
model: Claude Opus 4.7 / Sonnet 4.6
task_type: chat
framework: Anthropic Prompt Engineering
dataset: internal-eval-2026-08
eval_metric: faithfulness / user satisfaction
status: accepted
owner: AI Engineer
kb_path: ai-engineer/methodology/prompt-engineering-guide.md
context: "Prompt engineering needs to be systematized: role + context + task + output format + example + constraint. Structure contract first + RAG > long prompt."
methodology: "5 major principles: structure contract first (JSON schema driven) / RAG > long prompt / streaming + interruptible / generate → edit → return to stream"
  / feedback closed loop. 
baseline: no structure contract faithfulness 0.70; long prompt cost $0.20/task
target: structure contract + RAG faithfulness 0.85+; cost $0.10/task (-50%)
risks: 1. prompt drift — eval set baseline + rerun; 2. RAG recall bias — multi-route recall + top-k tuning; 3. structure contract break — schema
  validation
review_cycle: quarterly
tacit: false
related: []
---

# Prompt Engineering Guide

**Model**: Claude Opus 4.7 / Sonnet 4.6  |  **Task Type**: chat  |  **Framework**: Anthropic Prompt Engineering
**Dataset**: internal-eval-2026-08  |  **Eval Metric**: faithfulness / user satisfaction  |  **Status**: accepted  |  **Owner**: AI Engineer
**KB Source**: ai-engineer/methodology/prompt-engineering-guide.md

## Context
Prompt engineering needs to be systematized: role + context + task + output format + example + constraint. Structure contract first + RAG > long prompt. 

## Methodology
5 major principles: structure contract first (JSON schema driven) / RAG > long prompt / streaming + interruptible / generate → edit → return to stream / feedback closed loop. 

## Baseline → Target
- **Baseline**: no structure contract faithfulness 0.70; long prompt cost $0.20/task
- **Target**: structure contract + RAG faithfulness 0.85+; cost $0.10/task (-50%)

## Risks & Mitigations
1. prompt drift — eval set baseline + rerun; 2. RAG recall bias — multi-route recall + top-k tuning; 3. structure contract break — schema validation

## References
- **KB Source**: `YiKnowledge/ai-engineer/methodology/prompt-engineering-guide.md`

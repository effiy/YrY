---
title: llama_index evolution tracking
lifecycle: active
key: brd_brd-ai-engineer_msfev7iur1cgln
tags:
- ai
- llama-index
- evolution
model: llama_index 0.10+
task_type: rag
framework: llama_index
dataset: N/A
eval_metric: version stability / breaking changes / community
status: in_progress
owner: AI Engineer
kb_path: ai-engineer/platform/llama-index-evolution.md
context: llama_index is a core dependency for YiAi RAG + multi-provider routing. Need to track version evolution + breaking changes + community dynamics.
methodology: monthly tracking of release notes + quarterly eval reruns + breaking-change ADRs.
baseline: currently 0.10.x; 1-2 breaking changes per quarter; community active
target: YiAi locked to 0.10.x; quarterly eval reruns; breaking changes first go through ADR + eval-set gate
risks: 1. breaking changes — lockfile + quarterly eval; 2. community fragmentation — track llama_index vs langchain; 3. performance regressions — eval gate threshold 5%
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# llama_index evolution tracking

**Model**: llama_index 0.10+ | **Task Type**: rag | **Framework**: llama_index
**Dataset**: N/A | **Eval Metric**: version stability / breaking changes / community | **Status**: in_progress | **Owner**: AI Engineer
**KB Source**: ai-engineer/platform/llama-index-evolution.md

## Context
llama_index is a core dependency for YiAi RAG + multi-provider routing. Need to track version evolution + breaking changes + community dynamics.

## Methodology
Monthly tracking of release notes + quarterly eval reruns + breaking-change ADRs.

## Baseline → Target
- **Baseline**: currently 0.10.x; 1-2 breaking changes per quarter; community active
- **Target**: YiAi locked to 0.10.x; quarterly eval reruns; breaking changes first go through ADR + eval-set gate

## Risks & Mitigations
1. breaking changes — lockfile + quarterly eval; 2. community fragmentation — track llama_index vs langchain; 3. performance regressions — eval gate threshold 5%

## References
- **KB Source**: `YiKnowledge/ai-engineer/platform/llama-index-evolution.md`

---
title: LLM observability comparison — Langfuse / Phoenix / Helicone
lifecycle: active
key: brd_brd-ai-engineer_msfev7i8q1lo4m
tags:
- ai
- observability
- langfuse
model: Langfuse / Phoenix / Helicone
task_type: eval
framework: OTel + Langfuse
dataset: YiAi production trace
eval_metric: trace coverage / latency / cost / metrics
status: reviewed
owner: AI Engineer
kb_path: ai-engineer/platform/llm-observability-comparison.md
context: "LLM needs specialized observability: tokens / latency / cost / recall / hallucination detection. Langfuse (open source) / Phoenix (Arize) / Helicone (closed source)."
methodology: "5-dimension comparison: trace coverage / latency overhead / cost / metric richness / self-hosting difficulty."
baseline: Langfuse trace 95% / 5ms / open source / rich / in-house; Phoenix 90% / 10ms / closed source / rich / easy;
 Helicone 95% / 8ms / closed source / average / easy
target: YiAi chooses Langfuse (self-hosted + data privacy); PoC uses Phoenix
risks: 1. Langfuse self-hosted ops — K8s + monitoring; 2. trace latency overhead — sampling strategy; 3. metric drift — quarterly review
review_cycle: quarterly
tacit: false
related: []
---

# LLM observability comparison — Langfuse / Phoenix / Helicone

**Model**: Langfuse / Phoenix / Helicone | **Task Type**: eval | **Framework**: OTel + Langfuse
**Dataset**: YiAi production trace | **Eval Metric**: trace coverage / latency / cost / metrics | **Status**: reviewed | **Owner**: AI Engineer
**KB Source**: ai-engineer/platform/llm-observability-comparison.md

## Context
LLM needs specialized observability: tokens / latency / cost / recall / hallucination detection. Langfuse (open source) / Phoenix (Arize) / Helicone (closed source). 

## Methodology
5-dimension comparison: trace coverage / latency overhead / cost / metric richness / self-hosting difficulty. 

## Baseline -> Target
- **Baseline**: Langfuse trace 95% / 5ms / open source / rich / in-house; Phoenix 90% / 10ms / closed source / rich / easy; Helicone 95% / 8ms / closed source / average / easy
- **Target**: YiAi chooses Langfuse (self-hosted + data privacy); PoC uses Phoenix

## Risks & Mitigations
1. Langfuse self-hosted ops — K8s + monitoring; 2. trace latency overhead — sampling strategy; 3. metric drift — quarterly review

## References
- **KB Source**: `YiKnowledge/ai-engineer/platform/llm-observability-comparison.md`

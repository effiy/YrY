---
title: Inference engine comparison — vLLM / TGI / SGLang / TensorRT-LLM
lifecycle: active
key: brd_brd-ai-engineer_msfev7hrbrivc2
tags:
- ai
- inference
- vllm
- sglang
model: vLLM / TGI / SGLang / TensorRT-LLM
task_type: eval
framework: PyTorch / CUDA
dataset: Llama 4 / DeepSeek V3.2
eval_metric: throughput / latency / GPU utilization
status: reviewed
owner: AI Engineer
kb_path: ai-engineer/platform/inference-engine-comparison.md
context: Self-hosted open-source LLMs need an inference engine. vLLM (PagedAttention) / TGI (HuggingFace) / SGLang (RadixAttention)
  / TensorRT-LLM (NVIDIA-optimized).
methodology: "4-dimension comparison: throughput (tokens/s) / P99 latency / GPU utilization"
  / deployment complexity. Benchmark on Llama 4 70B and DeepSeek V3.2.
baseline: vLLM throughput 4000 tok/s / 80ms / 85%; TGI 3000 / 100ms / 80%; SGLang 4500
  / 70ms / 88%; TensorRT-LLM 5000 / 60ms / 90%
target: YiAi default vLLM (active community + easy deployment); key scenarios SGLang
  (RadixAttention-optimized); TensorRT-LLM only for NVIDIA-optimized scenarios
risks: 1. vLLM model compatibility — quarterly eval; 2. SGLang small community — follow
  up; 3. TensorRT-LLM NVIDIA lock-in — multi-GPU vendor strategy
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Inference engine comparison — vLLM / TGI / SGLang / TensorRT-LLM

**Model**: vLLM / TGI / SGLang / TensorRT-LLM  |  **Task Type**: eval  |  **Framework**: PyTorch / CUDA
**Dataset**: Llama 4 / DeepSeek V3.2  |  **Eval Metric**: throughput / latency / GPU utilization  |  **Status**: reviewed  |  **Owner**: AI Engineer
**KB Source**: ai-engineer/platform/inference-engine-comparison.md

## Context
Self-hosted open-source LLMs need an inference engine. vLLM (PagedAttention) / TGI (HuggingFace) / SGLang (RadixAttention) / TensorRT-LLM (NVIDIA-optimized).

## Methodology
4-dimension comparison: throughput (tokens/s) / P99 latency / GPU utilization / deployment complexity. Benchmark on Llama 4 70B and DeepSeek V3.2.

## Baseline → Target
- **Baseline**: vLLM throughput 4000 tok/s / 80ms / 85%; TGI 3000 / 100ms / 80%; SGLang 4500 / 70ms / 88%; TensorRT-LLM 5000 / 60ms / 90%
- **Target**: YiAi default vLLM (active community + easy deployment); key scenarios SGLang (RadixAttention-optimized); TensorRT-LLM only for NVIDIA-optimized scenarios

## Risks & Mitigations
1. vLLM model compatibility — quarterly eval; 2. SGLang small community — follow up; 3. TensorRT-LLM NVIDIA lock-in — multi-GPU vendor strategy

## References
- **KB Source**: `YiKnowledge/ai-engineer/platform/inference-engine-comparison.md`

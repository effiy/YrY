---
title: "Speculative Decoding: Faster LLM Inference via Draft-and-Verify"
aliases:
  - speculative decoding
  - draft model
  - assisted generation
  - inference acceleration
tags:
  - AI
  - foundations
  - inference
  - speculative-decoding
  - latency-optimization
category: ai-engineer/foundations
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
  - ai-engineer
  - engineer
benefit: "Achieve 2-3x faster LLM token generation without quality loss by using a small draft model to predict tokens verified by the large model"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - transformer-architecture.md
  - kv-cache-inference-optimization.md
  - sampling-strategy.md
  - ../platform/inference-engine-comparison.md
  - ../platform/llm-comparison.md
tacit: false
---

# Speculative Decoding

> **As an** AI engineer, **I want to** understand speculative decoding and its deployment trade-offs, **so that** I can reduce LLM inference latency by 2-3x without sacrificing output quality.

> Speculative decoding turns the memory-bandwidth bottleneck of autoregressive decoding into a compute-bound operation by generating multiple tokens in parallel, then verifying them with the target model in a single forward pass.

## Summary

- Autoregressive decoding is memory-bandwidth bound: each token generation requires loading the full model weights from HBM, but the compute per token is a small matrix-vector multiply.
- Speculative decoding uses a small, fast draft model to propose K candidate tokens autoregressively, then the large target model verifies all K tokens in a single parallel forward pass.
- The target model accepts tokens that match its own distribution; rejected tokens are discarded and the process restarts. The output distribution is mathematically identical to the target model decoding alone.
- Speedup comes from the ratio of draft model cost to target model cost: if the draft model is 10x cheaper and acceptance rate is 80%, speedup approaches 2-3x.
- Several variants exist: Medusa (multiple prediction heads instead of a separate draft model), Eagle (feature-level draft), REST (retrieval-based), and self-speculative decoding (skip layers of the target model itself).

## Core viewpoints

### 1. The memory-bandwidth wall is the fundamental bottleneck speculative decoding solves

In autoregressive decoding on a GPU, each token requires loading the full model weights (e.g., 140GB for Llama-3-70B in FP16) from HBM into SRAM. The actual compute is a single matrix-vector multiply per layer, which is negligible compared to the memory transfer time. This is why single-token latency is high even on A100/H100 GPUs. Speculative decoding amortizes the weight-loading cost over K tokens: one full model load verifies K draft tokens, so the memory-bandwidth cost per token drops by roughly 1/K.

### 2. The draft model must be fast enough that the draft-then-verify cycle is net faster than autoregressive

The critical constraint is: `draft_time_per_token * K + verify_time_for_K < autoregressive_time * K`. If the draft model is too slow or the acceptance rate is too low, speculative decoding can be slower than the baseline. The draft model should be at least 10-20x faster than the target model. Common choices: a 0.5B-3B parameter model drafting for a 70B target, or a quantized version of the target model itself.

### 3. The acceptance rate is the key metric, and it depends on draft-target distribution alignment

The acceptance rate is the fraction of draft tokens that the target model would have produced itself. It is determined by the KL divergence between the draft and target distributions. Factors that improve alignment: (a) using a draft model from the same family as the target (e.g., Llama-3-8B drafting for Llama-3-70B), (b) using the same tokenizer, (c) fine-tuning the draft model on the target model's outputs. Typical acceptance rates: 70-90% for same-family models, 40-60% for cross-family models.

### 4. Speculative decoding produces mathematically identical output distributions

This is a crucial property: the rejection sampling algorithm ensures that the output distribution is exactly the target model's distribution. Unlike quantization or distillation, speculative decoding does not change the model's behavior -- it only changes the speed. This makes it a safe optimization for production systems where output quality must not regress.

## Key info

### Algorithm (simplified)

```
1. Draft model generates K tokens (x_1, ..., x_K) autoregressively
2. Target model forward pass on (prefix + x_1 + ... + x_K) → produces distributions p_target for each position
3. For each position i in 1..K:
   - Sample r ~ Uniform(0, 1)
   - If r < min(1, p_target(x_i) / p_draft(x_i)): accept x_i
   - Else: reject x_i, sample new token from (p_target - p_draft)_normalized, break
4. Append accepted tokens to output, repeat from step 1
```

### Variant comparison

| Variant | Draft source | Pros | Cons | Typical speedup |
|---|---|---|---|---|
| Standard speculative | Small separate model | Simple, model-agnostic | Needs a second model in memory | 1.5--3x |
| Self-speculative | Skip layers of target | No extra model needed | Lower acceptance rate | 1.2--1.8x |
| Medusa | Extra prediction heads | No draft model, parallel heads | Requires training, model-specific | 2--3.5x |
| Eagle | Feature-level draft | High acceptance rate | Complex implementation | 2.5--4x |
| REST | Retrieval-based lookup | No draft model needed | Requires retrieval corpus | 1.5--2x |

### Memory considerations

- **Standard speculative**: adds a draft model (0.5-3B parameters, 1-6GB in FP16) to GPU memory. This may require reducing the target model's KV cache allocation, which can reduce max batch size.
- **Self-speculative / Medusa**: no extra model, but requires modified model architecture.
- **On consumer GPUs (24GB VRAM)**: running a 7B draft + 70B quantized target is feasible with 4-bit quantization.

### Latency vs. throughput

- **Latency (time-to-first-token for a single request)**: speculative decoding primarily improves token generation speed (inter-token latency), not the prefill phase. Time-to-first-token is unchanged.
- **Throughput (tokens/sec for batched requests)**: the benefit is smaller in high-throughput, batched scenarios because the memory-bandwidth bottleneck is already amortized across multiple requests. Speculative decoding is most impactful for low-batch, latency-sensitive workloads.

### Supported engines

| Engine | Speculative decoding support | Draft model source |
|---|---|---|
| vLLM | Native (v0.4.0+) | Separate model, Medusa, Eagle |
| SGLang | Native | Separate model, Eagle |
| TensorRT-LLM | Native | Separate model, Medusa |
| TGI (HuggingFace) | Assisted generation | Separate model |
| llama.cpp | Supported | Separate model |

## Action recommendations

1. For latency-sensitive interactive applications (chatbots, code completion), enable speculative decoding with a draft model of the same family, 10-20x smaller than the target.
2. Use vLLM or SGLang for production deployment -- both have mature speculative decoding implementations with automatic draft model loading.
3. Monitor acceptance rate as a key health metric; if it drops below 60%, the draft model may need retraining or the target model has been updated.
4. For single-GPU deployments, use a quantized draft model (4-bit) to minimize memory overhead.
5. Do not use speculative decoding when throughput (not latency) is the primary concern; the benefit is marginal in high-batch regimes.
6. Benchmark with your specific workload and draft-target pair; speedup varies significantly by task type (code generation typically sees higher acceptance rates than creative writing).

## Anti-patterns

- **Using a draft model from a different family without fine-tuning**: cross-family acceptance rates are low (40-60%), making the overhead of running the draft model larger than the speedup.
- **Using speculative decoding for high-throughput batch processing**: the memory-bandwidth bottleneck is already amortized across batch requests; speculative decoding adds overhead without benefit.
- **Not monitoring acceptance rate in production**: model updates or distribution shifts can silently degrade acceptance rate, making speculative decoding slower than the baseline.
- **Using too large a draft model**: a draft model that is only 5x faster than the target yields net speedup < 1.3x, which may not justify the memory cost.
- **Expecting prefill latency improvement**: speculative decoding only accelerates token generation, not the prefill (prompt processing) phase.

## Related

- Same category: [kv-cache-inference-optimization-summary.md](./kv-cache-inference-optimization.md), [sampling-strategy-summary.md](./sampling-strategy.md), [transformer-architecture-summary.md](./transformer-architecture.md)
- Platform: [../platform/inference-engine-comparison.md](../platform/inference-engine-comparison.md) (which engines support speculative decoding)
- Upstream: [../platform/llm-comparison.md](../platform/llm-comparison.md) (model selection affects draft model choice)

## References

- Leviathan et al., 2023 -- *Fast Inference from Transformers via Speculative Decoding* (Google DeepMind)
- Chen et al., 2023 -- *Accelerating Large Language Model Decoding with Speculative Sampling* (DeepMind)
- Cai et al., 2024 -- *Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads*
- Li et al., 2024 -- *Eagle: Speculative Decoding Requires Rethinking Feature Uncertainty*
- vLLM speculative decoding docs: https://docs.vllm.ai/en/latest/features/spec_decode.html
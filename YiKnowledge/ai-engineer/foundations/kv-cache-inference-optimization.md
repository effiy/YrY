---
title: KV Cache and inference optimization
aliases:
- KV cache
- paged attention
- speculative decoding
- LLM inference optimization
tags:
- AI
- foundations
- inference
- KV Cache
- optimization
category: ai-engineer/foundations
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- ai-engineer
benefit: foundations solid
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- attention-mechanism.md
- long-context-techniques.md
- ../platform/inference-engine-comparison.md
tacit: false
---

# KV Cache and inference optimization

> **As a** an ai engineer, **I want to** kv cache inference optimization, **so that** foundations solid. 

> During inference, cache the historical K/V tensors to reduce the autoregressive generation complexity from O(n²) to O(n). 

## Summary
- KV Cache is the cornerstone of modern LLM inference engines, reducing generation complexity from O(n²) to O(n)
- Inference has two stages: prefill (compute-intensive, one-shot computes all K/V) + decode (memory-access intensive, appends one K/V entry per step)
- PagedAttention treats KV cache like virtual memory with paged management, avoiding fragmentation
- Metrics: TTFT (time to first token latency), TPOT (time per output token), Throughput, KV cache utilization, prefix cache hit rate
- Advanced optimizations: prefix cache (cross-request reuse), speculative decoding (small model drafts, large model validates), continuous batching

## Core viewpoints
- **Historical K/V unchanged is the prerequisite for caching** — each step only adds one token of K/V, caching historical K/V avoids recomputation
- **Prefill and decode have different characteristics** — prefill is compute bound, decode is memory-access bound, mixing in the same batch causes mutual blocking
- **PagedAttention is an engineering breakthrough** — splits KV cache into fixed-size blocks managed by page tables, similar to OS virtual memory
- **Prefix cache health reflects prompt structure** — fixed system prompt + tool description go first, hit rate <50% indicates structure issues
- **Speculative decoding benefit has conditions** — effective only when accept rate >50%, suitable for highly deterministic tasks with many repetitive patterns

## Key information

### Concept breakdown

| Concept | Meaning |
|---|---|
| KV Cache | K, V tensors of each attention layer, shape `(seq, num_heads, head_dim)` |
| Prefill stage | handles prompt, one-shot computes all K/V, compute-intensive |
| Decode stage | appends one token of K/V per step, memory-access intensive |
| PagedAttention | splits KV cache into fixed-size blocks (e.g. vLLM's 16 tokens), managed by page tables, similar to OS virtual memory |
| Paged / Paged-eager | different batches use different page counts, avoiding fragmentation |
| Prefix Cache | reuses common prefix (system prompt, few-shot) KV across requests |
| Speculative Decoding | small/draft model predicts multiple tokens, large model validates in one pass, on hit outputs tokens in batch |
| Continuous Batching | does not wait for same-length batch to finish together, dynamic scheduling at token level, improving GPU utilization |

### Key parameters / formulas / data

#### KV cache memory budget formula

```
KV cache memory ≈ 2 * num_layers * seq_len * num_heads * head_dim * dtype_bytes
```

Example: Llama-3-70B fp16, 32k context, single request KV ≈ 5GB. When planning concurrency and batch size, compute KV first rather than weights. 

#### Mainstream inference engine comparison

| Dimension | vLLM PagedAttention | TensorRT-LLM | SGLang | TGI |
|---|---|---|---|---|
| Scheduling core | Page table + virtual memory | static shape + in-flight batching | RadixAttention (prefix tree reuses KV) | Continuous batching |
| Prefix reuse | yes (Automatic Prefix Caching) | yes (KV cache reuse) | yes (Radix tree natively strong) | limited |
| Multi LoRA | good | good | good | average |
| Long context | supported, needs `max_seq_len` tuning | supported, needs engine rebuild | supported | supported |
| Engineering threshold | low (out of the box) | high (needs compilation, TensorRT version coupling) | medium (proprietary scheduler) | low |
| Applicable scenarios | general serving, many long-tail requests | single model extreme latency, throughput | Agent / multi shared-prefix scenarios | HuggingFace ecosystem seamless |

#### Selection decision tree

```
Need to serve multiple LoRA with low traffic?
├─ Yes -> vLLM (strong multi-LoRA loading)
└─ No  -> Large amount of shared prefix (system prompt + tool description + few-shot)?
        ├─ Yes -> SGLang (RadixAttention reuses KV with max benefit)
        └─ No  -> Single model needs extreme throughput / latency?
                 ├─ Yes -> TensorRT-LLM (upfront engineering for stability)
                 └─ No  -> vLLM (default)
```

#### Assessment metrics

| Metric | Meaning | Healthy range |
|---|---|---|
| TTFT | prefill + queue latency, time to first token | depends on scenario SLA |
| TPOT | decode average latency per token | ~30-80ms on single H100 |
| Throughput | tokens/s/GPU | higher the better |
| KV cache utilization | actual usage / pre-allocated | 70-90% healthy |
| Prefix cache hit rate | reuse rate | >50% healthy |

### Applicable scenarios
- All autoregressive LLM inference services
- Long context requests (>16k needs dedicated pool, avoid dragging short-request SLA)
- Large shared-prefix scenarios (system prompt + tool description + few-shot) use prefix cache
- Structured output scenarios (BRD generation, JSON output) use speculative decoding

## Action recommendations
1. Start inference service with vLLM + PagedAttention, `max_num_seq=128`, `gpu_memory_utilization=0.9`
2. Put fixed system prompt + tool description first, dynamic part last, monitor `cache_hit_rate`, adjust prompt structure if <50%
3. Separate prefill / decode scheduling, do not mix long prompt + long output in same batch
4. Build dedicated pool for long context requests (>16k), avoid dragging down short conversation requests
5. Measure accept rate before launching speculative decoding, effective only when >50%

## Anti-patterns
- **Compute weights first then KV cache** — KV is the memory bulkhead; prioritize KV when planning concurrency
- **Low prefix cache hit rate without adjusting prompt** — putting dynamic content first breaks prefix reuse
- **Speculative decoding without measuring accept rate** — <50% draft model overhead eats the benefit
- **Long context and short context in same pool** — long requests drag down short request SLA
- **Non-paged scheduler running discrete batches** — severe memory fragmentation, use unified PagedAttention


- **Setting `gpu_memory_utilization` to 1.0** — leaves no headroom for CUDA context overhead and memory fragmentation; OOM kills the server under concurrent load.
- **Using the same `max_num_seq` for all traffic patterns** — short requests and long requests have different scheduling profiles; a single parameter causes one class to starve the other.
- **Disabling prefix cache because the hit rate is low** — a low hit rate is a symptom of poor prompt structure (dynamic content placed first), not a reason to abandon caching.
- **Monitoring only throughput, ignoring TTFT and TPOT** — throughput-only optimization pushes batch sizes up, causing unacceptable P99 latency for interactive users.
- **Ignoring prefill chunking for large prompts** — a single large prefill can monopolize the GPU for seconds, starving all decode steps; chunk prefill into smaller slices.

## Related
- Same category: [attention-mechanism-summary.md](./attention-mechanism.md), [long-context-techniques-summary.md](./long-context-techniques.md)
- Upstream: [transformer-architecture-summary.md](./transformer-architecture.md)
- Downstream: [../platform/inference-engine-comparison.md](../platform/inference-engine-comparison.md) (inference engine comparison) 

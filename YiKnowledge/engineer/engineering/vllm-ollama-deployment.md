---
title: vLLM / Ollama Deployment Experience
aliases:
- vllm-ollama-deployment
- llm-serving-comparison
tags:
- tooling
- vLLM
- Ollama
- deployment
- LLM inference
category: engineer/engineering
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- engineer
benefit: tooling trustworthy
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./claude-code-tips.md
- ./biome-eslint-prettier.md
tacit: false
---

# vLLM / Ollama Deployment Experience

> **As an** engineer, **I want to** vllm ollama deployment, **so that** tooling trustworthy.

> vLLM is a production-grade LLM inference service, Ollama is a local development tool; their positions differ.

## Summary

- vLLM suits production (throughput and latency optimized, multi-user); Ollama suits local development / personal devices / single-user.
- vLLM startup key parameters: `tensor-parallel-size` = number of GPUs, `gpu-memory-utilization` 0.85-0.9, `enable-prefix-caching` must be on, `max-num-seqs` 64-256.
- vLLM monitoring must watch: `num_requests_running/waiting`, `gpu_cache_usage_perc`, `cache_hit_rate`, TTFT / TPOT / Throughput.
- Cost inflection point: when monthly token consumption > $5000, self-deployment starts to pay off; OpenAI / Anthropic API suits small-scale prototypes.
- This team's landing: YiVad inference uses vLLM (PagedAttention + prefix caching), local dev uses Ollama to run small models for testing.

## Core viewpoints

- **The real cost of self-hosting is not GPU cost but ops burden** — GPU pricing is predictable, but the hidden costs lie in model updates, version rollback, multi-model serving, and monitoring + alerting. Teams that self-host without a dedicated ML infra role find that ops burden surpasses API cost, especially when monthly token consumption is below $5,000. The break-even analysis must include personnel time, not just GPU rental.

- **Prefix caching is not just a performance knob — it's an architectural constraint on prompt design** — vLLM prefix caching achieves high hit rates only when fixed prompt segments are at the very front. This means prompt engineering must separate system prompts (cacheable) from user-specific content (non-cacheable), which affects how the entire serving layer structures prompts. A prompt that intermixes fixed and variable content will see cache hit rates drop to near zero.

- **Ollama in dev / vLLM in prod creates a fidelity gap** — Ollama primarily uses GGUF quantized models (typically Q4), while vLLM typically runs full-precision or AWQ/FP8 models. A prompt that works on Ollama Q4 may produce different output or fail entirely on vLLM in production, creating a "works on my machine" debugging nightmare. Always test the same quantization level that runs in production.

- **GPU memory over-provisioning is a false economy** — Setting `gpu-memory-utilization` to 0.95 to maximize throughput invariably causes OOM under burst traffic. The 10-15% buffer is not wasted memory; it's the cost of predictable latency under load. An OOM event cascades: all in-flight requests fail, the server restarts, and the cold-start penalty hits every subsequent request.

- **Monitoring must be proactive, not reactive** — Without Prometheus metrics on TTFT, TPOT, and `cache_hit_rate`, the team only discovers inference degradation when users complain. The cost of setting up monitoring is a single afternoon; the cost of not having it is days of firefighting during an incident. A cache hit rate drop from 80% to 40% is invisible to users at first but doubles GPU cost — catch it early.


- vLLM and Ollama have different positions — vLLM is server-side (throughput and latency optimized), Ollama is a local tool (mostly single-user), not interchangeable.
- Prefix caching is the key to vLLM performance — put fixed segments at the very front of the prompt, cache hit rate improves significantly.
- Don't fill VRAM to the brim — keep a 10-15% buffer, otherwise OOM is frequent.
- Local Ollama is not for production — multi-user latency is poor, use vLLM or API in production.
- No monitoring means passive incident discovery — set up Prometheus, watch TTFT / TPOT / cache_hit_rate.

## Key information

### vLLM startup parameters

```bash
vllm serve {model_id} \
  --port 8000 \
  --tensor-parallel-size {N} \
  --gpu-memory-utilization 0.9 \
  --max-model-len 32768 \
  --max-num-seqs 128 \
  --enable-prefix-caching \
  --enable-auto-tool-call \
  --served-model-name {name}
```

### vLLM key parameters

| parameter | meaning | recommended |
|---|---|---|
| `tensor-parallel-size` | tensor parallelism count | = number of GPUs |
| `gpu-memory-utilization` | VRAM share | 0.85-0.9 |
| `max-model-len` | max context | per business |
| `max-num-seqs` | concurrent requests | 64-256 |
| `enable-prefix-caching` | prefix cache | must be on |
| `enable-auto-tool-call` | tool calling | on when using Agents |
| `quantization` | quantization | awq / gptq / fp8 |

### vLLM deployment modes

| mode | suited for |
|---|---|
| single-node single-GPU | 7B-13B models |
| single-node multi-GPU (TP) | 30B-70B |
| multi-node multi-GPU (TP + PP) | 100B+ |
| multi-node Ray cluster | large-scale serving |

### vLLM monitoring metrics

- `vllm:num_requests_running` / `num_requests_waiting`
- `vllm:gpu_cache_usage_perc`
- `vllm:cache_hit_rate`
- `vllm:request_success_total`
- TTFT / TPOT / Throughput

### vLLM common issues

| issue | cause | fix |
|---|---|---|
| OOM | insufficient VRAM | lower `gpu_memory_utilization` or `max-num-seqs` |
| Startup failure | model file download interrupted | use hf-transfer |
| Latency jitter | batch not saturated | raise `max-num-seqs` or add requests |
| KV cache full | context too long | add GPUs or lower `max-model-len` |
| Low prefix cache hit | poor prompt structure | put fixed segments at the front |

### Ollama deployment essentials

```bash
# install
curl -fsSL https://ollama.com/install.sh | sh

# pull models
ollama pull llama3.1:8b
ollama pull qwen2.5:7b
ollama pull bge-m3

# start
ollama serve  # default port 11434
ollama run llama3.1:8b  # direct interaction
```

### Ollama limitations

- Mostly single-user (multi-user throughput is poor)
- Limited model library (mainly GGUF format)
- Mostly quantized versions (slightly lower quality)
- No advanced features like prefix cache

### Model selection recommendations

| scenario | recommended |
|---|---|
| Production chat | vLLM + Llama 3.x / Qwen / DeepSeek |
| Production BRD generation | vLLM + Claude / DeepSeek-V3 (API) |
| Local dev testing | Ollama + 7B models |
| Embeddings | vLLM + bge-m3 or directly sentence-transformers |
| Multimodal | vLLM + Llama 3.2 Vision |

### Cost comparison

| option | unit cost | suited for |
|---|---|---|
| OpenAI / Anthropic API | per token | small scale, prototypes |
| vLLM self-deploy GPU | fixed GPU cost | medium-large scale, steady traffic |
| Ollama local | device depreciation | personal / dev |
| Quantized + edge | very low | privacy-sensitive |

> Cost inflection point: when monthly token consumption > $5000, self-deployment starts to pay off.

### Applicable scenarios

- Production LLM inference service (vLLM)
- Local development and testing (Ollama)
- Privacy-sensitive local inference
- CI running eval sets
- Edge device deployment

## Action recommendations

1. Use vLLM in production, Ollama for local dev, don't interchange
2. vLLM must enable `enable-prefix-caching`, put fixed segments at the front of the prompt
3. Set `gpu-memory-utilization` to 0.85-0.9, keep a 10-15% buffer
4. Set up Prometheus monitoring for `num_requests_running/waiting` + `cache_hit_rate` + TTFT / TPOT
5. Quarterly evaluate new model versions, don't pin a version
6. Multiple instances + load balancing, avoid single point
7. Cost inflection point ($5000/month) triggers self-deploy evaluation

## Anti-patterns

- **Self-hosting without a dedicated ML infra role** — The ops burden of model updates, version rollback, and multi-model serving quickly exceeds API cost. Without a dedicated person, self-hosting becomes a part-time job that nobody wants, leading to stale models, unpatched security issues, and degraded performance.

- **Using the same model quantization in dev and prod** — Ollama GGUF Q4 behaves differently from vLLM FP16/AWQ. A prompt that works in local dev can silently degrade or fail in production, wasting hours of debugging. Always test against the same quantization level that runs in production.

- **GPU memory set to 0.95 utilization** — Burst traffic causes OOM that cascades: all in-flight requests fail, the server restarts, and cold-start latency penalizes every subsequent request. Keep 10-15% buffer as insurance against traffic spikes.

- **Monitoring as an afterthought** — The team discovers inference degradation only when users complain. A cache hit rate drop from 80% to 40% is invisible to users at first but doubles GPU cost. Set up Prometheus metrics before the first production deployment.

- **Single-instance deployment** — A single GPU node is a single point of failure. A hardware failure or OOM crash takes down the entire inference service. At minimum, run two instances behind a load balancer to ensure availability during restarts or upgrades.

## Related

- Same class: [Claude Code usage tips](./claude-code-tips.md)
- Upstream: LiteLLM / Portkey (unified routing), HuggingFace (model download)
- Downstream: YiVad inference service (vLLM main inference), YiAi BRD generation (API)
- References: vLLM https://docs.vllm.ai, Ollama https://ollama.com

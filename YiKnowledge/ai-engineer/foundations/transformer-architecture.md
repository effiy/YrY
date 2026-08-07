---
title: Transformer architecture core principles
aliases:
- Transformer architecture
- transformer core principles
tags:
- AI
- Transformer
- Attention
- deep learning
- architecture
category: ai-engineer/foundations
created: 2024-03-01
updated: 2026-08-07
source: https://arxiv.org/abs/1706.03762
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
- moe-architecture.md
- long-context-techniques.md
- kv-cache-inference-optimization.md
tacit: false
---

# Transformer architecture core principles

> **As an** ai engineer, **I want to** transformer architecture, **so that** foundations solid.

> A sequence modeling architecture based on Self-Attention; the foundation of all modern mainstream LLMs.

## Summary
- Transformer replaces RNN with Self-Attention, breaking the long-range dependency bottleneck, with better parallelism
- Core formula: `Attention(Q,K,V) = softmax(QK^T / sqrt(dk)) * V`; Multi-Head performs attention in parallel across subspaces
- Modern LLMs are almost all combinations of decoder-only + RoPE + GQA + MoE
- Scaling Law and the Chinchilla data/parameter ratio of 20:1 are the baseline for pretraining scale planning
- Inference optimization relies on KV Cache / PagedAttention / Flash Attention / Speculative Decoding / quantization

## Core viewpoints

**Attention is not a replacement for recurrence -- it is a replacement for fixed-distance computation.** The real breakthrough of the Transformer is not that it "remembers better" than RNNs, but that it decouples the computation graph from the sequence topology. Each token can attend to every other token with O(1) path length, whereas RNNs require O(n) steps to propagate information from position 1 to position n. This is why scaling Transformers yields emergent abilities that RNNs never achieved: the model learns to route information across arbitrary distances, not just adjacent positions.

**The decoder-only architecture won not because it is theoretically superior, but because it is the simplest architecture that scales monotonically with compute.** Encoder-decoder models introduce a cross-attention bottleneck that complicates training dynamics and makes it harder to predict the return on scaling investment. Decoder-only models have a single, uniform loss surface -- every token is a training target -- which makes scaling laws more predictable and engineering simpler. The industry converged on decoder-only not by committee but by the brutal economics of pretraining: when you spend $10M+ on a single run, you choose the architecture with the most predictable scaling curve.

**RoPE succeeded not because of its mathematical elegance, but because it solves the extrapolation problem that neither sinusoidal nor learned encodings could address.** Sinusoidal encodings fail when the test sequence exceeds the training length because the model has never seen those frequency values. Learned encodings fail even more catastrophically because they memorize position IDs rather than learning a distance function. RoPE encodes relative position through rotation, meaning the model learns to attend based on relative distance rather than absolute position. This is the architectural reason that modern LLMs can be fine-tuned at 4k context length and still perform at 32k -- the relative-position signal generalizes.

**The "Attention is all you need" title created a harmful misconception that FFN layers are secondary.** In practice, the FFN layers store the vast majority of the model's factual knowledge. The attention mechanism routes information, but the FFN layers are where facts, patterns, and reasoning templates are stored. This is why MoE architectures target FFN layers for expansion and why pruning attention heads has less impact than pruning FFN dimensions. If attention is the router, the FFN is the database.

**Scaling Laws are an empirical observation, not a law of physics -- and the Chinchilla 20:1 ratio is already being violated by recent models.** The Chinchilla optimal point (20x tokens per parameter) was derived under a specific training regime with specific architecture choices. Recent models like Llama 4 and DeepSeek V3 have been trained with token-to-parameter ratios exceeding 50:1 and still show meaningful improvements, suggesting that data quality and curriculum matter more than the raw ratio. Treat scaling laws as a budgeting tool, not a constraint.


- **Self-Attention is the core innovation** — lets the model dynamically attend to all positions in the sequence while processing each token, breaking the RNN information bottleneck
- **Multi-Head Attention learns different subspace relationships** — different heads learn grammar, coreference, long-range dependency and other patterns; parameter count is close to single-head
- **Position encoding must be injected additionally** — Attention itself has no position information; relative position encodings such as RoPE / ALiBi are mainstream in current LLMs
- **decoder-only unified generation tasks** — GPT/Claude/Llama are all decoder-only; removing cross-attention yields higher training efficiency and is scaling-friendly
- **Scaling Law determines pretraining investment** — Loss is proportional to N^(-alpha); Chinchilla gives data amount about 20x the parameter count

## Key information

### concept breakdown

#### Self-Attention formula

```
Attention(Q, K, V) = softmax(QK^T / sqrt(dk)) * V
```

- **Q (Query)**: what the current token wants to attend to
- **K (Key)**: what other tokens can provide
- **V (Value)**: the actual information passed
- **sqrt(dk)**: scaling factor, prevents the dot product from becoming too large and pushing softmax into the gradient saturation region

#### Multi-Head Attention

- Projects Q/K/V into h subspaces, performs attention in parallel, then concatenates
- Number of heads h and per-head dimension dk satisfy `dk = d_model / h`
- Compute is close to single-head (projected dimension is smaller)

### Key parameters / formulas / data

#### architecture composition

| component | Encoder | Decoder |
|---|---|---|
| Self-Attention | Multi-Head Self-Attention | Masked Multi-Head Self-Attention (prevents seeing future tokens) |
| Cross-Attention | none | Encoder-Decoder Attention |
| Feed-Forward | two-layer MLP + GELU/SwiGLU | same as Encoder |
| residual + LayerNorm | Pre-LN is more stable | Pre-LN is more stable |

#### position encoding evolution

| type | representative | characteristics |
|---|---|---|
| absolute position | sinusoidal (original paper) / learned (BERT) | poor extrapolation |
| relative position | T5 relative bias | focuses on relative distance between tokens |
| RoPE | Llama / Qwen / DeepSeek | rotation matrix injects relative position, good extrapolation |
| ALiBi | Press et al. 2021 | attention bias injection, supports longer extrapolation |
| NoPE | recent research | in long-context scenarios, no explicit position encoding also works |

#### modern variant comparison

| variant | characteristics | representative |
|---|---|---|
| decoder-only | removes cross-attention, pure autoregressive | GPT / Claude / Llama |
| MoE | FFN split into N experts, top-k activated | Mixtral 8x7B / DeepSeek V3 / Llama 4 |
| linear attention / SSM | O(1) per-token inference | Mamba / RWKV / Linear Attention |
| GQA / MQA | multiple query heads share KV head | Llama 4 / Gemini / DeepSeek |

#### Scaling Law key numbers

- Kaplan 2020: Loss is proportional to N^(-alpha); parameter / data / compute scale up together
- Chinchilla 2022: data amount should be about 20x the parameter count
- emergent abilities: above a certain scale threshold, in-context learning and chain-of-thought emerge

#### engineering optimization overview

| technique | benefit |
|---|---|
| KV Cache | inference avoids recomputing historical K/V, O(n^2) -> O(n) |
| PagedAttention (vLLM) | paged KV management, GPU memory utilization improves 3-10x |
| Flash Attention 1/2/3 | IO-aware kernel, speed improves 2-4x |
| Speculative Decoding | small model drafts, large model verifies, 2-3x speedup |
| quantization (FP8 / INT4 / GPTQ) | inference cost reduced 4-8x |

### Applicable scenarios
- Core architecture layer of all modern LLMs (NLP infrastructure)
- Multimodal: image tokens and text tokens enter attention together (ViT + LLM)
- Recommendation systems: behavior sequence modeling (user's recent N clicks attend to item embedding)
- Code models: file-level cross-attention, following long-range dependencies

## Action recommendations
1. When choosing a base, prefer decoder-only + RoPE + GQA combination; for long-context scenarios, pay extra attention to measured performance of NoPE / ALiBi
2. Plan pretraining by estimating data requirements and compute budget using the Chinchilla data/parameter ratio of 20:1
3. For inference services, the vLLM PagedAttention + Flash Attention + prefix cache trio is the default starting point
4. When selecting long-context models, look at needle-in-haystack measurements, not just claimed window size
5. In resource-constrained scenarios, evaluate the accept rate of Speculative Decoding (only effective when >50%)

## Anti-patterns

**Treating the Transformer as a black box and tuning hyperparameters by grid search.** This is the most expensive anti-pattern in pretraining. Without understanding the relationship between model depth, width, attention heads, and sequence length, every hyperparameter change requires a full training run to validate. The correct approach is to use scaling-law extrapolation from small-scale experiments: train at 1/10 or 1/100 scale, fit the power law, and extrapolate to the target scale. This is how every major lab budgets their pretraining runs.

**Using the same attention configuration for the first and last layers.** Early layers learn local syntactic patterns (adjacent token relationships), while late layers learn global semantic patterns (cross-sentence dependencies). Many successful architectures use different attention patterns across layers -- for example, local attention in early layers with global attention in later layers, or staggered window sizes. Uniform attention across all layers wastes compute on patterns the model cannot learn at that depth.

**Assuming that a larger context window means the model can actually use it.** The "needle in a haystack" test has become a marketing metric, but the more important metric is the effective context utilization: how well does the model maintain coherence and accuracy across the full context length? Most models with 128K+ windows show significant degradation in retrieval accuracy beyond 32K-64K. Always benchmark your specific task's accuracy as a function of context position, not just the advertised window size.

**Performing inference optimization without understanding the KV cache memory budget.** A single request to Llama-3-70B at fp16 with 32K context consumes approximately 5GB of KV cache memory. If you plan for 10 concurrent requests, you need 50GB just for KV cache -- before loading the model weights. The KV cache memory budget, not the model size, is usually the binding constraint for production deployments. Always calculate `KV_bytes = 2 * num_layers * num_kv_heads * head_dim * context_length * dtype_bytes * batch_size` before sizing your GPU cluster.

**Chasing the latest architecture tweak without validating it on your specific data distribution.** The Transformer family has spawned dozens of variants (linear attention, state-space models, recursive architectures), each claiming to solve the quadratic complexity problem. But most of these improvements trade off some capability that may be critical for your use case -- linear attention models often underperform on tasks requiring precise token-level attention, and SSMs can struggle with copying tasks. Always evaluate architectural choices on your specific task distribution, not just on academic benchmarks.


- **Using absolute position encoding for long-context extrapolation** — training at 2k extrapolated to 4k collapses quality; must use RoPE / ALiBi / YaRN
- **Ignoring subspace diversity of Multi-Head** — a single head modeling both content relevance and position relevance conflicts (lesson from DeBERTa disentangled attention)
- **Keeping cross-attention idea on decoder-only models** — modern LLMs have no cross-attention; do not force seq2seq architecture
- **Only looking at window size, not needle-in-haystack** — claiming 1M does not mean it can actually use 1M
- **Ignoring KV cache memory budget** — Llama-3-70B fp16 32k context single-request KV is about 5GB; when planning concurrency, compute KV before weights

## Related
- same class: [attention-mechanism-summary.md](./attention-mechanism.md), [moe-architecture-summary.md](./moe-architecture.md), [long-context-techniques-summary.md](./long-context-techniques.md)
- upstream: [rlhf-dpo-alignment-summary.md](./rlhf-dpo-alignment.md) (post-training stage)
- downstream: [kv-cache-inference-optimization-summary.md](./kv-cache-inference-optimization.md), [../platform/inference-engine-comparison.md](../platform/inference-engine-comparison.md) (inference landing)

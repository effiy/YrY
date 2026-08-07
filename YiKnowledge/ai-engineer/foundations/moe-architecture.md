---
title: MoE architecture (Mixture of Experts) 
aliases:
- mixture of experts
- sparse MoE
- expert routing
tags:
- AI
- foundations
- MoE
- sparse activation
- inference
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
- transformer-architecture.md
- kv-cache-inference-optimization.md
- ../platform/inference-engine-comparison.md
tacit: false
---

# MoE architecture (Mixture of Experts) 

> **As a** an ai engineer, **I want to** moe architecture, **so that** foundations solid. 

> Split a model's FFN layer into N experts; for each token only route top-k are activated, so activated parameters are far fewer than total parameters. 

## Summary
- MoE grows model capacity while shrinking inference compute; it is the mainstream path for 200B+ parameter models
- Each token activates only top-k (k=1~2 most common) experts; activated params << total params
- Core training difficulty: load balancing (load balancing loss / aux-loss-free mechanism) 
- Core inference difficulty: large memory footprint, skewed batch routing, small-batch GEMM underutilization
- DeepSeek MLA + sparse MoE is currently the most aggressive memory/compute decoupling solution

## Core viewpoints

**MoE is not about making models smarter -- it is about making models bigger without making them slower.** The core value proposition of MoE is economic: you can train a model with N times more parameters at roughly the same inference cost as a dense model with 1/N the parameters. The quality improvement comes from the increased capacity, not from the routing mechanism itself. In fact, a poorly routed MoE model can perform worse than a dense model of the same activated parameter count. The routing is the tax you pay for the capacity, not the source of the gain.

**Expert specialization is an emergent property, not a design goal -- and over-specialization is a failure mode.** In theory, experts should organically specialize in different types of inputs (e.g., one expert for code, another for prose). In practice, without careful load balancing, most tokens route to a few "generalist" experts while the rest are underutilized. The aux-loss-free mechanism from DeepSeek-V3 is the most important architectural innovation in MoE because it solves the specialization problem without introducing gradient noise. The lesson: the harder you try to force specialization, the more fragile the model becomes.

**The deployment cost of MoE is dominated by memory, not compute -- and this flips the conventional optimization playbook.** For dense models, the optimization priority is compute throughput (more FLOPs, more tokens per second). For MoE models, the priority is memory bandwidth and capacity: all expert weights must be resident in memory, but only a fraction are computed per token. This means that techniques like quantization, model parallelism, and memory-efficient scheduling matter more for MoE than for dense models. A MoE model that fits in GPU memory with 4-bit quantization will outperform a dense model that must be sharded across multiple GPUs.

**The "small-batch problem" is not a bug -- it is a fundamental tradeoff between throughput and latency in MoE deployments.** MoE models achieve their best throughput when each expert receives a large batch, but this requires either high request concurrency (many users) or large batch sizes (high latency). For low-traffic deployments or latency-sensitive applications, the expert GEMM utilization can be so low that a dense model of comparable activated parameters would be faster. The decision to deploy MoE should be driven by throughput requirements, not just parameter count.

**MoE routing is a compression operation: the router compresses the entire input space into a few expert assignments.** This means the router is a single point of failure with a compression ratio equal to `num_experts / top_k`. If the router makes a mistake, the token is processed by the wrong expert, and the model has no mechanism to recover. This is fundamentally different from dense models where every parameter is always applied. The implication is that router robustness -- not just accuracy -- must be a training objective, and techniques like router z-loss and path dropout are essential for stability.


- **Decoupling activated params from total params** — parameters fill memory, each token computes only 1/N; per-request latency is determined by activated params
- **Load balancing is the key to training success** — without load balancing loss, routing collapses to one or two experts
- **Expert parallelism is the MoE deployment standard** — different experts on different GPUs, similar to tensor parallel but sliced by expert
- **DeepSeek aux-loss-free is the biggest improvement in recent years** — uses bias terms to dynamically adjust routing without entering gradients, more stable than traditional aux loss
- **Poor small-batch efficiency is an MoE inference pain point** — each expert batch is small, GEMM underutilized; continuous batching is mandatory

## Key information

### Concept breakdown

| Term | Meaning |
|---|---|
| Expert | An independent FFN subnetwork; N experts share attention layers |
| Router / Gate | A small linear layer deciding which experts each token goes to |
| Top-k routing | Each token selects the k highest-scoring experts (k=1~2 most common)  |
| Load balancing loss | An auxiliary loss term forcing tokens to distribute evenly across experts, preventing collapse to one or two |
| Aux-loss-free load balancing | Proposed by DeepSeek-V3, uses bias terms to dynamically adjust routing, not entering gradients, more stable |
| Shared expert | A set of always-active experts carrying general capability, avoiding redundant sharing |
| Activated params | Number of parameters actually computed per token; determines inference cost |
| Total params | All weights; determines memory footprint |
| Expert parallelism | Placing different experts on different GPUs, similar to tensor parallel but sliced by expert |

#### Architecture diagram

```
Token h
   ↓
Router (Linear + Softmax/Top-k)
   ↓               ↓           ...
Expert 1        Expert 2    ...  Expert N
   ↓               ↓
gating weights * expert_output
   ↓
Sum  (h_new = Σ w_i * Expert_i(h))
   ↓
Next layer
```

DeepSeek-V2's MLA + sparse MoE: attention uses MLA (shared K/V dimension reduction) to compress KV cache, FFN uses sparse MoE to expand capacity — two optimizations stacked. 

### Key parameters / formulas / data

#### Training engineering essentials

| Pain point | Solution |
|---|---|
| Load balancing | Must add load balancing loss or aux-loss-free mechanism |
| Routing stability | Top-k routing is sensitive to router weights; use router z-loss / path dropout to improve robustness |
| Communication overhead | Under expert parallelism all-to-all communication is large; use grouped GEMM, fused communication kernels |
| Expert capacity cap | `C = tokens_per_batch/N * factor`; too small drops tokens, too large wastes |

#### Inference engineering essentials

| Pain point | Solution |
|---|---|
| Memory vs compute decoupling | Parameters fill memory but each token computes only 1/N; latency determined by activated params |
| Batch routing skew | When tokens concentrate on a few experts, GPU becomes bottleneck; need expert-level load balancing monitoring + dynamic router bias |
| Multi-GPU deployment | MoE models usually exceed single-GPU memory; expert parallel preferred; mixed with tensor parallel |
| Small-batch GEMM underutilization | Continuous batching combines requests into larger batches |
| KV cache compression | DeepSeek MLA further compresses KV cache; stacked with MoE lets a single card hold a 671B model |

#### Limitations and improvement trajectory

| Limitation | Improvement |
|---|---|
| Training instability, routing collapse | Switch Transformer aux loss → DeepSeek aux-loss-free |
| Large memory footprint | Expert sharding (EP) + CPU offload + on-demand load |
| High communication cost | Grouped GEMM, fused communication, Shared Expert |
| Small-batch GEMM underutilization | Continuous batching + dynamic routing buffer |
| Uneven expert specialization | Limit per-expert capacity, introduce shared expert |
| Routing unexplainable | Probing / sparse autoencoder to see what experts learned |

### Applicable scenarios
- Foundation large models: DeepSeek-V3, GLM-4.5, Qwen3-MoE, etc., 200-700B parameters with 30-50B-level inference compute
- Edge inference: rarely-used experts offloaded to CPU/SSD, frequently-used experts kept in memory (o1-class model strategy) 
- Vertical-domain models: let experts naturally split into different subtasks as a structural prior for multi-task learning
- This team: evaluate throughput gains of sparse MoE models in YiAi BRD generation scenarios; prioritize DeepSeek-V3 / GLM-4.5-class solutions that are Chinese-friendly and have small activated params

## Action recommendations
1. Training MoE must add load balancing loss or use DeepSeek aux-loss-free mechanism, otherwise routing collapses after a few steps
2. Deployment prioritizes expert parallelism; mixing with tensor parallel is common
3. Inference serving must enable continuous batching, otherwise small-batch MoE throughput is worse than dense models
4. When selecting models, focus on activated params rather than total params; the former determines actual inference cost
5. For Chinese scenarios, prioritize evaluating DeepSeek-V3 / GLM-4.5; small activated params + Chinese-friendly

## Anti-patterns

**Comparing MoE and dense models by total parameter count.** This is the most common and most misleading comparison in the industry. A 671B-parameter MoE model with 37B activated parameters should be compared to a 37B dense model on latency and to a 671B dense model on memory footprint. Any other comparison conflates capacity and cost. When evaluating MoE models, always report both total and activated parameters, and benchmark against dense models at both scales.

**Deploying MoE models without expert-level load monitoring.** The router's behavior in production can differ significantly from its behavior during evaluation. Certain user populations, query types, or times of day can cause routing skew that degrades throughput. Without per-expert load monitoring, you cannot detect when a subset of experts is overloaded. The minimum monitoring set includes: tokens per expert per second, expert utilization (fraction of experts receiving >1% of tokens), and router entropy.

**Assuming that MoE training stability is a solved problem because aux-loss-free mechanisms exist.** While DeepSeek-V3's aux-loss-free mechanism is a significant improvement, it is not a silver bullet. The router bias terms that control load balancing can drift over the course of training, and the mechanism interacts with learning rate schedules in ways that are not fully understood. Training stability still requires monitoring router entropy, expert utilization, and the gradient norm of the router parameters throughout training.

**Using MoE for tasks where the input distribution is narrow and predictable.** If your application primarily handles a single type of input (e.g., SQL queries, legal documents, a specific language), the MoE routing mechanism adds overhead without the benefit of specialization. The same total compute budget would be better spent on a larger dense model or a dense model with more training data. MoE shines when the input distribution is diverse and the model benefits from having different "personalities" for different input types.

**Selecting MoE models based on benchmark scores without profiling inference cost on your hardware.** Benchmark scores are typically measured on high-end GPU clusters with optimal batch sizes and expert parallelism configurations. On consumer-grade hardware, smaller clusters, or CPU-only deployments, the overhead of expert routing and all-to-all communication can make MoE models slower than dense models of equivalent quality. Always profile on your target deployment hardware before committing to an MoE architecture.


- **Training MoE without load balancing loss** — routing collapses to 1-2 experts after a few steps; model degrades
- **Evaluating cost by total params only** — real cost is determined by activated params
- **Using dense-model deployment strategy for MoE models** — not enabling expert parallel causes both memory and communication to blow up
- **Deploying MoE in small-batch scenarios** — each expert GEMM underutilized, throughput actually worse; must use continuous batching
- **Ignoring router z-loss** — small perturbations in router weights cause token-expert assignment jitter; training unstable

## Related
- Same class: [transformer-architecture-summary.md](./transformer-architecture.md), [kv-cache-inference-optimization-summary.md](./kv-cache-inference-optimization.md)
- Upstream: [attention-mechanism-summary.md](./attention-mechanism.md) (attention layers shared, FFN does MoE) 
- Downstream: [../platform/inference-engine-comparison.md](../platform/inference-engine-comparison.md), [../platform/llm-comparison.md](../platform/llm-comparison.md)

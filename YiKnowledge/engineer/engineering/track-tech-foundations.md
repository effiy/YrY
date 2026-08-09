---
title: Track tech foundations
aliases:
- i-want-to-track-tech-foundations
- tech-foundations-journey
- AI foundations entry
tags:
- journeys
- tech-foundations
- transformer
- attention
- kv-cache
- MoE
- RLHF
- multimodal
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../strategies/find-ai-deployment-cases.md
- ../projects/build-a-rag-pipeline.md
- ../../ai-engineer/foundations/README.md
- ../../ai-engineer/platform/README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to track tech foundations

> **As an** engineer, **I want to** track tech foundations, **so that** outcome is traceable.

> "Transformer / Attention / KV Cache / MoE / RLHF / long-context / multimodal and other foundational theory" reachable within 2 hops to all ai-foundations leaves + inference engine / vector DB / observability platform choices.

## Summary

- Foundational theory via [tech/ai-foundations/](../../ai-engineer/foundations): Transformer / Attention / KV Cache / MoE / RLHF / long-context / multimodal
- Platform choices via [tech/ai-platform/](../../ai-engineer/platform): inference engine / vector DB / observability / Embedding / LLM comparison / llama_index evolution
- Deployment via [work/tools/](.): vLLM / Ollama / Claude Code
- Methodology via [methodology/ai-specific/](../../ai-engineer/methodology): Prompt / RAG / Agent / evaluation / safety / fine-tuning

## Core viewpoints

**Foundational theory must be learned in dependency order, not in order of interest.** Transformer architecture must be understood before attention mechanisms, attention before KV cache, and KV cache before MoE. Skipping ahead to RLHF or multimodal without understanding the inference pipeline that underlies them produces knowledge that is brittle and cannot be applied to novel problems. The reading order is a curriculum, not a menu.

**The inference engine choice is the most consequential platform decision.** Choosing between vLLM (production), Ollama (local dev), and closed-source APIs (GPT-4o, Claude, Gemini) is not a technology decision; it is a cost, latency, privacy, and reliability decision. The wrong choice means the system is either too expensive to scale, too slow to use, or too dependent on a vendor. The choice must be made per deployment scenario, not once for the entire organization.

**Embedding model selection is the hidden foundation of RAG quality.** The choice of embedding model (bge-m3, OpenAI text-embedding-3, Cohere, self-hosted) determines the quality ceiling of every retrieval pipeline. A state-of-the-art LLM with a mediocre embedding model produces mediocre retrieval. The embedding model must be evaluated on the team's actual data, not on public benchmarks, because domain-specific performance varies dramatically.

**Fine-tuning is a last resort, not a first step.** The decision tree (Full FT, LoRA, QLoRA, Prefix tuning) should only be consulted after prompt engineering, RAG, and few-shot learning have been exhausted. Fine-tuning a model for a problem that could be solved with better prompting or retrieval is a permanent commitment to a moving target. The cost of fine-tuning is not the training run; it is the ongoing maintenance of the fine-tuned model as the base model improves.

**Observability is the foundation that makes all other AI decisions data-driven.** Monitoring recall, faithfulness, error rate, and latency is not an afterthought; it is the mechanism that tells you whether the inference engine, embedding model, and fine-tuning decisions were correct. Without observability, every AI decision is a leap of faith. With observability, every decision is an experiment with a measurable outcome.

## Key info

- **AI foundational theory learning curriculum (7 modules in dependency order)**: (1) Transformer Architecture — self-attention, multi-head attention, positional encoding, feed-forward networks, layer normalization; prerequisite for all subsequent modules; (2) Attention Mechanisms — scaled dot-product attention, cross-attention, causal masking, attention complexity (O(n²)); (3) KV Cache — key-value caching for autoregressive decoding, memory-bandwidth trade-off, prefix caching, multi-turn conversation caching; (4) Mixture of Experts (MoE) — sparse activation, expert routing, load balancing, capacity factor, auxiliary loss; (5) Long-Context Techniques — RoPE (Rotary Position Embedding), ALiBi, sliding window attention, ring attention, context extension; (6) RLHF/DPO Alignment — reward modeling, PPO (Proximal Policy Optimization), DPO (Direct Preference Optimization), constitutional AI; (7) Multimodal Fusion — vision-language models, cross-modal attention, modality encoders, early vs. late fusion. Each module has a summary file in `ai-engineer/foundations/` with key concepts, Yi-family relevance, and further reading.
- **Inference engine comparison (vLLM vs. Ollama vs. closed-source APIs)**: vLLM — production-grade, PagedAttention for efficient KV cache, continuous batching, tensor parallelism, best for self-hosted production deployments; Ollama — local development, single-binary, simplified model management, best for local prototyping and testing; Closed-source APIs (GPT-4o, Claude, Gemini) — no infrastructure, pay-per-token, best for teams without GPU infrastructure. The Yi-family projects: development uses Anthropic API (Claude) + OpenAI API (GPT-4o); YiAi evaluates Ollama for local development; vLLM is not yet needed (no production self-hosting). The decision framework: local dev → Ollama, production with GPU → vLLM, production without GPU → closed-source API.
- **Embedding model selection comparison (4 candidates)**: (1) BGE-M3 (BAAI) — 1024 dim, multilingual (100+ languages), 8192 token context, MIT license, best for multilingual RAG; Yi-family choice for YiAi RAG; (2) OpenAI text-embedding-3 — 256/1024/3072 dim (configurable), multilingual, 8191 token context, proprietary, best for OpenAI ecosystem; (3) Cohere Embed — 1024/4096 dim, multilingual, 512 token context (v3), proprietary, best for enterprise search with strong reranking; (4) Self-hosted (e.g., sentence-transformers) — configurable dim, model-dependent, no API cost, best for air-gapped/private deployments. The YiAi RAG system uses BGE-M3 via llama_index; the embedding dimension (1024) determines the vector database index configuration.
- **Fine-tuning decision tree (when to fine-tune vs. use other methods)**: Start → Is the problem a knowledge gap (model doesn't know something)? → Yes → RAG (retrieve the knowledge). No → Is the problem a behavior gap (model knows but doesn't do it)? → Yes → Prompt engineering (system prompt + few-shot). No → Is the problem a style/tone/format gap? → Yes → Few-shot examples (3-5 examples in the prompt). No → Is the problem a systematic gap across many examples? → Yes → Fine-tuning (LoRA first, full FT if LoRA insufficient). No → The problem is likely a model capability gap → Consider a more capable model. The Yi-family projects: all problems so far have been solved with RAG + prompt engineering; no fine-tuning has been done. The decision tree is documented in `model-finetuning-decision-tree-summary.md`.
- **AI technology radar (adopt/trial/assess/hold for 2026-08)**: Adopt — llama_index (RAG), BGE-M3 (embedding), Claude API (LLM), prompt caching (cost optimization), ragas (evaluation); Trial — multi-provider routing (OpenAI/Anthropic/Google/Ollama), Ollama (local dev), vLLM (production inference); Assess — ADK/Agents CLI (agent orchestration), LoRA fine-tuning, MoE architectures (cost reduction), long-context (> 128K) models; Hold — full fine-tuning (not needed yet), multimodal models (no use case), on-premise GPU clusters (no scale). The radar is reviewed quarterly; items move from assess → trial → adopt as they are validated.
- **Yi-family tech foundations coverage (2026-08)**: 6 foundation summary files in `ai-engineer/foundations/`: transformer-architecture, kv-cache-inference-optimization, moe-architecture, rlhf-dpo-alignment, long-context-techniques, multimodal-fusion. 4 platform comparison files in `ai-engineer/platform/`: llm-comparison, inference-engine-comparison, vector-db-comparison, embedding-model-selection. 2 tracking files: llama-index-evolution, pi-agent-harness-evolution. The Yi-family's AI foundation knowledge is strongest in RAG/retrieval (implemented and evaluated) and platform comparison (documented); weakest in fine-tuning (not practiced) and multimodal (no use case).

## Scenario

When learning LLM foundations / choosing an inference engine / choosing a vector DB / choosing an Embedding model / deploying / evaluating, engineers and architects need to look up foundational theory + platform choices + deployment tools. This entry aggregates all ai-foundations leaves, ai-platform choices, and ai-specific methodology into a 2-hop path, avoiding "choosing by gut feel / weak theory / deployment disasters".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/ai-foundations/` | [transformer-architecture-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [attention-mechanism-summary.md](../../ai-engineer/foundations/attention-mechanism.md) · [kv-cache-inference-optimization-summary.md](../../ai-engineer/foundations/kv-cache-inference-optimization.md) · [moe-architecture-summary.md](../../ai-engineer/foundations/moe-architecture.md) · [rlhf-dpo-alignment-summary.md](../../ai-engineer/foundations/rlhf-dpo-alignment.md) · [long-context-techniques-summary.md](../../ai-engineer/foundations/long-context-techniques.md) · [multimodal-fusion-summary.md](../../ai-engineer/foundations/multimodal-fusion.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [ai-workbench-user-guide-summary.md](../../ai-engineer/platform/ai-workbench-user-guide.md) · [llama-index-evolution-summary.md](../../ai-engineer/platform/llama-index-evolution.md) |
| `methodology/ai-specific/` | [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) |
| `work/tools/` | [vllm-ollama-deployment-summary.md](vllm-ollama-deployment.md) · [claude-code-tips-summary.md](claude-code-tips.md) · [pi-agent-harness-evolution-summary.md](pi-agent-harness-evolution.md) |
| `industry/competitors--` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) — vendor competitive landscape |
| `industry/reports--` | [ai-industry-report-summary.md](../../executive/industry/reports--ai-industry-report.md) — industry trends |
| `resources/reading-list/` | reading list (papers / blogs / books) |

## Action recommendations

1. Foundational theory: read in order Transformer → Attention → KV Cache → MoE → RLHF / DPO → long-context → multimodal.
2. Inference engine choice: choose per scenario vLLM (production) vs Ollama (local dev) vs closed-source API (GPT-4o / Claude / Gemini).
3. Vector DB choice: choose Milvus / Qdrant / Weaviate / pgvector by scale + cost + existing stack.
4. Embedding choice: choose bge-m3 / OpenAI text-embedding-3 / Cohere / self-hosted by language + cost + privacy.
5. Evaluation method: HELM / MT-Bench / self-consistency / human annotation; landing must build an eval set (see [evaluation-driven-development-pattern](../engineering/evaluation-driven-development.md)).
6. Fine-tuning decision: choose Full FT / LoRA / QLoRA / Prefix by data volume + cost + performance needs (see [model-finetuning-decision-tree-summary](../../ai-engineer/methodology/model-finetuning-decision-tree.md)).
7. Deployment: vLLM production + Ollama local + closed-source API gradual rollout (see [LLM rollout](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md)).
8. Observability: monitor recall / faithfulness / error rate / latency (see [llm-observability-comparison-summary](../../ai-engineer/platform/llm-observability-comparison.md)).

## Anti-patterns

- **Learning AI foundations by reading blog posts instead of source material.** Blog posts about Transformer architecture, attention mechanisms, and KV cache are summaries of summaries. They are useful for orientation but insufficient for the depth of understanding required to debug a production RAG pipeline or choose between inference engines. The primary source (papers, official documentation, reference implementations) must be the main learning material.

- **Choosing an LLM based on benchmark scores alone.** Public benchmarks (HELM, MT-Bench, MMLU) measure performance on tasks that may have no relationship to the team's actual use case. An LLM that scores 95% on MMLU may produce worse results on the team's specific domain than a model that scores 80%. The model must be evaluated on the team's eval set, not on public benchmarks.

- **Selecting a vector database before understanding the retrieval pattern.** Choosing Milvus because it is the most popular, or pgvector because it is already in the stack, without understanding the scale, query pattern, and filter requirements of the retrieval pipeline means the vector database becomes a bottleneck. The vector DB choice must be driven by the retrieval requirements (scale, latency, filter complexity, cost), not by popularity.

- **Treating model evaluation as a one-time launch checklist.** Running an evaluation once before launch and never again means the system degrades silently as the model, the data, and the usage patterns change. Evaluation must be continuous: every model update, every data change, and every significant usage pattern shift must trigger a re-evaluation. One-time evaluation is snapshot evaluation; continuous evaluation is system health.

- **Deploying an LLM without a fallback to a simpler model.** When the primary LLM (GPT-4o, Claude) has an outage, rate limit, or cost spike, the system must degrade to a simpler model (self-hosted vLLM, smaller open-source model) rather than failing entirely. The fallback is not a nice-to-have; it is the difference between degraded service and no service. The fallback path must be tested regularly.

## Related

- Same-category journey: [../strategies/find-ai-deployment-cases.md](./find-ai-deployment-cases.md) — landing cases
- Same-category journey: [../projects/build-a-rag-pipeline.md](../projects/build-a-rag-pipeline.md) — RAG application foundations
- Same-category journey: [../processes/understand-competitors.md](../process/understand-competitors.md) — vendor competition
- Upstream: [../../ai-engineer/foundations/README.md](../../ai-engineer/foundations/README.md) — ai-foundations leaf entry

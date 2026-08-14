---
title: AI Foundations Directory
tags: [leaf, tech, ai-foundations]
category: aier/foundations
created: 2026-08-03
updated: 2026-08-10
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [aier]
benefit: "foundations solid"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../aier/ml/find-ai-deployment-cases.md
  - ../platform/README.md
  - ../methodology/README.md
---

# AI Foundations Directory

> **As an** AI engineer, **I want to** understand AI/ML theory and foundations, **so that** I can make informed architectural decisions for AI systems.

Collects AI foundational theory and model architecture knowledge.

## Scope

- Transformer / Attention architecture
- Training paradigms (pre-training, SFT, RLHF, DPO)
- Inference and decoding (KV cache, sampling strategy)
- Context management (long context, RoPE, ALiBi)
- Multimodal architecture (vision encoder, LLaVA)
- MoE architecture

## File types and naming

- `{topic}.md`: foundational theme summary
- Naming uses English kebab-case

## Frontmatter template

```yaml
---
title: some topic
tags: [AI, foundations, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <link or internal>
type: summary
lifecycle: reference
last_verified: YYYY-MM-DD
review_cycle: quarterly
related:
  - ./attention-mechanism.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended structure

1. Concept definition and background
2. Mathematical intuition (no rigorous derivation needed)
3. Architecture diagram
4. Engineering implementation points
5. Limitations and improvement trajectory
6. Real-world application scenarios

## Included

### Core theory

- `transformer-architecture.md` — Transformer architecture summary
- `attention-mechanism.md` — Attention mechanism detailed
- `kv-cache-inference-optimization.md` — KV Cache and inference optimization
- `moe-architecture.md` — MoE architecture
- `rlhf-dpo-alignment.md` — RLHF / DPO alignment
- `long-context-techniques.md` — Long context techniques (RoPE / ALiBi / YaRN)
- `multimodal-fusion.md` — Multimodal fusion (CLIP / LLaVA)
- `sampling-strategy.md` — LLM sampling strategies (temperature, top-p, top-k, nucleus, beam search)
- `speculative-decoding.md` — Speculative decoding for faster LLM inference
- `quantization-distillation.md` — Model quantization (GGUF, GPTQ, AWQ) and knowledge distillation
- `flash-attention.md` — Flash Attention mechanism and efficient transformer architectures

### Operations

- `handle-a-model-drift.md` — Model drift detection and handling
- `handle-an-ai-failure.md` — AI failure handling patterns

### Dashboard files



## Related leaves

- [../platform](../platform) — Platform layer (inference engine / vector store)
- [../methodology](../methodology) — AI methodology
- [../data/](../data/) — data dimension
- [../../aier/ml/find-ai-deployment-cases.md](../../aier/ml/find-ai-deployment-cases.md) — scenario entry

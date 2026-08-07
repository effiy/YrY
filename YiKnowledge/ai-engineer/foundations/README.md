---
title: AI Foundations Directory
tags: [leaf, tech, ai-foundations]
category: ai-engineer/foundations
created: 2026-08-03
updated: 2026-08-07
source: internal
type: leaf-readme
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [ai-engineer]
benefit: "foundations solid"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ../../engineer/engineering/find-ai-deployment-cases.md
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

- `{topic}-summary.md`: foundational theme summary
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
  - ./dashboard-ai-maturity.md
  - ./dashboard-ai-safety.md
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

- `transformer-architecture-summary.md` — Transformer architecture summary
- `attention-mechanism-summary.md` — Attention mechanism detailed
- `kv-cache-inference-optimization-summary.md` — KV Cache and inference optimization
- `moe-architecture-summary.md` — MoE architecture
- `rlhf-dpo-alignment-summary.md` — RLHF / DPO alignment
- `long-context-techniques-summary.md` — Long context techniques (RoPE / ALiBi / YaRN)
- `multimodal-fusion-summary.md` — Multimodal fusion (CLIP / LLaVA)
- `sampling-strategy.md` — LLM sampling strategies (temperature, top-p, top-k, nucleus, beam search)
- `speculative-decoding.md` — Speculative decoding for faster LLM inference
- `quantization-distillation.md` — Model quantization (GGUF, GPTQ, AWQ) and knowledge distillation
- `flash-attention.md` — Flash Attention mechanism and efficient transformer architectures

## Related leaves

- [../platform](../platform) — Platform layer (inference engine / vector store)
- [../methodology](../methodology) — AI methodology
- [../data/](../data/) — data dimension
- [../../engineer/engineering/find-ai-deployment-cases.md](../../engineer/engineering/find-ai-deployment-cases.md) — scenario entry

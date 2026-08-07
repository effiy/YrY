---
title: Long context techniques (RoPE / ALiBi / YaRN)
aliases:
- long context
- RoPE
- ALiBi
- YaRN
- position interpolation
tags:
- AI
- foundations
- long context
- RoPE
- ALiBi
- YaRN
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
- multimodal-fusion.md
tacit: false
---

# Long context techniques (RoPE / ALiBi / YaRN)

> **As a** an ai engineer, **I want to** long context techniques, **so that** foundations solid.

> Through position encoding improvements, Transformer breaks the training length ceiling, supporting 32k / 128k / 1M context.

## Summary
- Absolute position encoding has poor extrapolation; training 2k extrapolated to 4k causes quality collapse
- Three classes of solutions: relative position encoding (RoPE/ALiBi), position interpolation (PI/NTK/YaRN), architecture changes (sparse attention)
- RoPE injects relative position via rotation matrices, extrapolates naturally; current mainstream for Llama / Qwen / DeepSeek
- ALiBi adds a linear bias to attention scores; excellent extrapolation but long-context quality slightly lower than RoPE+YaRN
- YaRN is a refined version of PI + NTK; with a small amount of continued training it can extend to 64k+
- Claimed window ≠ real effective length; must check needle-in-haystack testing

## Core viewpoints
- **Absolute position encoding is the biggest bottleneck for long context** — training length hard-limits extrapolation
- **RoPE is the current mainstream** — through rotation matrices, `q_m^T k_n` automatically includes relative position, no extra parameters
- **ALiBi extrapolates best** — no position encoding; adds a linear bias directly to attention scores; train 1k, extrapolate to 16k
- **YaRN is a refined combination of PI and NTK** — more stable than PI, needs less training data (10x less than PI)
- **Real effective length from needle-in-haystack** — claimed 128k does not mean usable; many models recall poorly in the middle

## Key information

### Concept breakdown

Three classes of solutions:
- **Relative position encoding**: attention sees relative positions (RoPE, ALiBi)
- **Position interpolation**: post-training extension (PI, NTK-aware, YaRN)
- **Architecture changes**: sparse attention, chunked attention (Ring Attention, LongRoPE)

### Key parameters / formulas / data

#### RoPE

Rotate the query / key vectors by position so that $q_m^T k_n$ automatically includes relative position $m-n$.

$$ q_m \to R_{\Theta,m} q_m, \quad k_n \to R_{\Theta,n} k_n $$

where $R_{\Theta,m}$ is the rotation matrix at position $m$.

#### ALiBi

No position encoding; add a bias proportional to relative distance directly to attention scores:

$$ \text{softmax}(q_i^T k_j - m \cdot (i - j)) $$

The farther the distance, the lower the attention score. $m$ differs per head, geometric series.

#### Position Interpolation (PI)

"Scale" a RoPE model trained at shorter context to longer context:

$$ \theta_i' = \theta_i / s $$

where $s$ is the extension factor. For example, train 2k, extend to 8k, $s=4$. Needs a small amount of long-text continued fine-tuning for a few thousand steps.

#### Solution comparison table

| Solution | Training length | Extrapolation ceiling | Continued training need | Short-context quality | Long-context quality |
|---|---|---|---|---|---|
| Original absolute | 2k | 4k | None | Good | Poor |
| RoPE | 2k | 8k | None | Good | Medium |
| ALiBi | 1k | 16k | None | Good | Medium |
| RoPE + PI | 2k → 8k | 16k | A few thousand steps | Good | Good |
| RoPE + NTK-aware | 2k | 16k | Small amount | Good | Good |
| RoPE + YaRN | 2k → 32k | 64k+ | Very few steps | Good | Good |

### Applicable scenarios
- Large-scale document QA (BRD / legal / code)
- Long multi-turn conversation (customer service continuous session)
- Repo-level code understanding (whole repo as context)
- Long multimodal video
- This team: YiAi BRD generated context requirement 30-50k (sectionTemplate + multilingual glossary + user input); long-context model required

## Action recommendations
1. Pick a model with RoPE base first; for large extrapolation needs, add YaRN extension
2. Extreme extrapolation and tolerant of slightly lower long-context quality → ALiBi (train 1k, extrapolate to 16k still usable)
3. Train 2k, want to extend to 8k → use PI; trainable in a few hours; short-context quality almost intact
4. When choosing a model, check needle-in-haystack tests, not just claimed length
5. Long-context requests use a dedicated pool to avoid dragging down short conversation requests
6. For very long documents, chunk + retrieve first, then feed to model; don't stuff it raw

## Anti-patterns
- **Hard extrapolation of training length** — absolute position encoding trained 2k extrapolated to 4k causes quality collapse; must use RoPE / ALiBi
- **Only checking claimed window, not needle-in-haystack** — Lost in the Middle makes middle recall very poor
- **Long-context requests share a pool with short requests** — long requests drag down short-request SLA
- **Stuffing very long documents into the model** — beyond effective length, quality drops sharply; should chunk + retrieve
- **Ignoring memory explosion** — supporting 128k doesn't mean it's usable; needs PagedAttention + long-batch scheduling


- **Applying the same RoPE frequency scaling to all layers uniformly** — lower layers capture local syntax and need different frequency scaling than higher layers that capture long-range semantics; uniform scaling degrades both.
- **Using position interpolation without any continued training** — PI without even a few hundred fine-tuning steps causes perplexity spikes at the extended positions; continued training is mandatory.
- **Relying on a single needle-in-haystack test at one depth** — recall quality varies dramatically by position (beginning, middle, end); test at multiple depths and context lengths.
- **Treating long context as a flat, uniform window** — models recall information at the beginning and end far better than the middle; chunk strategically and place critical information at edges.
- **Assuming all attention heads benefit equally from context extension** — some heads are specialized for local attention; extending them introduces noise rather than signal.

## Related
- Same category:[transformer-architecture-summary.md](./transformer-architecture.md), [kv-cache-inference-optimization-summary.md](./kv-cache-inference-optimization.md), [multimodal-fusion-summary.md](./multimodal-fusion.md)
- Upstream: [attention-mechanism-summary.md](./attention-mechanism.md)
- Downstream:[../platform/llm-comparison.md](../platform/llm-comparison.md) (window comparison)

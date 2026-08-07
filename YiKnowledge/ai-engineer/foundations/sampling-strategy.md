---
title: "LLM Sampling Strategies: Temperature, Top-P, Top-K, Nucleus Sampling, Beam Search"
aliases:
  - sampling strategy
  - temperature
  - top-p
  - top-k
  - nucleus sampling
  - beam search
tags:
  - AI
  - foundations
  - sampling
  - decoding
  - inference
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
benefit: "Choose the right LLM decoding strategy for your use case -- creativity vs. determinism trade-offs made explicit"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - transformer-architecture.md
  - attention-mechanism.md
  - kv-cache-inference-optimization.md
  - speculative-decoding.md
  - ../methodology/llm-evaluation-methods.md
tacit: false
---

# LLM Sampling Strategies

> **As an** AI engineer, **I want to** understand LLM sampling and decoding strategies, **so that** I can control output quality, creativity, and determinism for each application scenario.

> Decoding strategy is not a single knob -- it is a pipeline of temperature scaling, truncation, and search, each with its own trade-offs between diversity, coherence, and cost.

## Summary

- Sampling strategies control how the model selects the next token from the logit distribution produced by the final linear layer.
- Temperature scales logits before softmax: T < 1 sharpens the distribution (more deterministic), T > 1 flattens it (more random).
- Top-K truncates to the K most probable tokens; Top-P (nucleus sampling) truncates to the smallest set whose cumulative probability exceeds P.
- Beam search maintains B candidate sequences and expands them in parallel, scoring by cumulative log-probability; it is the default for translation and structured generation.
- No single strategy is universally best; the choice depends on the task's openness (creative vs. factual) and the evaluation metric (BLEU vs. diversity).
- Modern LLM APIs expose these as parameters (temperature, top_p, top_k, presence_penalty, frequency_penalty) and also offer constrained decoding (JSON mode, grammar-guided generation).

## Core viewpoints

### 1. Temperature is the primary creativity knob, but it interacts with truncation

Temperature T divides logits before softmax: `p_i = softmax(z_i / T)`. When T = 0, the model always picks the argmax token (greedy). When T = 1, the original distribution is used. When T > 1, the distribution flattens, increasing the probability of low-ranked tokens. The key insight is that temperature alone does not limit the token set -- it merely reshapes probabilities. For truly constrained output, temperature must be paired with Top-K or Top-P truncation. Setting T = 0 with a provider API typically triggers greedy decoding internally, but the exact behavior varies by provider (some use a small epsilon).

### 2. Top-P (nucleus sampling) adapts to distribution shape better than Top-K

Top-K with a fixed K = 50 is a blunt instrument: for a sharply peaked distribution it includes irrelevant tokens; for a flat distribution it may exclude plausible ones. Top-P = 0.9 dynamically selects the smallest set of tokens whose cumulative probability mass reaches 90%. This adapts to the entropy of each prediction step. In practice, most production systems use Top-P = 0.9 to 0.95 combined with temperature = 0.7 to 1.0 for creative tasks, and Top-P = 0.1 to 0.3 with temperature = 0.1 to 0.3 for factual or structured output.

### 3. Beam search is optimal for tasks with a clear correctness metric but degrades diversity

Beam search with beam width B = 4 to 8 is the gold standard for machine translation, speech recognition, and code generation where the output is expected to be a single correct sequence. However, beam search systematically reduces diversity: it converges to the same high-probability region, producing near-identical outputs for similar prompts. For open-ended generation (storytelling, dialogue, brainstorming), beam search produces bland, repetitive text. This is why most chatbot APIs default to sampling rather than beam search.

### 4. Repetition penalties address a universal failure mode of likelihood-maximizing decoders

All maximum-likelihood decoders (greedy, beam search, naive sampling) tend to repeat phrases because the model learns that repeating a token is a safe way to maintain high probability. Two mechanisms address this: frequency penalty (reduces logit of a token each time it has appeared) and presence penalty (reduces logit of a token if it has appeared at all). Typical values are 0.1 to 0.5 for frequency penalty and 0.0 to 0.3 for presence penalty. Too high values cause unnatural avoidance of common words and degrade coherence.

## Key info

### Strategy comparison

| Strategy | Determinism | Diversity | Latency | Best for |
|---|---|---|---|---|
| Greedy (T=0) | Maximum | None | Lowest | Classification, extraction |
| Temperature sampling | Low | High | Low | Creative writing, dialogue |
| Top-K | Medium | Medium | Low | Balanced quality/diversity |
| Top-P (nucleus) | Medium | High | Low | Open-ended generation |
| Beam search | High | Low | O(B) | Translation, code generation |
| Diverse beam search | Medium | Medium | O(B*G) | Captioning, summarization |
| Constrained decoding | High | N/A | Medium | JSON, SQL, structured output |

### Parameter interplay

- **T = 0.0 + Top-P = 1.0**: effectively greedy, but some providers add noise
- **T = 0.7 + Top-P = 0.9**: standard creative setting (chatbots, storytelling)
- **T = 0.2 + Top-P = 0.1**: factual/deterministic setting (Q&A, extraction)
- **T = 1.0 + Top-P = 0.95**: maximum diversity (brainstorming, ideation)
- **T = 0.0 + beam search (B=4)**: maximum determinism for structured tasks

### Sampling for agent tool calls

When an LLM agent needs to output structured tool calls (function calling), the sampling strategy has a direct impact on reliability:
- Use low temperature (0.0--0.2) to ensure the JSON schema is valid and parameter values are correct.
- Use constrained decoding (JSON mode / grammar) as a hard guarantee, not a sampling preference.
- Sampling with high temperature is the primary cause of malformed tool-call JSON in production.

### Sampling for RAG

RAG generation benefits from moderate determinism:
- Temperature 0.1--0.3 ensures cited facts are not hallucinated.
- Higher temperature is acceptable only when the retrieval context is extremely comprehensive.
- Top-P should be kept low (0.3--0.5) to avoid the model generating unsupported claims.

## Action recommendations

1. Classify every LLM call into one of three profiles: deterministic (T=0.0, Top-P=0.1), factual (T=0.2, Top-P=0.3), or creative (T=0.7, Top-P=0.9). Do not use a single profile for all tasks.
2. Use constrained decoding (JSON mode, grammar-guided generation) for tool calls and structured output -- it is a hard guarantee that sampling cannot provide.
3. Add frequency_penalty = 0.1--0.3 for long-form generation to prevent repetition loops; never exceed 0.5.
4. For code generation, use beam search (B=3--5) with a code-specific reranker, not temperature sampling.
5. For evaluation benchmarks, fix the sampling strategy and seed; varying sampling across runs makes results non-reproducible.
6. Log the sampling parameters alongside each generation in production observability -- they are essential for debugging quality regressions.

## Anti-patterns

- **Using T = 0.7 for tool calls**: high temperature is the #1 cause of malformed JSON in function calling. Use T = 0.0--0.2 with JSON mode.
- **Using beam search for chatbots**: produces repetitive, unnatural dialogue. Use Top-P sampling instead.
- **Setting frequency_penalty > 0.5**: causes the model to avoid common words entirely, producing unnatural text.
- **Using the same sampling parameters for all tasks**: factual Q&A, creative writing, and code generation have fundamentally different requirements.
- **Ignoring provider-specific behavior**: some providers (OpenAI, Anthropic) apply internal smoothing that interacts with your temperature setting.
- **Not setting a seed for evaluation**: non-deterministic sampling makes eval results non-reproducible; always fix the seed.

## Related

- Same category: [transformer-architecture-summary.md](./transformer-architecture.md), [attention-mechanism-summary.md](./attention-mechanism.md), [kv-cache-inference-optimization-summary.md](./kv-cache-inference-optimization.md), [speculative-decoding-summary.md](./speculative-decoding.md)
- Methodology: [../methodology/llm-evaluation-methods.md](../methodology/llm-evaluation-methods.md) (evaluation requires fixed sampling)
- Platform: [../platform/model-routing-strategy.md](../platform/model-routing-strategy.md) (sampling strategy per model tier)
---
title: Bigmodel vendor competitive landscape (Anthropic / OpenAI / Google / Meta / DeepSeek)
aliases:
- llm-vendor-landscape
- llm-vendor-comparison
- llm-market-landscape
tags:
- competitors
- bigmodel
- vendor landscape
- chooser type
category: executive/industry/competitors
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- executive
- product-manager
benefit: industry visible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./competitor-analysis.md
- ../reports/ai-industry-report.md
- ../market-trends/ai-market-trend-first-half.md
- ../../../ai-engineer/methodology/llm-evaluation-methods.md
tacit: false
---

# Bigmodel vendor competitive landscape

> **As an** executive, **I want to** llm vendor landscape, **so that** industry visible.

> A 2026 view of bigmodel vendors across five layers, and a chooser-type strategy.

## Summary

- Vendors have already stratified into closed-source flagship / open-source ecosystem / Chinese-language open-source / regional vertical / cloud-native, with clear capability and price tiers.
- OpenAI, Anthropic, and Google occupy the frontier and long-context high ground; DeepSeek, Qwen, and GLM lead in Chinese-language and push self-deploy cost to extremely low.
- We should adopt multi-vendor + capability-tiered routing: closed-source for the frontier and long-context, open-source for high-frequency and self-deploy.
- Model versions and API policies change every six months; you must have monthly evaluations and backup-vendor contingencies.

## Core viewpoints

- **Gap between closed and open source is narrowing but not gone** — DeepSeek-V3 / Llama 4 / Qwen3 approach 80% of closed-source SOTA on code and reasoning tasks, but the frontier is still held by closed-source vendors.
- **Chinese-language scenarios give domestic vendors a clear edge** — DeepSeek / Qwen / GLM outclass closed-source on Chinese-language understanding and price, and domestic compliance accelerates in-country adoption.
- **Multi-vendor is a must, not an option** — Binding to a single vendor limits throughput, pricing, and data policy changes, creating business risk; LiteLLM / Portkey unified-agreement routing is table stakes.
- **Self-deploy path is now mature** — DeepSeek-V3 + vLLM pushes reasoning compute cost into an affordable range; finance / government / medical private deployments are viable.

## Key information

### Vendor tiers (2026 view)

| Camp | Representative | Business model | Differentiation |
|---|---|---|---|
| Closed-source flagship | OpenAI, Anthropic, Google | API + subscription | Frontier capability, safety, ecosystem |
| Open-source ecosystem | Meta (Llama), Mistral, Qwen, DeepSeek | Open-source weights + enterprise service | Self-deployable, fine-tunable |
| Chinese-language open-source | Qwen, DeepSeek, GLM, Zhipu | Open-source + API | Chinese-optimized, low price |
| Regional vendors | Cohere, AI21, Stability | Vertical API | Vertical domain |
| Cloud-vendor native | AWS Nova, Google Gemini, Alibaba Tongyi | Cloud-bound | Cloud service integration |

### Per-vendor profile

**OpenAI**
- Flagship: GPT-5 (multimodal + stronger reasoning)
- Business: API + ChatGPT subscription + enterprise edition
- Strengths: user mindshare, broadest ecosystem, function calling engineering
- Risks: commercialization and safety controversies, key personnel attrition
- Our use: one of the main BRD generation models

**Anthropic**
- Flagship: Claude 4.7 (Opus / Sonnet / Haiku)
- Business: API + Claude.ai subscription
- Strengths: long context (200k+), aligned on safety, code and docs capability
- Our use: BRD long-context scenarios prefer Claude Opus
- Concern: impact of Constitutional AI on hallucination rate

**Google**
- Flagship: Gemini 2.5 Pro / Flash / Nano
- Business: Vertex AI + Google Workspace integration
- Strengths: multimodal, self-developed TPU, Bard / Search traffic
- Concern: Bard reach in Western markets

**Meta**
- Flagship: Llama 4 (open-source weights)
- Business: open-source + Meta AI assistant
- Strengths: open-source, fine-tunable, community ecosystem
- Concern: cost/quality trade-off of open-source models in our self-deploy scenarios

**DeepSeek**
- Flagship: DeepSeek-V3 / R1
- Business: open-source weights + API
- Strengths: sparse MoE + MLA pushes reasoning cost low, Chinese-friendly, extremely low price
- Our use: under evaluation, as the primary self-deploy choice

**Qwen (Alibaba)**
- Flagship: Qwen 3 series (incl. MoE)
- Strengths: Chinese-optimized, multimodal, open-source
- Concern: evaluate for YiVad Chinese-language scenarios

**GLM (Zhipu)**
- Flagship: GLM-4.5
- Strengths: sparse MoE, Chinese-optimized, domestic compliance

### Comparison dimensions

| dimension | OpenAI | Anthropic | Google | Meta | DeepSeek | Qwen | GLM |
|---|---|---|---|---|---|---|---|
| Frontier capability | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★ | ★★★★ | ★★★★ | ★★★★ |
| Chinese capability | ★★★ | ★★★ | ★★★ | ★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| Long context | 256k | 200k-1M | 2M | 128k | 128k | 256k | 128k |
| Open-source | No | No | No | Yes | Yes | Partial | Partial |
| Price (API) | High | High | Mid | Self-deploy | Extremely low | Low | Low |
| Self-deploy feasibility | No | No | No | Yes | Yes | Yes | Yes |
| Function calling | Mature | Mature | Mature | Mature | Fairly mature | Mature | Average |
| Multimodal | Yes | Yes | Yes | Partial | Yes | Yes | Yes |

### Application scenarios

- Frontier + long context (BRD section generation, cross-doc summary) → Claude Opus / GPT-5
- Chinese + high frequency (customer service, content generation) → DeepSeek-V3 / Qwen3
- Self-deploy + compliance (finance, government, medical) → DeepSeek-V3 + vLLM
- Multimodal / native video understanding → Gemini 2.5 Pro
- Open-source fine-tune (private knowledge injection) → Llama 4 / Qwen3

## Action recommendations

1. Prepare a "model chooser decision tree": partition along task type × context length × language × cost, output a single recommendation.
2. Maintain a business evaluation set and baseline; every new version launch runs the comparison within 7 days, results written back to this file's `last_verified`.
3. Use LiteLLM / Portkey for unified access; the routing layer supports hot-swap, avoid business code binding to a single SDK.
4. Use cheap models for first-round recall / drafts, escalate to flagship for refinement when needed, control per-token output cost.
5. Monitor API policy changes (throttling, pricing, data policy); refresh backup-vendor contingency every quarter.
6. Track model version release cadence (semi-annual major versions), safety/compliance policies (in EU), open-source license changes, inter-vendor partnerships (Anthropic + AWS / Google).

## Anti-patterns

- **Bound to a single vendor** — throttling or policy changes stall business directly; must have multi-vendor.
- **Choose only by benchmark** — benchmarks are partly gamed via special optimization; must re-test with a business evaluation set.
- **Self-deploy without ROI calculation** — Llama 4 / DeepSeek self-deploy compute + ops cost may not be lower than API; quantify it.
- **Long-context abuse** — stuffing all knowledge into context is more expensive than RAG and unstable recall; long context is not a replacement for RAG.
- **Closed-source for sensitive data** — unredacted data into closed-source API triggers compliance risk; sensitive scenarios must self-deploy.


- **Assuming all vendors have the same API deprecation window** — OpenAI gives 3 months for version deprecation; some vendors give 30 days. Hard-coding a model name without an abstraction layer creates emergency migrations.
- **Routing by model name instead of capability tier** — model names change every quarter ("gpt-4o" to "gpt-5"); route by capability tier (frontier, cost-optimized, self-deploy) so the routing layer absorbs name changes.
- **Ignoring regional availability and data residency** — some vendors cannot serve certain regions; routing EU customer data through a US-only API is a compliance violation.
- **Evaluating vendors only once at selection time** — model quality, pricing, and API policies shift every quarter; a one-time evaluation becomes stale within 6 months.
- **Treating open-source models as free** — infrastructure (GPU compute, ops, engineering time) for self-deploying Llama or DeepSeek can exceed API costs; calculate TCO before committing.

## Related

- Same category: [competitor-analysis-template.md](./competitor-analysis.md) — single-competitor profile template
- Same category: [../reports/ai-industry-report.md](../reports/ai-industry-report.md) — industry report view
- Upstream: [../market-trends/ai-market-trend-first-half.md](../market-trends/ai-market-trend-first-half.md) — market trend forecast
- Downstream: [../../../ai-engineer/methodology/llm-evaluation-methods.md](../../../ai-engineer/methodology/llm-evaluation-methods.md) — evaluation methods
- References: LMSYS Chatbot Arena https://chat.lmsys.org ; HuggingFace Open LLM Leaderboard; Artificial Analysis https://artificialanalysis.ai

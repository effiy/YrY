---
title: LLM cost and efficiency dashboard
aliases:
- LLM cost dashboard
- token economics dashboard
- AI cost optimization dashboard
- model cost efficiency dashboard
tags:
- dashboard
- llm
- cost
- token
- efficiency
- ai-engineering
- optimization
category: ai-engineer/platform
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- ai-engineer
- tech-lead
- executive
benefit: LLM cost and token efficiency visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-ai-performance.md
- ../../foundations/dashboard-ai-maturity.md
- ../../methodology/dashboard-ai-methodology.md
- ../../../oncall-sre/observability/dashboard-cost-and-resource.md
tacit: false
---

# LLM cost and efficiency dashboard

> **As an** AI engineer, **I want to** track LLM costs and token efficiency, **so that** AI features are cost-effective, provider spend is optimized, and token usage is continuously improved.

> LLM costs grow with usage — without active management, AI feature costs can grow 3-5× year-over-year. This dashboard tracks token economics, provider mix, cost per use case, caching efficiency, and optimization levers.

## Summary

- 5 LLM cost dimensions: token economics, provider mix, cost per use case, caching efficiency, optimization levers
- 5 providers tracked: Anthropic (Claude), OpenAI (GPT-4o), Google (Gemini), AWS (Bedrock), Azure (OpenAI)
- 12 AI use cases with cost attribution: Chat, Code Review, Search, Code Generation, Documentation, Image Understanding, Voice, Agents, Embeddings, Reranking, Summarization, Translation
- Monthly LLM spend: $142K (growing 12%/mo); target cost per request decreasing 5%/mo through optimization
- Dashboard reviewed weekly; cost optimization sprint biweekly

## Core viewpoints

- Tokens are the new compute cost — just as we measure cloud in vCPU-hours, we measure AI in input+output tokens; every token has a dollar value
- The cheapest model that meets quality bars is the best model — don't use GPT-4o for classification when Haiku does the job at 1/50th the cost
- Caching is the highest-leverage optimization — identical prompts should never be re-processed; semantic caching can reduce costs 40-60%
- Cost must be attributed to use cases — without per-feature cost attribution, there's no accountability for AI spend

## Key information

### 5-panel LLM cost overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TOKEN ECONOMICS                  │  PROVIDER MIX                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Input:   2.8B tok/mo   │   │  │  Anthropic:  $68K (48%) │   │
│  │  Output:  0.4B tok/mo   │   │  │  OpenAI:     $42K (30%) │   │
│  │  Cache:   1.2B tok/mo   │   │  │  Google:     $12K (8%)  │   │
│  │  Total:   4.4B tok/mo   │   │  │  Bedrock:    $10K (7%)  │   │
│  │  Cost:     $142K/mo      │   │  │  Azure:       $8K (6%)  │   │
│  │  Cost/1K:  $0.032 avg    │   │  │  Other:       $2K (1%)  │   │
│  │  Trend:    ↑ 12%/mo      │   │  │  Best price: $0.8/M tok │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  COST PER USE CASE                │  CACHING EFFICIENCY              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Chat:      $48K (34%)  │   │  │  Cache hit:  42% ██     │   │
│  │  Code Rev:  $32K (23%)  │   │  │  Exact:      28% █▌     │   │
│  │  Search:    $18K (13%)  │   │  │  Semantic:   14% ▌      │   │
│  │  Agents:    $15K (11%)  │   │  │  Savings:    $23K/mo    │   │
│  │  Code Gen:  $12K (8%)   │   │  │  Potential:  $38K/mo    │   │
│  │  Embed:     $8K (6%)    │   │  │  TTL:        60 min     │   │
│  │  Other:     $9K (6%)    │   │  │  Invalidation: 2.5%     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Token economics by provider

| Provider | Model | Input tokens/mo | Output tokens/mo | Cost/1M input | Cost/1M output | Monthly cost | % of spend |
|---|---|---|---|---|---|---|---|
| **Anthropic** | | 1,800M | 220M | | | $68,000 | 48% |
| | Claude Opus 4 | 320M | 38M | $15.00 | $75.00 | $7,650 | 5.4% |
| | Claude Sonnet 4 | 980M | 120M | $3.00 | $15.00 | $4,740 | 3.3% |
| | Claude Haiku 4 | 500M | 62M | $0.80 | $4.00 | $648 | 0.5% |
| | Cache (read) | 1,200M | — | $0.30 | — | $360 | 0.3% |
| | Prompt caching (write) | — | — | $3.75 | — | $54,602 | 38.5% |
| **OpenAI** | | 800M | 120M | | | $42,000 | 30% |
| | GPT-4o | 350M | 45M | $2.50 | $10.00 | $1,325 | 0.9% |
| | GPT-4o-mini | 300M | 50M | $0.15 | $0.60 | $75 | 0.1% |
| | GPT-4-Turbo | 150M | 25M | $10.00 | $30.00 | $2,250 | 1.6% |
| | Base cost (incl. images) | — | — | — | — | $38,350 | 27.4% |
| **Google** | | 120M | 28M | | | $12,000 | 8% |
| | Gemini 1.5 Pro | 80M | 18M | $1.25 | $5.00 | $190 | 0.1% |
| | Gemini 1.5 Flash | 40M | 10M | $0.075 | $0.30 | $6 | 0.0% |
| | Base cost | — | — | — | — | $11,804 | 7.9% |
| **Bedrock** | | 80M | 18M | | | $10,000 | 7% |
| | Claude (via Bedrock) | 80M | 18M | varies | varies | $10,000 | 7.0% |
| **Azure** | | 60M | 12M | | | $8,000 | 6% |
| | GPT-4o (via Azure) | 60M | 12M | varies | varies | $8,000 | 5.6% |
| **Other** | | 40M | 8M | | | $2,000 | 1% |
| **Total** | | **2,800M** | **406M** | | | **$142,000** | |

### Cost per use case

| Use case | Provider/Model | Tokens/mo | Cost/mo | Cost/request | Requests/mo | % of total | Growth rate |
|---|---|---|---|---|---|---|---|
| **AI Chat** | Claude Sonnet 4 | 1,200M | $48,000 | $0.024 | 2,000,000 | 34% | ↑ 15%/mo |
| **Code Review** | Claude Opus 4 + Sonnet | 850M | $32,000 | $0.035 | 914,000 | 23% | ↑ 18%/mo |
| **Knowledge Search** | Claude Haiku + Embed | 420M | $18,000 | $0.012 | 1,500,000 | 13% | ↑ 8%/mo |
| **Autonomous Agents** | Claude Opus 4 | 380M | $15,000 | $0.085 | 176,000 | 11% | ↑ 25%/mo |
| **Code Generation** | GPT-4o + Claude Sonnet | 280M | $12,000 | $0.042 | 286,000 | 8% | ↑ 10%/mo |
| **Embeddings** | text-embedding-3-large | 500M | $8,000 | $0.0005 | 16,000,000 | 6% | ↑ 5%/mo |
| **Documentation** | Claude Haiku | 180M | $3,500 | $0.008 | 438,000 | 2.5% | ↑ 12%/mo |
| **Image Understanding** | GPT-4o (vision) | 120M | $2,800 | $0.018 | 156,000 | 2.0% | ↑ 20%/mo |
| **Voice-to-Code** | Whisper + GPT-4o-mini | 60M | $1,200 | $0.015 | 80,000 | 0.8% | New |
| **Reranking** | Cohere Rerank | — | $800 | $0.001 | 800,000 | 0.6% | → |
| **Summarization** | Claude Haiku | 40M | $500 | $0.003 | 167,000 | 0.4% | ↑ 5%/mo |
| **Translation** | GPT-4o-mini | 20M | $200 | $0.002 | 100,000 | 0.1% | → |
| **Total** | | **4,050M** | **$142,000** | | | | **↑ 12%/mo** |

### Model tiering strategy

| Tier | Model | Use cases | Cost/1M tok | Quality requirement | Current usage | Optimization |
|---|---|---|---|---|---|---|
| **Premium** | Claude Opus 4, GPT-4-Turbo | Complex reasoning, agent planning, critical code review | $15-30 | Highest accuracy, complex multi-step | 18% of spend | Downgrade simple tasks to Standard |
| **Standard** | Claude Sonnet 4, GPT-4o | Chat, code review, code gen, image understanding | $3-10 | High accuracy, general purpose | 55% of spend | Route to Budget where quality allows |
| **Budget** | Claude Haiku, GPT-4o-mini, Gemini Flash | Classification, summarization, simple Q&A, translation | $0.15-0.80 | Good accuracy, simple tasks | 12% of spend | Increase usage, appropriate for many tasks |
| **Embeddings** | text-embedding-3-large | Search, RAG, clustering | $0.13 | Consistent vector representation | 6% of spend | Evaluate smaller model, dimension reduction |
| **Cached** | Prompt cache (all models) | Repeated prompts, system prompts | 10% of base | Same as source model | 9% of spend | Increase cache hit rate, longer TTL |

### Caching efficiency

| Cache type | Hit rate | Tokens saved/mo | Cost saved/mo | Potential hit rate | Potential savings | Gap |
|---|---|---|---|---|---|---|
| **Exact prompt cache** | 28% | 780M | $18,200 | 40% | $26,000 | Optimize prompt structure |
| **Semantic cache** | 14% | 390M | $4,800 | 30% | $10,200 | Increase similarity threshold |
| **System prompt cache** | 85% | 220M | $550 | 95% | $620 | Stabilize system prompt versions |
| **Embedding cache** | 62% | 310M | $1,200 | 80% | $1,550 | Longer TTL for stable content |
| **Total** | **42%** | **1,700M** | **$24,750** | **55%** | **$38,370** | **$13,620/month gap** |

### Cost optimization levers

| Lever | Current state | Target state | Monthly savings | Implementation effort | Risk | Priority |
|---|---|---|---|---|---|---|
| **Model downgrade (simple tasks)** | 18% Budget tier | 35% Budget tier | $14,000 | 2 weeks (prompt eval) | Quality regression | P0 |
| **Semantic cache expansion** | 14% hit rate | 30% hit rate | $5,400 | 1 week (cache config) | Stale responses | P0 |
| **Prompt compression** | 2.8B input tokens/mo | 2.2B (-20%) | $8,500 | 3 weeks (prompt refactor) | Context loss | P0 |
| **Exact cache optimization** | 28% hit rate | 40% hit rate | $7,800 | 1 week (prompt normalization) | None | P1 |
| **Output token reduction** | 0.4B output/mo | 0.32B (-20%) | $5,200 | 2 weeks (prompt tuning) | Incomplete responses | P1 |
| **Batch processing (non-realtime)** | 0% batched | 30% batched | $4,200 | 3 weeks (pipeline refactor) | Latency increase | P1 |
| **Embedding dimension reduction** | 3,072 dims | 1,536 dims | $2,800 | 2 weeks (re-index) | Recall degradation | P2 |
| **Provider arbitrage** | Single-provider per task | Multi-provider routing | $3,500 | 4 weeks (router) | Complexity | P2 |
| **Fine-tuned small model** | 0 fine-tuned | 2 fine-tuned models | $6,000 | 6 weeks (training) | Maintenance overhead | P2 |
| **Total addressable savings** | | | **$57,400/mo (40%)** | | | |

### Cost anomaly detection

| Date | Use case | Anomaly | Cost impact | Root cause | Resolution | Prevention |
|---|---|---|---|---|---|---|
| 2026-08-02 | Code Review | +$4,200/day spike | $12,600 | Diff expansion bug, 10× context | Fixed within 4 hours | Max diff size gate |
| 2026-07-18 | Chat | +$1,800/day sustained | $8,400 | Conversation history not truncated | Truncation window reduced | Token limit enforcement |
| 2026-06-25 | Agents | +$3,500/day spike | $7,000 | Agent loop (infinite retry) | Circuit breaker added | Max steps = 20 |
| 2026-05-12 | Search | +$900/day sustained | $5,200 | Embedding dimension mismatch | Re-indexed | Dimension validation gate |
| 2026-04-08 | All | +$2,000/day sustained | $18,000 | Opus 4 upgrade without cost review | Rollback, cost review added | Cost gate for model changes |

### Cost efficiency KPIs

| Metric | Current | Target | Benchmark | Assessment |
|---|---|---|---|---|
| Cost per chat message | $0.024 | < $0.018 | $0.01-0.05 | Needs improvement |
| Cost per code review | $0.035 | < $0.025 | $0.02-0.08 | Adequate |
| Cost per search query | $0.012 | < $0.008 | $0.005-0.02 | Needs improvement |
| Cache hit rate | 42% | > 55% | 40-60% | Adequate |
| Budget tier usage | 12% | > 35% | 30-50% | Needs improvement |
| Cost per daily active user | $0.18 | < $0.12 | $0.05-0.30 | Adequate |
| Token efficiency (output/input) | 14.5% | > 18% | 15-25% | Needs improvement |
| Cost growth vs usage growth | 1.3× | < 1.0× | — | Needs improvement |
| Anomaly detection time | 4.2 hours | < 1 hour | — | Needs improvement |
| **Overall cost efficiency score** | **62/100** | **> 80** | | |

## Action recommendations

1. **Model tiering audit**: 55% on Standard tier for tasks that Budget can handle; evaluate all non-reasoning prompts on Haiku/GPT-4o-mini, target $14K/mo savings
2. **Prompt compression sprint**: 2.8B input tokens/month; apply prompt compression techniques (fewer examples, concise system prompts), target 20% reduction ($8.5K/mo)
3. **Semantic cache expansion**: 14% hit rate; increase similarity threshold, expand cache TTL to 4 hours for stable content, target $5.4K/mo additional savings
4. **Cost anomaly detection automation**: 4.2-hour detection time; implement real-time cost anomaly alerts with per-use-case thresholds, target < 1 hour
5. **Agent cost guardrails**: $15K/mo on agents, 25% growth rate; add max steps, token budget, and cost per task limits for all agent runs
6. **Output token reduction**: 0.4B output tokens/month; tune prompts for conciseness, add max_tokens limits, target 20% reduction
7. **Budget tier expansion**: 12% usage; systematically evaluate all prompts for Budget-tier compatibility, target 35% usage
8. **Provider routing**: implement intelligent provider routing based on task complexity, cost, and latency; target $3.5K/mo savings
9. **Weekly cost review**: review cost per use case, anomalies, cache hit rates, and optimization progress with AI team
10. **Cost gate for model changes**: any model upgrade must pass cost impact review; implement automated cost estimation in CI for prompt changes



- Defaulting to the best model → using Opus 4 or GPT-4-Turbo for every task because "quality matters"; most tasks don't need the best model, and the cost difference is 50-100×
- Cost as an afterthought → only looking at LLM costs when the monthly bill arrives; cost must be a first-class metric in development, reviewed with every prompt change
- Ignoring the long tail → optimizing the top 3 use cases while 40% of spend comes from 15 smaller use cases; all use cases need cost attribution
- Cache underutilization → not structuring prompts for cacheability; cache-friendly prompts (deterministic system prompts, stable few-shot examples) can save 30-50%
- Token waste → sending entire documents when only a paragraph is needed; every unnecessary token costs money and adds latency

## Related

- Same class: [dashboard-ai-performance](dashboard-ai-performance.md) — AI model quality and performance
- Same class: [dashboard-ai-maturity](../../foundations/dashboard-ai-maturity.md) — AI maturity assessment
- Same class: [dashboard-ai-methodology](../../methodology/dashboard-ai-methodology.md) — prompt engineering, eval, RAG
- Same class: [dashboard-cost-and-resource](../../../oncall-sre/observability/dashboard-cost-and-resource.md) — cloud FinOps
- References: Anthropic — *Prompt Caching Guide*; OpenAI — *Token Usage and Cost Optimization*; Google — *Gemini Pricing and Efficiency*; a16z — *LLM Cost Economics*; Latent Space — *AI Engineer Cost Benchmarks*
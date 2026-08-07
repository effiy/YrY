---
title: Pick an LLM provider
aliases:
- I want to pick an LLM provider
- llm-vendor-journey
- model-selection-journey
- LLM selection entry
tags:
- journeys
- llm
- model-selection
- vendor
- gpt
- claude
- gemini
- qwen
- deepseek
category: ai-engineer/platform
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
roles:
- ai-engineer
benefit: selection is grounded
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/engineering/track-tech-foundations.md
- ./evaluate-an-llm-app.md
- ../../engineer/projects/build-a-rag-pipeline.md
- ../../ai-engineer/platform/README.md
review_cycle: quarterly
tacit: false
---

# I want to pick an LLM provider

> **As a** an ai engineer, **I want to** pick an llm provider, **so that** selection is grounded. 

> "GPT / Claude / Gemini / Tongyi / DeepSeek / Kimi selection + cost + latency + context + multimodal" reaches vendor comparison + inference engine + evaluation + capacity/cost + case studies within 2 hops.

## Summary

- Vendor comparison follows [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) + [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md)
- Inference engine follows [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md): vLLM / Ollama / closed-source API
- Evaluation follows [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md)
- Multi-provider routing follows [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) + [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md)
- Capacity and cost follow [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md)

## Core viewpoints

**Provider selection is not a one-time decision -- it is a continuous portfolio management problem.** The LLM provider landscape changes monthly: new models are released, pricing changes, capabilities improve, and providers experience outages. Treating provider selection as a one-time decision creates lock-in and exposes you to single-provider risk. The correct approach is to maintain a provider portfolio: a primary provider for each task, a secondary provider for fallback, and a routing layer that can switch between them.

**The cheapest provider is not the one with the lowest per-token price -- it is the one with the lowest cost per successful task completion.** A provider that charges $0.27/M tokens but requires 3 retries per task is more expensive than a provider that charges $3/M tokens and succeeds on the first attempt. The cost metric should be task-level: total tokens consumed divided by successful task completions. This captures the cost of retries, the cost of longer prompts to achieve the same quality, and the cost of post-processing to fix errors.

**Compliance and data sovereignty constraints are hard constraints, not preferences.** For applications serving users in China, the EU, or regulated industries, the choice of LLM provider is constrained by data residency requirements, not by model quality. DeepSeek and Qwen are the only viable options for China-compliance scenarios, regardless of how they compare to GPT-5 or Claude on benchmarks. The provider selection decision tree must start with compliance constraints, not with model capability.

**Provider selection should be tiered by task criticality, not by model capability.** The question is not "which model is best" but "which model is good enough for this task at the lowest cost." The tiering might be: Tier 1 (user-facing, high-stakes) uses the flagship model, Tier 2 (internal tools, moderate stakes) uses the mid-tier model, Tier 3 (batch processing, low stakes) uses the cheapest model. The tiering is based on the cost of failure, not on the model's benchmark scores.

**The provider's stability and deprecation policy matter more than their latest benchmark scores.** A provider that frequently deprecates models, changes API behavior, or experiences outages creates ongoing engineering costs that dwarf the per-token cost difference. The provider's track record for stability, backward compatibility, and deprecation notice periods should be weighted equally with model quality in the selection decision.

## Key info

- **Major provider comparison (2026)**: OpenAI (GPT-5, 128K context, $3/$15 per M tokens input/output, best-in-class reasoning, global availability, 99.5% uptime SLA, 3-month deprecation notice), Anthropic (Claude 4.7, 200K context, $3/$15, best-in-class safety + long-context, US/EU only, 99.5% uptime, 3-month notice), Google (Gemini 3, 1M context, $1.25/$5, best-in-class multimodal, global, 99.5% uptime, 1-month notice), DeepSeek (V4, 128K context, $0.27/$1.10, best-in-class cost-performance, China-hosted, 99% uptime, shorter notice), Qwen (3-Max, 128K context, $0.55/$2.20, strong Chinese, China-hosted, 99% uptime). The China vs global split is the most important binary decision: China-hosted providers (DeepSeek, Qwen) are compliance-required for China-market services; global providers (OpenAI, Anthropic, Google) are for international markets.
- **Cost per successful task calculation**: total_cost = sum(token_cost_per_call) / successful_completions. If a task requires 3 calls on average with the cheap provider (2 retries) vs 1 call with the expensive provider, the cheap provider at $0.27/M x 3 calls x 1000 tokens = $0.81 vs the expensive provider at $3/M x 1 call x 1000 tokens = $3.00. But if the cheap provider has a 20% failure rate (tasks that never succeed regardless of retries), the effective cost per successful task is $0.81 / 0.8 = $1.01 vs $3.00 / 1.0 = $3.00. The cheap provider is still cheaper, but the gap is 3x, not 11x. This calculation must be done per task type, not per model.
- **Multi-provider routing architecture**: the YiAi approach (ADR LLM multi-provider rollout) uses a routing layer that: (1) classifies each request by task type (chat, RAG, code, translation), (2) routes to the primary provider for that task type, (3) falls back to the secondary provider if the primary is unavailable or returns an error, (4) logs all provider calls for cost tracking and quality comparison. The routing layer is the key architectural decision: it decouples the application from any single provider and enables A/B testing of providers.
- **Context window utilization**: a model with a 1M token context window (Gemini 3) that costs $1.25/M input tokens costs $1.25 per fully-loaded prompt. A model with a 128K context that costs $3/M costs $0.38 per fully-loaded prompt. The larger context window is only cost-effective if you actually use it. Most RAG applications use <10K tokens per prompt; the context window size is a spec sheet number, not a cost driver. The exception: document analysis (legal contracts, research papers) where the full document must fit in the prompt.
- **Provider outage contingency**: each provider should have a fallback provider for the same task type, configured in the routing layer. The fallback should be tested monthly (automated failover test). The YiAi multi-provider rollout uses a 5-stage grayscale (1% → 10% → 50% → 100%) for each new provider, with automated rollback if error rate >5%. The key metric: provider switch time (from detecting primary outage to routing all traffic to secondary) should be <60 seconds.

## Scenario

When selecting an LLM vendor / evaluating models / multi-provider routing / switching models / computing costs / checking context / multimodal needs, architects + algorithm + product owners need to look up vendor comparisons + inference engines + evaluation methods + landing cases. This entry aggregates 7 LLM-selection-related leaves + the vendor competitive landscape + multi-provider routing ADRs into 2-hop paths, avoiding "intuition-based selection / single-vendor lock-in / switching-cost blowups".

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [ai-workbench-user-guide-summary.md](../../ai-engineer/platform/ai-workbench-user-guide.md) · [llama-index-evolution-summary.md](../../ai-engineer/platform/llama-index-evolution.md) |
| `tech/ai-foundations/` | [transformer-architecture-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [kv-cache-inference-optimization-summary.md](../../ai-engineer/foundations/kv-cache-inference-optimization.md) · [long-context-techniques-summary.md](../../ai-engineer/foundations/long-context-techniques.md) · [moe-architecture-summary.md](../../ai-engineer/foundations/moe-architecture.md) · [multimodal-fusion-summary.md](../../ai-engineer/foundations/multimodal-fusion.md) · [rlhf-dpo-alignment-summary.md](../../ai-engineer/foundations/rlhf-dpo-alignment.md) |
| `industry/competitors/` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) — vendor competitive landscape · [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md) |
| `industry/{reports,market-trends}/` | [ai-industry-report-summary.md](../../executive/industry/reports/ai-industry-report.md) · [ai-market-trend-first-half.md](../../executive/industry/market-trends/ai-market-trend-first-half.md) · [regional-market-observation.md](../../executive/industry/market-trends/regional-market-observation.md) |
| `methodology/ai-specific/` | [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [rpc-envelope-pattern.md](../../engineer/architecture-design/rpc-envelope.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) — per-user cost / capacity ceiling |
| `lessons/wins/` | [yiai-llm-phase-two-win.md](../../engineer/lessons/win-yiai-llm-phase-two.md) · [yiai-llm-phase-three-win.md](../../engineer/lessons/win-yiai-llm-phase-three.md) · [yiai-llm-phase-four-win.md](../../engineer/lessons/win-yiai-llm-phase-four.md) · [yiai-llm-phase-five-win.md](../../engineer/lessons/win-yiai-llm-phase-five.md) — multi-provider landing phases |
| `projects/YiAi/` | [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) · [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md) · [adr-brd-agent-launch.md](../../tech-lead/decisions/yiai/brd-agent-launch.md) — multi-provider ADRs |
| `work/tools/` | [vllm-ollama-deployment-summary.md](../../engineer/engineering/vllm-ollama-deployment.md) — self-hosted deployment |

## Action recommendations

1. **Classify requirements**: General chat / long context / multimodal / tool calling / embedding / rerank — define the scenario first, then select. 
2. **Evaluation set**: Build a 100-500 item labeled set covering core scenarios + hard cases + edge cases; see [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md). 
3. **Dimensions**: Correctness + fluency + P95 latency + per-call cost + long-context recall + multimodal accuracy + safety. 
4. **Multi-provider routing**: Don't lock into a single provider; route by scenario (cheap models for low-cost tasks / flagship for hard tasks / closed-source for fallback); see [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md). 
5. **Domestic vs closed-source**: Compliance / data sovereignty / Chinese-language scenarios favor domestic (Tongyi / DeepSeek / Kimi / Zhipu); general + overseas consider GPT / Claude / Gemini; see [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md). 
6. **Self-hosting**: For data-sensitive / large-scale / cost-controlled scenarios consider vLLM self-hosting; during development use local Ollama; see [vllm-ollama-deployment-summary.md](../../engineer/engineering/vllm-ollama-deployment.md). 
7. **Fine-tuning decision**: Full FT / LoRA / QLoRA / Prefix chosen by data volume + cost + performance needs; see [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md). 
8. **Cost**: Per-user cost = (input_tokens × input_price + output_tokens × output_price) × call frequency; follow [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md). 
9. **Observability**: At launch must monitor call success rate / latency / cost / error distribution; see [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md). 
10. **Switching plan**: Model deprecation / price hikes / service outages must be switchable; use multi-provider + fallback strategy; see [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md). 

## Anti-patterns

- **Selecting a provider based on a single model's benchmark scores without evaluating the provider's entire ecosystem.** The model is only one component of the provider relationship. Also evaluate: API stability and backward compatibility, documentation quality and SDK support, rate limits and quota management, support responsiveness and SLAs, and the provider's roadmap for model updates. A provider with a slightly worse model but better ecosystem support often delivers better total outcomes.

- **Using a single provider for all tasks without a fallback strategy.** Every provider experiences outages, and every provider deprecates models. Without a fallback strategy, a provider outage is a full application outage. The minimum viable fallback is: a secondary provider configured for each task, a routing layer that can switch providers without code changes, and a fallback that has been tested in the last 30 days.

- **Comparing providers by per-token price without accounting for the tokenizer differences.** Different providers use different tokenizers, which means the same text can have different token counts. A provider with a 50% lower per-token price but a 2x larger tokenizer produces the same cost as the more expensive provider. Always compare providers by the cost per task (or per 1000 characters of input), not by the per-token price.

- **Neglecting to evaluate the provider's latency at your expected scale.** Provider latency is a function of load, and the latency at 1 request per second may be dramatically different from the latency at 100 requests per second. Always benchmark latency at your expected production scale, and include latency SLAs in your provider evaluation criteria.

- **Choosing a provider for a use case they do not specialize in because the model is "good enough" on general benchmarks.** Claude Opus 4.7 is the best model for multi-step Agent workflows, but it is not the best model for ultra-long-context document analysis (Gemini is). GPT-5 is strong on multimodal, but it is not the best for China-compliance scenarios (DeepSeek is). The provider should be chosen for the specific task, not for the general benchmark ranking.

## Related

- Same-category journey: [../../engineer/engineering/track-tech-foundations.md](../../engineer/engineering/track-tech-foundations.md) — foundational theory
- Same-category journey: [./evaluate-an-llm-app.md](./evaluate-an-llm-app.md) — evaluation methods
- Same-category journey: [../../engineer/projects/build-a-rag-pipeline.md](../../engineer/projects/build-a-rag-pipeline.md) — RAG landing
- Same-category journey: [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) — AI product landing
- Upstream: [../../ai-engineer/platform/README.md](../../ai-engineer/platform/README.md) — ai-platform leaf entry

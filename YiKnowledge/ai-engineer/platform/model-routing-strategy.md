---
title: "LLM Request Routing Strategy: Cost-Based, Latency-Based, Quality-Based Routing and A/B Testing for Models"
aliases:
  - model routing strategy
  - LLM routing
  - cost-based routing
  - latency-based routing
  - quality-based routing
  - A/B testing for LLMs
tags:
  - AI
  - platform
  - routing
  - cost-optimization
  - latency
  - quality
  - ab-testing
category: ai-engineer/platform
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
last_verified: 2026-08-07
roles:
  - ai-engineer
  - engineer
benefit: "Route LLM requests to the optimal model based on cost, latency, and quality constraints -- reduce costs by 30-60% without degrading user experience"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - llm-comparison.md
  - ai-gateway-design.md
  - pick-an-llm-provider.md
  - llm-observability-comparison.md
  - ../methodology/llm-evaluation-methods.md
tacit: false
---

# LLM Request Routing Strategy

> **As an** AI engineer, **I want to** design intelligent LLM request routing strategies, **so that** I can minimize cost and latency while maintaining quality, and safely roll out model changes through A/B testing.

> Model routing is not a static configuration -- it is a dynamic decision per request based on task complexity, real-time provider health, cost budgets, and quality requirements.

## Summary

- LLM routing strategies determine which model to use for each request: cost-based (cheapest model that meets quality threshold), latency-based (fastest model within the latency budget), quality-based (best model for the task complexity), and hybrid (multi-objective).
- The key insight is that not all requests need the most powerful model: simple tasks (classification, extraction, summarization of short text) can be handled by cheaper/faster models with no quality loss.
- A/B testing for LLMs is the systematic comparison of two models (or model configurations) on live traffic, measuring quality, latency, and cost to make data-driven model selection decisions.
- Routing strategy must be adaptive: model performance drifts over time, providers have outages, and task distributions change. Static routing rules become suboptimal within weeks.
- The routing layer is typically implemented in the AI gateway (LiteLLM, Portkey) or as a custom middleware with a lightweight classifier for task complexity estimation.

## Core viewpoints

### 1. Cascade routing is the most effective pattern: start with the cheapest model, escalate on failure

Cascade routing sends each request to the cheapest model first, then escalates to more expensive models if the response quality is insufficient. The quality gate can be: (a) a lightweight classifier that scores the response, (b) the LLM's own confidence score, (c) a user feedback loop, or (d) structural validation (e.g., JSON schema compliance). The cost savings come from the fact that 60-80% of requests in typical applications are simple enough for a small model (Haiku, Flash, Llama-3-8B). Example cascade: Haiku -> Sonnet -> Opus. Each escalation adds latency but only for the fraction of requests that need it.

### 2. Task complexity classification is the foundation of intelligent routing

Before routing, the system must estimate the task complexity. Approaches: (a) rule-based: classify by task type (translation -> medium, classification -> simple, code generation -> complex), (b) embedding-based: cluster the prompt embedding and route based on historical performance of models on similar prompts, (c) LLM-as-judge: use a small, fast model to classify the complexity before routing. The classifier should be fast (< 50ms) and cheap (< 0.1% of the main request cost). A well-tuned classifier can achieve 85-95% accuracy in routing to the appropriate model tier.

### 3. A/B testing for LLMs requires careful experimental design to produce statistically valid results

Unlike traditional A/B testing (which compares fixed variants), LLM A/B testing must account for: (a) non-deterministic outputs (the same prompt can produce different responses), (b) subjective quality (user satisfaction is hard to auto-evaluate), (c) interaction effects (users may change behavior based on model quality), and (d) cost asymmetry (the two models have different costs). Best practices: use consistent random assignment (hash user_id), measure both auto-eval metrics (accuracy, faithfulness) and user metrics (thumbs up/down, re-ask rate, task completion), run for at least 2 weeks to account for usage patterns, and track cost per successful task (not just per request).

### 4. Multi-objective routing requires explicit trade-off articulation

The three objectives (cost, latency, quality) are inherently in tension. A routing strategy must specify how to trade off between them. The most practical approach is constrained optimization: minimize cost subject to latency < threshold and quality > threshold. For example: "route to the cheapest model with p95 latency < 2s and auto-eval accuracy > 90%". The thresholds should be defined per task type, not globally. A simple chatbot has different latency requirements than a code completion tool.

## Key info

### Routing strategy comparison

| Strategy | Decision basis | Cost impact | Latency impact | Quality impact | Complexity |
|---|---|---|---|---|---|
| Static (always use model X) | Manual config | Baseline | Baseline | Baseline | None |
| Cost-based | Cheapest model meeting quality threshold | -30-60% | Neutral | Neutral | Low |
| Latency-based | Fastest model meeting quality threshold | Neutral | -20-50% | Neutral | Low |
| Cascade routing | Escalate on failure/quality gate | -20-50% | +10-30% (escalation) | Neutral | Medium |
| Task-complexity routing | Classify task, route to appropriate tier | -30-60% | -10-30% | Neutral to +5% | Medium |
| A/B testing | Random split (50/50 or multi-arm) | Variable | Variable | Variable (measured) | Medium |
| Multi-objective | Constrained optimization | -20-50% | -10-40% | Configurable | High |
| Adaptive/learned | RL or bandit learning from outcomes | -30-70% | -10-40% | +5-15% | Very high |

### Cascade routing configuration example

```
Tier 1: Claude Haiku ($0.25/M input, 0.3s latency)
  -> Quality gate: confidence > 0.8 OR task is classification/extraction
  -> 60% of requests stay here

Tier 2: Claude Sonnet ($3/M input, 0.8s latency)
  -> Quality gate: response passes structural validation
  -> 30% of requests stay here

Tier 3: Claude Opus ($15/M input, 2.0s latency)
  -> No gate (always accept)
  -> 10% of requests reach here
```

### A/B testing checklist

| Phase | Actions | Duration |
|---|---|---|
| Design | Define metrics (auto-eval + user), choose split ratio, calculate sample size | 2-3 days |
| Shadow | Run model B in shadow mode (log but don't serve) to validate | 3-5 days |
| Ramp-up | 5% -> 10% -> 25% -> 50% traffic to model B | 1-2 weeks |
| Full test | Run at target split (e.g., 50/50) | 2-4 weeks |
| Analysis | Statistical significance, cost analysis, segment analysis | 3-5 days |
| Decision | Roll out winner, roll back loser, or iterate | 1 day |

### Key metrics for routing evaluation

| Metric | Formula | Target |
|---|---|---|
| Routing accuracy | % of requests routed to the correct tier | > 85% |
| Cost per successful task | Total cost / completed tasks | Decrease over baseline |
| Escalation rate | % of requests that escalate to higher tier | < 40% (lower is better) |
| P95 latency | 95th percentile end-to-end latency | < target threshold |
| Quality degradation | Auto-eval score difference vs. baseline | < 2% |
| User satisfaction | Thumbs up ratio, re-ask rate | No significant difference |

## Action recommendations

1. Start with static routing (one model per task type) and collect cost/latency/quality data for 2-4 weeks to establish baselines.
2. Implement cascade routing as the first optimization: route to Haiku/Flash first, escalate to Sonnet/Pro on quality failure. This alone typically saves 30-50%.
3. Build a task complexity classifier: rule-based for known tasks, embedding-based for open-ended tasks. Use it to route to the appropriate model tier.
4. For any model change (new model, version upgrade, prompt change), run an A/B test with at least 2 weeks of data before full rollout.
5. Use the AI gateway (LiteLLM/Portkey) to implement routing logic, not custom code -- the gateway provides fallback, observability, and cost tracking out of the box.
6. Monitor routing decisions in production: track the distribution of which model handles which tasks, escalation rates, and cost per task. Set alerts for anomalies.
7. Do not forget to route failed requests to a fallback model; a routing decision that results in no response is worse than an expensive response.

## Anti-patterns

- **Routing all requests to the most powerful model**: wastes 30-60% of cost on simple tasks that a small model handles equally well.
- **A/B testing without statistical power analysis**: small sample sizes lead to false conclusions. Calculate required sample size before starting.
- **Using only cost as the routing criterion**: the cheapest model may produce responses that require re-generation, increasing total cost.
- **Ignoring provider-specific rate limits**: routing to a model that is rate-limited causes failures, not savings.
- **Static routing without periodic re-evaluation**: model performance, pricing, and task distributions change over time.
- **A/B testing with user-visible model identity**: users may prefer one model based on reputation rather than actual quality. Blind the test.
- **Not tracking cost per successful task**: raw cost per request is misleading because cheap models may require more retries.

## Related

- Same category: [ai-gateway-design-summary.md](./ai-gateway-design.md), [llm-comparison-summary.md](./llm-comparison.md), [pick-an-llm-provider-summary.md](./pick-an-llm-provider.md)
- Methodology: [../methodology/llm-evaluation-methods.md](../methodology/llm-evaluation-methods.md) (evaluation metrics for routing decisions)
- Observability: [llm-observability-comparison-summary.md](./llm-observability-comparison.md) (tracking routing performance)

## References

- LiteLLM routing: https://docs.litellm.ai/docs/routing
- Portkey A/B testing: https://docs.portkey.ai/docs/guardrails
- GPTCache: https://github.com/zilliztech/GPTCache
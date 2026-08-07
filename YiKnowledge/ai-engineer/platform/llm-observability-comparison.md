---
title: LLM observability platform comparison (LangSmith / Langfuse / Helicone)
aliases:
- LLM observability
- LangSmith
- Langfuse
- Helicone
tags:
- AI Platform
- observability
- LLMops
- comparison
category: ai-engineer/platform
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
benefit: platform reliable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- inference-engine-comparison.md
- ../methodology/llm-evaluation-methods.md
- ../methodology/hallucination-mitigation.md
tacit: false
---

# LLM observability platform comparison (LangSmith / Langfuse / Helicone)

> **As a** an ai engineer, **I want to** llm observability comparison, **so that** platform reliable.

> Traditional APM cannot see LLM internals; a dedicated observability platform fills in trace / evaluation / cost / safety four layers.

## Summary
- Traditional APM only sees latency and status codes; cannot see prompt / completion / token usage / tool call / retrieval recall quality
- LLM observability platform does four things: trace, quality evaluation, cost attribution, safety monitoring
- LangSmith: native to LangChain, deepest trace, zero integration
- Langfuse: framework-agnostic, self-deploy (AGPL) or SaaS; first choice for many frameworks / teams
- Helicone: reverse proxy over OpenAI API, zero intrusion, strong cost attribution and alerting
- Production trace at 1-5% sampling + 100% for exceptions (errors, long latency, sensitive keyword hits)

## Core viewpoints
- **LangSmith fits LangChain-heavy users** — native trace deepest, zero integration
- **Langfuse is first choice for many frameworks / in-house stack** — framework-agnostic, self-deploy controllable, data stays in-house
- **Helicone is first choice for OpenAI-heavy users** — reverse proxy zero intrusion, strong cost and alerting
- **Trace sampling cannot be 100%** — write pressure too high; use 1-5% + 100% for exceptions
- **PII desensitization is required before launch** — filter phone / email / ID card before trace lands in the store

## Key information

### Concept breakdown

Traditional APM (Datadog / New Relic) only sees latency and status codes; cannot see the LLM internals: prompt, completion, token usage, tool call, retrieval recall quality, trace. LLM observability platform fills this layer; mainly needs to do four things:

1. **Trace**: decompose each request into prompt → retrieval → tool calls → LLM → output; visualize each step
2. **Quality evaluation**: run an eval set; compare prompt / model version quality differences
3. **Cost attribution**: aggregate token usage by user / app / scenario
4. **Safety monitoring**: PII leak, prompt injection, sensitive content alerts

### Key parameters / formulas / data

#### Dimension comparison

| Dimension | LangSmith | Langfuse | Helicone |
|---|---|---|---|
| Vendor | LangChain Inc. | Open source (YC W23) | Open source + SaaS |
| Deployment | SaaS only (has self-deploy enterprise version) | Self-deploy (AGPL) or SaaS | Self-deploy (AGPL) or SaaS |
| Integration | Native to LangChain; other needs SDK | Framework-agnostic; OpenAI-compatible layer + SDK | Reverse proxy over OpenAI API, zero intrusion |
| Trace model | Run tree (nested runs) | Observation tree (similar) | Request + parent request |
| Evaluation | Dataset + evaluator + online AB | Dataset + evaluator | Relatively weak (more monitoring) |
| Cost analysis | By token / model unit price | Same | Strong; by user / path |
| Prompt management | Prompt Hub | Prompt management | Average |
| Alerting | Simple | Custom rules | Strong |
| Main users | LangChain users | Many frameworks / teams | OpenAI-heavy users |

#### Selection decision tree

```
Heavy use of LangChain?
├─ Yes → LangSmith (native trace deepest, zero integration)
└─ No → Diverse frameworks / in-house stack?
 ├─ Yes → Langfuse (framework-agnostic, self-deploy controllable)
 └─ No → Mostly OpenAI API calls, care about cost and alerts?
 ├─ Yes → Helicone (reverse proxy zero intrusion)
 └─ No → Langfuse (default)
```

#### Capability comparison

| Capability | LangSmith | Langfuse | Helicone |
|---|---|---|---|
| Trace auto-instrumentation | Built into LangChain | SDK + OpenAI compatibility | Reverse proxy (automatic) |
| Multi-model support | Good | Good | Good |
| Online AB QA | Strong | Strong | Average |
| Eval dataset management | Strong | Strong | Weak |
| Prompt version management | Hub + repo | Strong | Average |
| User-level trace linking | user_id related | user_id related | user_id related |
| Self-deploy | Enterprise version | Open source AGPL | Open source AGPL |
| Data privacy | SaaS data leaves | Self-deploy data stays | Self-deploy data stays |

### Applicable scenarios
- LangChain-heavy users → LangSmith
- Many frameworks / in-house stack → Langfuse
- OpenAI API-heavy users + cost alert focus → Helicone
- This team: choose Langfuse self-deploy (data stays in-house, framework-agnostic, YiAi/YiVad both can integrate); integrate via OpenAI-compatible layer + in-house Agent, trace covers retrieval / tool / LLM all the way; monitoring metrics: error rate, p99 latency, token consumption, prompt version quality regression

## Action recommendations
1. Heavy LangChain use → LangSmith, zero integration
2. Many frameworks / in-house stack / data compliance needs → Langfuse self-deploy
3. Mostly OpenAI API calls + cost alert → Helicone reverse proxy
4. Production trace at 1-5% sampling + 100% for exceptions (errors, long latency, sensitive keyword hits)
5. PII desensitization: filter phone / email / ID card before trace lands; Langfuse supports pipeline preprocessing
6. Prompt + trace linking: keep a version for every prompt change; tag trace with prompt version for quality diffing
7. Cost attribution by user_id + app_id + scene three segments; can drill down to "which app's which kind of call is most expensive"
8. Alert thresholds: error rate >1%, p99 >2x baseline, token abnormal growth >30%/day
9. Annotate production trace to ingest into eval set; run automatically weekly; regression quality

## Anti-patterns
- **100% production trace sampling** — write pressure too high; use 1-5% + 100% for exceptions
- **Trace without PII desensitization** — phone / email / ID card in store is compliance risk
- **Prompt changes without versioning** — quality regression cannot be traced back to prompt version
- **Cost only looks at total bill** — don't know which app/scene is most expensive; aggregate by user_id + app_id + scene
- **No alert thresholds** — startled by bottom line and failures; error rate >1%, p99 >2x baseline, token >30%/day triggers
- **Production trace not annotated into eval set** — quality regression without basis; run eval set automatically weekly


- **Choosing an observability platform based on pricing alone** — integration depth and trace model fidelity matter far more than cost for complex agent pipelines; a cheap platform that misses tool-call spans is worthless.
- **Treating traces as a replacement for evaluation** — traces show what happened (execution path); evaluation shows whether the outcome was correct; both are needed.
- **Not setting trace retention policies** — traces accumulate indefinitely without a TTL; storage costs grow linearly and compliance exposure grows with retention window.
- **Logging full prompts and completions without user consent** — user-submitted content may contain PII or proprietary data; consent and opt-out mechanisms are required before logging.
- **Relying on a single observability platform without an export pipeline** — vendor lock-in is real; traces must be exportable to a standard format (OpenTelemetry) for portability.

## Related
- Same category: [inference-engine-comparison-summary.md](./inference-engine-comparison.md)
- Upstream: [../foundations/rlhf-dpo-alignment.md](../foundations/rlhf-dpo-alignment.md) (evaluate after alignment)
- Downstream: [../methodology/llm-evaluation-methods.md](../methodology/llm-evaluation-methods.md), [../methodology/hallucination-mitigation.md](../methodology/hallucination-mitigation.md)

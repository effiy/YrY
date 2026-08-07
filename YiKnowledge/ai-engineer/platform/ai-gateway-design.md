---
title: "AI Gateway Design: Multi-Provider LLM Routing, Rate Limiting, Fallback, and Observability"
aliases:
  - AI gateway
  - LLM gateway
  - LiteLLM
  - Portkey
  - model routing
  - API gateway for AI
tags:
  - AI
  - platform
  - gateway
  - routing
  - observability
  - cost-management
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
benefit: "Deploy a single AI gateway to unify multi-provider LLM access with automatic failover, cost tracking, rate limiting, and observability -- no vendor lock-in"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - llm-comparison.md
  - llm-observability-comparison.md
  - model-routing-strategy.md
  - inference-engine-comparison.md
  - pick-an-llm-provider.md
tacit: false
---

# AI Gateway Design

> **As an** AI engineer, **I want to** design and deploy an AI gateway for multi-provider LLM routing, **so that** my application can seamlessly switch between providers, track costs, enforce rate limits, and maintain observability without changing application code.

> An AI gateway sits between your application and LLM providers, acting as a unified API facade with cross-cutting concerns: authentication, routing, rate limiting, fallback, caching, cost tracking, and logging.

## Summary

- An AI gateway provides a single API endpoint (OpenAI-compatible) that routes requests to multiple LLM providers (Anthropic, OpenAI, Google, Azure, AWS Bedrock, self-hosted) based on configurable policies.
- Core capabilities: load balancing across providers, automatic failover on errors, rate limiting per user/API key, cost tracking per request, request/response logging, prompt caching, and semantic caching.
- Two leading open-source solutions: LiteLLM (proxy server, OpenAI-compatible, 100+ LLM providers) and Portkey (gateway with guardrails, canary testing, virtual keys).
- Commercial alternatives: Helicone (observability-focused), LangSmith (LangChain-integrated), Kong AI Gateway (API gateway + AI).
- The gateway is the single point of control for all LLM traffic; it must be highly available (multi-replica, stateless or with lightweight state) and must not add unacceptable latency (target < 50ms overhead).

## Core viewpoints

### 1. The AI gateway is the strategic control point for multi-provider LLM architecture

Without a gateway, every application service directly integrates with multiple LLM providers, duplicating authentication, error handling, rate limiting, and logging logic. This creates vendor lock-in because switching providers requires code changes in every service. With a gateway, provider selection is a configuration change, not a code change. The gateway also provides a single place to enforce organization-wide policies: cost budgets, model allowlists, PII redaction, and compliance logging.

### 2. Fallback and retry logic must be layered: same-model-different-provider, then different-model

The most resilient fallback chain is: (1) retry the same request on the same provider (for transient errors), (2) retry the same model on a different provider (e.g., Claude via Anthropic -> Claude via AWS Bedrock), (3) fall back to a different model with similar capabilities (e.g., Claude Opus -> GPT-5). The gateway should support configurable fallback chains with per-error-type policies (rate limit -> backoff and retry, content filter -> do not retry, server error -> immediate failover).

### 3. Cost tracking is not optional; it is the foundation for budget management and model selection

Every LLM request has a dollar cost that varies by model, token count, and provider pricing tier. The gateway must track cost per request, per user, per API key, and per project. This enables: (a) per-user or per-project budgets with automatic cutoff, (b) cost-based routing (cheapest provider that meets quality requirements), (c) anomaly detection (cost spikes), and (d) chargeback to internal teams. LiteLLM and Portkey both support cost tracking natively; the data should be exported to a time-series database (Prometheus + Grafana) for dashboards and alerting.

### 4. Semantic caching at the gateway level can reduce costs by 50-80% for repeated queries

A semantic cache stores (query embedding, response) pairs and returns the cached response for new queries whose embedding similarity exceeds a threshold (e.g., cosine similarity > 0.95). This is especially effective for: customer support bots (many similar questions), RAG-based Q&A (same knowledge base queries), and internal tools (repeated usage patterns). Implementation: embed the user query, search the vector store for similar queries, return cached response if similarity > threshold. Tools: GPTCache, Redis + vector search, or built-in LiteLLM caching.

## Key info

### Gateway architecture

```
Application Code
      |
      v
AI Gateway (LiteLLM / Portkey)
      |
      +-- Authentication (API keys, virtual keys, JWT)
      +-- Rate Limiting (per user, per key, per model)
      +-- Routing (load balancing, cost-based, latency-based, quality-based)
      +-- Fallback (provider failure, model degradation)
      +-- Caching (exact cache, semantic cache)
      +-- Logging (request/response, token counts, latency, cost)
      +-- Guardrails (PII redaction, content filtering, prompt injection detection)
      |
      v
Providers (Anthropic, OpenAI, Google, Azure, Bedrock, self-hosted vLLM/Ollama)
```

### LiteLLM vs. Portkey comparison

| Feature | LiteLLM | Portkey |
|---|---|---|
| Provider count | 100+ | 50+ |
| OpenAI-compatible API | Yes | Yes |
| Load balancing | Round-robin, weighted, latency-based | Round-robin, weighted |
| Fallback | Configurable chains | Configurable chains |
| Rate limiting | Per-key, per-model | Per-key, per-model, per-user |
| Cost tracking | Yes, per-request | Yes, per-request |
| Prompt management | Via config | Built-in prompt registry |
| Guardrails | Custom callbacks | Built-in (PII, content, injection) |
| Canary/testing | No | Yes (A/B model testing) |
| Cache | Redis, in-memory | Redis, semantic |
| Observability | Langfuse, Helicone, Datadog | Built-in dashboard + Langfuse |
| Deployment | Docker, Kubernetes, pip | Docker, Kubernetes, cloud |
| License | MIT | MIT (core), Enterprise features |

### Key performance requirements

| Metric | Target | Rationale |
|---|---|---|
| Gateway overhead latency | < 50ms p99 | Should not dominate LLM latency (500ms-5s) |
| Availability | 99.9% | Single point of control for all LLM traffic |
| Rate limit accuracy | < 1% error | Over-limiting blocks legitimate traffic; under-limiting causes cost overruns |
| Cost tracking accuracy | > 99% | Budget management depends on accurate tracking |
| Cache hit latency | < 10ms | Semantic cache should be much faster than LLM call |

### Integration with observability

The gateway should emit structured logs and metrics to the observability stack:
- **Logs**: request_id, user_id, model, provider, tokens_in, tokens_out, latency_ms, cost_usd, cache_hit, status, error_type
- **Metrics**: request_count, token_count, cost_total, latency_p50/p95/p99, error_rate, cache_hit_rate, rate_limit_rejections
- **Traces**: full request lifecycle with spans for auth, rate limit check, cache lookup, provider call, response processing

Recommended integration: LiteLLM -> Langfuse (logging + tracing) + Prometheus (metrics) + Grafana (dashboards).

## Action recommendations

1. Start with LiteLLM proxy as the AI gateway: it has the broadest provider support, is OpenAI-compatible, and has a mature Docker/Kubernetes deployment story.
2. Deploy as a stateless service with Redis for rate limiting state and caching; run at least 2 replicas for high availability.
3. Configure fallback chains: same-model-different-provider (Anthropic -> Bedrock) -> different-model (Opus -> GPT-5) -> error response.
4. Integrate with Langfuse for observability from day one; cost tracking is the foundation for all optimization decisions.
5. Enable semantic caching for RAG-based applications to reduce repeated query costs by 50-80%.
6. Set per-user and per-project cost budgets in the gateway; automatic cutoff prevents bill shocks.
7. Use the gateway's virtual key feature to issue scoped API keys to internal teams (per-model, per-budget, per-rate-limit).

## Anti-patterns

- **Direct provider integration in every service**: creates vendor lock-in and duplicates cross-cutting logic. Route through the gateway.
- **No fallback configuration**: a single provider outage takes down all LLM-dependent features. Always configure at least one fallback.
- **Gateway as a single point of failure without redundancy**: run at least 2 replicas with a load balancer in front.
- **Not tracking cost per request**: without cost data, you cannot optimize model selection or detect anomalies.
- **Using the gateway for streaming without testing**: streaming responses require the gateway to handle SSE (Server-Sent Events) correctly; some gateways buffer the entire response.
- **Semantic cache with too-low similarity threshold**: returns irrelevant cached responses. Use threshold > 0.95.
- **Treating the gateway as a security boundary for prompt injection**: the gateway can filter but not fully prevent injection; defense in depth is required.

## Related

- Same category: [model-routing-strategy-summary.md](./model-routing-strategy.md), [llm-observability-comparison-summary.md](./llm-observability-comparison.md), [pick-an-llm-provider-summary.md](./pick-an-llm-provider.md)
- Upstream: [llm-comparison-summary.md](./llm-comparison.md) (which models to route to)
- Downstream: [../methodology/prompt-injection-defense.md](../methodology/prompt-injection-defense.md) (security guardrails)
- Infrastructure: [../../engineer/engineering/rate-limiting.md](../../engineer/engineering/rate-limiting.md) (rate limiting patterns)

## References

- LiteLLM: https://github.com/BerriAI/litellm
- Portkey: https://github.com/Portkey-AI/gateway
- Helicone: https://github.com/Helicone/helicone
- GPTCache: https://github.com/zilliztech/GPTCache
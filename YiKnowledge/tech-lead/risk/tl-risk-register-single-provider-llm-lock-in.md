---
title: Single-Provider LLM Lock-in Risk
aliases:
- single-provider-llm-lock-in
- llm-vendor-lock-in
- ollama-single-point-failure
- llm-provider-risk
tags:
- risk
- yiai
- llm
- lock-in
- vendor-management
- mitigation
category: tech-lead/risk
created: 2026-08-05
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- tech-lead
- ai-engineer
- executive
benefit: "Tech leads understand the full scope of single-provider LLM lock-in risk, its cascading failure modes, and the multi-phase mitigation strategy to eliminate the single point of failure"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./handle-an-outage-communication.md
- ../../ai-engineer/platform/model-routing-strategy.md
- ../../ai-engineer/platform/ai-gateway-design.md
- ../../ai-engineer/data/redis-caching-patterns.md
- ../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md
tacit: false
---

# Single-Provider LLM Lock-in Risk

> **As a** tech lead, **I want to** assess and mitigate the single-provider LLM lock-in risk in YiAi, **so that** a single provider failure does not halt all AI-dependent business functions across chat, code review, and RAG.

> YiAi currently depends entirely on a local Ollama deployment for LLM inference. This single-provider dependency creates a critical single point of failure: if Ollama fails, has a major bug, or the local GPU becomes unavailable, all AI services stop. This risk register documents the exposure, the multi-phase mitigation strategy, and the trigger conditions for contingency activation.

## Summary

- Single-provider LLM lock-in is the highest-severity technical risk in YiAi: probability Medium × impact Major = High exposure
- Failure modes: Ollama bug/upgrade regression, GPU hardware failure, traffic spike exceeding GPU capacity, model quality degradation, security vulnerability requiring immediate provider shutdown
- Mitigation strategy (4 phases): Phase 1 — abstract provider layer (Q3 2026), Phase 2 — routing + fallback (Q4 2026), Phase 3 — cost dashboard (Q4 2026), Phase 4 — self-hosted vLLM PoC (Q1 2027)
- Before Phase 1 completion: rate limiting + request queueing + aggressive caching serve as interim protections
- After Phase 2: automatic cloud provider fallback when Ollama is unavailable, with cost guard to prevent runaway cloud spend

## Core viewpoints

### 1. Single-provider risk is not about Ollama's reliability — it's about the absence of alternatives

Ollama is stable and well-maintained. The risk is not that Ollama is unreliable; it's that there is no alternative when something goes wrong. Every software system eventually fails. The question is whether the business can tolerate the downtime when it does.

### 2. The cost of lock-in is asymmetric

The cost of maintaining a single provider seems low (simple operations, no routing logic) until the provider fails. At that point, the cost is infinite: all AI services stop. The cost of multi-provider support seems high (engineering effort, operational complexity) but is finite and amortized. Organizations systematically underestimate the probability of the "infinite cost" scenario.

### 3. Provider abstraction is more valuable than provider diversity

Adding a second provider without abstracting the provider interface creates a different problem: two hard-coded integrations instead of one. The provider abstraction layer (Phase 1) is the most important architectural investment — it enables adding any number of providers with minimal code changes.

### 4. Caching is the first line of defense, not the last resort

A semantic cache can reduce LLM calls by 30-50% for production workloads. Every cached response is a call that didn't need the provider. Investing in caching before the multi-provider migration reduces the urgency and buys time for a careful migration.

### 5. The risk compounds with AI dependency growth

As YiAi adds more AI-powered features (BRD agent, code review, chat, RAG), the blast radius of a provider failure grows. A risk that is "major" today becomes "critical" when AI is embedded in 5 more workflows. Mitigation must stay ahead of dependency growth.

## Key info

### Risk assessment

| Dimension | Value | Rationale |
|---|---|---|
| **Probability** | Medium | Ollama is stable; GPU hardware is reliable; but single points of failure always fail eventually |
| **Impact** | Major | Chat, aicr, RAG, BRD agent all stop; customer-facing and internal tools affected |
| **Exposure** | High | Medium × Major = High; requires active mitigation |
| **Category** | Vendor / Platform | Single-provider dependency is a vendor risk, not a code quality risk |
| **Detection Time** | < 5 minutes | Health check endpoint on Ollama; Prometheus alert on consecutive failures |
| **Time to Recover (current)** | Hours to days | Manual intervention to restart Ollama, debug, or provision alternative |
| **Time to Recover (post-Phase 2)** | < 5 minutes | Automatic cloud provider fallback |

### Failure modes and impact

| Failure Mode | Probability | Impact | Current Mitigation | Post-Phase 2 Mitigation |
|---|---|---|---|---|
| Ollama process crash | Low | Major | Process monitor + auto-restart | Auto-fallback to cloud |
| GPU hardware failure | Very Low | Critical | None (single GPU) | Auto-fallback to cloud |
| Traffic spike > GPU capacity | Medium | Major | Rate limiting + queue | Auto-fallback to cloud + cost guard |
| Model quality degradation after update | Low | Medium | Model version pinning | A/B test new model on cloud before switching |
| Security CVE in Ollama | Low | Critical | Version pinning + vulnerability scanning | Switch all traffic to cloud while patching |
| Network partition (local) | Very Low | Major | None | Cloud provider accessible from different network path |

### Mitigation phases

| Phase | Timeline | Scope | Success Criteria | Status |
|---|---|---|---|---|
| **Phase 1: Provider Abstraction** | Q3 2026 | Abstract provider layer; onboard 1 cloud provider (OpenAI-compatible API); provider registry | Add new provider in < 50 lines of config; unit tests pass | In Progress |
| **Phase 2: Routing + Fallback** | Q4 2026 | Routing rules engine; automatic fallback on health check failure; cost guard (budget per provider) | Ollama failure → cloud provider within 30 seconds; no human intervention | Planned |
| **Phase 3: Cost Dashboard** | Q4 2026 | Per-provider cost tracking; cost anomaly detection; cost allocation by feature | Per-feature cost visibility; budget alerts | Planned |
| **Phase 4: Self-hosted vLLM** | Q1 2027 | Self-hosted vLLM on dedicated GPU; model serving independent of Ollama; PoC evaluation | Second local provider operational; no dependency on Ollama binary | Planned |

### Interim protections (before Phase 1)

| Protection | Mechanism | Limitation |
|---|---|---|
| Rate limiting | Per-user token bucket via Redis sorted sets | Delays but doesn't prevent saturation |
| Request queueing | FIFO queue with max depth; reject when full | Increases latency; doesn't help if GPU is down |
| Semantic caching | Embedding similarity → cached response; 30-50% hit rate | Doesn't help for unique queries |
| Process monitoring | Auto-restart Ollama on crash | Doesn't help if GPU hardware fails |
| GPU utilization alerting | Alert at > 95% utilization for 5 minutes | Detection only; no automatic mitigation |

### Trigger signals for contingency activation

| Signal | Threshold | Action |
|---|---|---|
| Ollama health check failure | 3 consecutive failures | Activate contingency: switch to cloud (post-Phase 2) or page on-call (pre-Phase 2) |
| GPU utilization | > 95% for 5 minutes | Activate rate limiting; alert on-call |
| Response latency P95 | > 5x baseline for 10 minutes | Investigate; prepare for fallback |
| Error rate | > 5% for 5 minutes | Activate contingency |

## Action recommendations

1. **Prioritize Phase 1 completion above feature work**: Every sprint that Phase 1 is delayed is a sprint where the single point of failure persists. The provider abstraction layer is infrastructure, not a feature — it should be treated as a blocking dependency for new AI features.
2. **Test the fallback path monthly**: After Phase 2, run a monthly fire drill: intentionally take Ollama offline and verify that traffic routes to the cloud provider within 30 seconds. An untested fallback is not a fallback.
3. **Set a cost guard budget before Phase 2**: Cloud provider costs can be unpredictable. Define a monthly budget per provider with hard caps. A $10,000 cloud bill from an accidental failover is its own incident.
4. **Monitor provider health as a first-class metric**: Add provider health to the main operations dashboard. It should be as visible as CPU and memory. If the provider is unhealthy, the team should know before the users do.
5. **Evaluate self-hosted alternatives during Phase 3**: vLLM, TGI, and llama.cpp all offer self-hosted inference. Evaluate them against Ollama on throughput, latency, and model compatibility. The goal is not to replace Ollama but to have a second local option.

## Anti-patterns

- **"Ollama has never failed, so it won't fail"**: Past reliability is not a predictor of future reliability. Every system that has ever failed was, at some point, a system that had never failed.
- **"We'll add multi-provider support when we need it"**: By the time you need it, you're already in an incident. The time to build a fire escape is not during a fire.
- **"Cloud provider is too expensive, so we'll stay single-provider"**: The cost of a multi-hour outage (lost revenue, engineering time, customer trust) is almost always higher than the cost of a cloud fallback that's used sparingly.
- **"We'll just switch providers manually if something goes wrong"**: Manual provider switching during an incident takes hours (provision accounts, update configs, deploy, test). Hours of downtime for AI-dependent services is unacceptable.
- **No cost guard**: Automated fallback without a cost cap. A bug that triggers 100,000 cloud API calls during a failover can generate a bill that exceeds the annual infrastructure budget.

## Related

- [Handling Outage Communication](./handle-an-outage-communication.md) — Communication during provider outages
- [Model Routing Strategy](../../ai-engineer/platform/model-routing-strategy.md) — Multi-provider routing architecture
- [AI Gateway Design](../../ai-engineer/platform/ai-gateway-design.md) — Gateway with fallback and caching
- [Redis Caching Patterns](../../ai-engineer/data/redis-caching-patterns.md) — Semantic caching as first line of defense
- [Supply Chain Risk](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) — Parallel supply-chain risk pattern
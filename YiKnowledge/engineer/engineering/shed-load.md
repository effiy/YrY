---
title: Shed load pattern
aliases: [shed-load-pattern, load-shedding, shed-load, load-shed]
tags: [methodology, engineering-patterns, resilience, shed-load, load-shedding, backpressure, degradation]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, tech-lead, oncall-sre]
benefit: "System protects itself during traffic spikes by shedding excess load gracefully rather than crashing entirely"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./rate-limiting.md
  - ../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md
tacit: Shed load is not failure; it is actively protecting life. Priority + threshold + degradation + rejection; keep key path, drop non-key; observable
---

# Shed load pattern

> **As an** engineer, **I want to** shed load, **so that** pattern applied consistently. 

## Problem

When the system is overloaded, holding on hard kills everything; refusing overload is a dead end. When the overload threshold triggers, you need to actively drop non-key loads, degrade non-key features, and reject low-priority requests to keep the key path available. Distinguished from rate limiting (entry prevention) + circuit breaker (protecting downstream) + graceful degradation (depends on failure) + backpressure (feeding back to upstream) -- shed load protects **yourself** from being crushed by **your own** load. 

## Pattern

- **Priority classification**: every load must be tagged P0 / P1 / P2 / P3; not vague
- **Threshold trigger**: CPU / memory / queue depth / latency / error rate exceeding threshold triggers; not by humans
- **Three strategies**: 
  - Drop low-priority (drop low-priority) -- P3 / P2 dropped first
  - Degrade non-key (degrade) -- turn off non-key features (search suggestions / recommendation stream / decorative rendering) 
  - Reject new requests (reject) -- return 503 + Retry-After
- **Protect key path**: key path is never shed; only non-key is shed
- **Progressive escalation**: drop first -> then degrade -> reject last; do not reject all at once
- **Observable**: shed events must be reported; not silently dropped
- **Reversible**: auto-recover when threshold falls back; no manual intervention

## Applicable

- LLM inference service overloaded (token rate limit saturated + queue burst + latency burst) 
- SSE streaming service (long connections + high concurrency + resource tight) 
- RAG query service (vector DB latency burst + queue burst) 
- Multi-provider switchover degradation path
- Holiday / big promotion / burst traffic scenarios

## Not applicable

- Single-service low-concurrency scenarios (rate limit is enough) 
- Strongly consistent key path (cannot drop) 
- Systems without priority distinction (classify first then shed) 

## Landing checklist

- [ ] Priority classification: every endpoint / task / request must be tagged P0-P3
- [ ] Threshold definition: CPU > 80% / queue depth > N / P99 > Xms / error rate > Y%
- [ ] Drop strategy: P3 / P2 dropped first; P0 never
- [ ] Degrade strategy: non-key feature list (recommendation / decoration / async tasks / batch) 
- [ ] Reject strategy: return 503 + Retry-After; do not return 5xx misdiagnosed as bug
- [ ] Progressive escalation: drop -> degrade -> reject order triggered
- [ ] Observable: shed count / drop rate / degrade rate / reject rate reported
- [ ] Auto-recover: auto-release when threshold falls back; no manual
- [ ] Work with rate limiting: rate limiting is entry prevention; shed is overload fallback
- [ ] Work with backpressure: feed upstream to slow down before shedding
- [ ] Work with circuit breaker: downstream fault circuit break + own overload shed
- [ ] Work with degradation: degrade is one strategy of shed
- [ ] Work with bulkhead: shed per bulkhead independently, not whole site
- [ ] Client cooperation: Retry-After + exponential backoff; do not retry wildly
- [ ] LLM scenarios: token budget exceeded -> drop non-key RAG / agent step -> degrade model tier (GPT-4 -> GPT-3.5) -> reject new session
- [ ] Multi-provider coordination: primary provider shed -> switch to backup provider, do not directly reject
- [ ] Drill: chaos + game day verify shed trigger and recovery

## Anti-patterns

- Reject whole site without classification -- key path also dies
- Shed not reported, silently dropped -- user does not know why it is slow
- Threshold gut call not quantified -- untriggerable or randomly triggered
- All reject at once without escalation -- poor experience
- No auto-recover after shed -- failure prolonged
- Shed used as rate limit -- rate limit is entry prevention, shed is overload fallback, do not mix
- Shed used as circuit breaker -- circuit breaker protects downstream, shed protects self, do not mix
- Shed used as backpressure -- backpressure feeds upstream, shed drops self, do not mix
- Shed key path -- violates life-protecting principle
- LLM without token budget -- no threshold triggers shed
- Multi-provider no switch, direct reject -- wastes backup path
- No drill, rely on failure to verify -- only real failure shows whether shed works

---
title: LLM Provider — Ollama + cloud fallback
lifecycle: active
key: tl_tech-selection_llm_provider
tags:
- tech-selection
- llm
- provider
- yiai
capability: LLM Provider
status: stable
evaluator: YiAi backend owner + CTO
candidates: Ollama (local), Alibaba Tongyi (cloud), Anthropic, OpenAI, vLLM self-hosted
conclusion: Phase 1 Alibaba Tongyi fallback; Phase 2 evaluate vLLM self-hosted
adr_ref: ADR-LLM-Multi-Provider-Rollout
type: dashboard
category: tech-lead/architecture
created: 2026-08-07
updated: 2026-08-09
source: internal
roles:
- tech-lead
- engineer
benefit: Tech leads can evaluate architectural choices with structured criteria, keeping the system coherent as it evolves
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
review_cycle: quarterly
tacit: false
related:
  - ./dashboard-architecture-review.md
  - ./design-architecture-decision.md
  - ./tl-dora-metrics-2026-q2-baseline.md
  - ../README.md
  - ../INDEX.md
---

# Tech Selection — LLM Provider

> **As a** tech lead, **I want to** tl_tech selection_llm_provider, **so that** architecture stays coherent. 

## Context

YiAi currently uses a single provider (Ollama local). We need to introduce multi-provider routing + fallback to reduce single-point risk and flexibly switch streams. Which cloud provider should we pick as the fallback for Ollama?

## Non-Negotiable Constraints

- Must be compatible with the OpenAI Chat Completions API (the most widely adopted standard).
- Must support streaming (SSE).
- Must have controllable cost (budget alert / rate limit).
- Authentication / egress IP restrictions must be controllable.

## Candidates

| Candidate | Type | License | Community | Notes |
|-----------|------|---------|-----------|-------|
| OpenAI-compatible (self-hosted vLLM) | Self-hosted | Apache 2.0 | Mature | Fully controllable; high GPU cost |
| Anthropic Claude API | Cloud | Commercial | Mature | High quality; high unit price |
| OpenAI official API | Cloud | Commercial | Mature | High quality; high unit price |
| Alibaba Tongyi / Zhipu | Cloud | Commercial | Domestic | Domestic compliance; strong Chinese |

## Evaluation Matrix (1-5 score, weighted)

| Dimension | Weight | vLLM self-hosted | Anthropic | OpenAI | Alibaba Tongyi |
|-----------|--------|-----------|-----------|--------|----------|
| Cost (3yr TCO) | 0.3 | 3 | 2 | 2 | 4 |
| Quality | 0.25 | 4 | 5 | 5 | 4 |
| Ecosystem | 0.15 | 4 | 5 | 5 | 3 |
| Maintainability | 0.15 | 3 | 5 | 5 | 4 |
| Risk | 0.15 | 3 | 4 | 4 | 3 |
| **Weighted Total** | | **3.4** | **3.85** | **3.85** | **3.65** |

## PoC Results

Phase 1 PoC: integrate one OpenAI-compatible provider (self-hosted vLLM or Alibaba Tongyi), running in parallel with Ollama, routing by model_name. The PoC validates envelope + streaming + cost guard feasibility.

## Decision

- **Selected:** Phase 1 — Alibaba Tongyi (domestic compliance + strong Chinese + OpenAI-compatible) as the cloud fallback for Ollama.
- **Fallback:** Phase 2 — introduce vLLM self-hosted (controllable cost) as the long-term replacement.
- **Rationale:** Phase 1 prioritizes compliance + fast launch; Phase 2 evaluates ROI before switching to self-hosted.

## Review Trigger

- Alibaba Tongyi unit price rises > 20% → trigger vLLM self-hosted PoC.
- Single-provider failure rate > 1% → add Anthropic as the second fallback.

---
> References: YiKnowledge → projects/YiAi/adr-llm-multi-provider-rollout.md | tech-lead/decisions/yiai--route-llm-traffic-across-providers.md

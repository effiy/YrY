---
title: "ADR: LLM Multi-Provider Rollout Plan"
tags: [adr, yiai, llm, rollout, multi-provider]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-03
source: internal
type: decision
status: accepted
lifecycle: in-progress
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the 5-stage gradual rollout plan for multi-provider LLM support"
acceptance_criteria:
  - "5 stages are clearly defined with prerequisites"
related:
  - ./route-llm-traffic-across-providers.md
  - ../../../engineer/learn/projects/yiai/README.md
---

# ADR: LLM Multi-Provider Rollout

> **Status**: Accepted (2026-08-03) — 5-stage gradual rollout in progress

## Context

After deciding to use `llama_index.llms.*` for multi-provider LLM routing, a gradual rollout plan is needed to avoid destabilizing the existing Ollama-based chat and RAG pipelines.

## Decision

**5-stage gradual rollout:**

1. **Supply-chain hardening (prerequisite)** — Ensure all LLM calls go through a single configurable path. No hardcoded provider references.
2. **Router implementation** — Build the provider router with fallback logic. Config-driven provider selection.
3. **Config gradual rollout** — Add cloud provider configs behind feature flags. Default remains Ollama.
4. **RAG generation side** — Enable multi-provider for RAG answer generation. Keep embedding on Ollama.
5. **Endpoint + frontend model selector** — Expose model selection in chat endpoints. Add model picker to YiVad aiChat and YiPet chat.

## Rationale

- Each stage is independently verifiable
- Ollama remains the default throughout — no breaking change
- Rollback at any stage is a config change, not a code change

## Consequences

- Router lives in `services/ai/` as a thin wrapper over `llama_index.llms`
- Provider configs live in `config.yaml` under `llm.providers`
- Frontend model selector is a dropdown populated from backend config
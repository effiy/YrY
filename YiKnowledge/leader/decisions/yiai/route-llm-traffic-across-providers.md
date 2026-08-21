---
title: "ADR: Multi-Provider LLM Routing"
tags: [adr, yiai, llm, multi-provider, routing]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-03
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand why YiAi routes LLM traffic across multiple providers via llama_index"
acceptance_criteria:
  - "decision context, options, and rationale are clearly stated"
related:
  - ./llm-multi-provider-rollout.md
  - ../../../engineer/learn/projects/yiai/README.md
---

# ADR: Multi-Provider LLM Routing

> **Status**: Accepted (2026-08-03) — implemented via `llama_index.llms.*`

## Context

YiAi needs to support multiple LLM providers (Ollama local models, cloud APIs) for different use cases: chat, RAG, BRD agent, code review. A single-provider approach limits model selection and creates vendor lock-in.

## Decision

**Use `llama_index.llms.*` as the LLM abstraction layer. Do NOT introduce `pi-ai` as an additional dependency.**

The `llama_index` library already provides a unified LLM interface that YiAi uses for RAG. Extending it to cover all LLM calls avoids introducing a second abstraction layer.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| `llama_index.llms.*` | Already a dependency; unified interface; supports Ollama + cloud providers | Limited to providers llama_index supports |
| `pi-ai` | Purpose-built for multi-provider | New dependency; second abstraction layer; overlap with llama_index |
| Direct provider calls | No abstraction overhead | Duplicated provider logic; no unified interface |

## Rationale

- `llama_index` is already a hard dependency for RAG — no new dependency
- The `llm` abstraction supports custom provider registration
- Avoids the complexity of maintaining two parallel LLM abstraction layers

## Consequences

- All LLM calls go through `llama_index.llms` interface
- Adding a new provider requires registering it with llama_index
- Ollama remains the default for local inference
---
title: "Tech Selection: LLM Provider"
tags: [tech-selection, llm, yiai, provider]
category: leader/architecture
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "Criteria and rationale for LLM provider selection in YiAi"
related:
  - ../decisions/yiai/route-llm-traffic-across-providers.md
  - ../decisions/yiai/llm-multi-provider-rollout.md
---

# Tech Selection: LLM Provider

> **Context**: YiAi needs LLM inference for chat, RAG, BRD agent, and code review. Selection criteria below.

## Current providers

| Provider | Role | Interface |
|----------|------|-----------|
| Ollama (local) | Default inference | `llama_index.llms.ollama` |
| Qwen3-Coder (Ollama) | Agent fallback (doer) | Same as Ollama |
| Cloud providers (planned) | Scale-out, specialized models | `llama_index.llms.*` |

## Selection criteria

1. **llama_index compatibility** — Must be supported by `llama_index.llms` (no new abstraction)
2. **Tool-calling support** — Native tool calling required for agent mode
3. **Chinese language quality** — Primary user base is Chinese-speaking
4. **Latency** — < 3s for chat, < 10s for agent tool calls
5. **Cost** — Local Ollama is free; cloud providers evaluated on $/1M tokens

## Decision

Use `llama_index.llms.*` as the unified interface. Ollama is the default. Multi-provider routing is config-driven via `config.yaml`.
---
title: LLM Fundamentals and Selection Guide
aliases: [llm-fundamentals, llm-selection, llm-basics, model-selection]
tags: [aier, llm, fundamentals, model-selection, ai]
category: aier/foundations
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier, engineer, leader]
benefit: "Engineers and leaders understand LLM capabilities and tradeoffs to make informed model selection decisions"
acceptance_criteria:
  - "explains key LLM concepts (tokens, context window, temperature, top-p)"
  - "provides a model comparison framework with selection criteria"
  - "covers local vs. cloud deployment tradeoffs"
related:
  - ./rag-patterns.md
  - ../platform/llm-comparison.md
  - ../methodology/prompt-engineering.md
---

# LLM Fundamentals and Selection Guide

> **When to use:** When choosing an LLM for a new feature or evaluating whether the current model is still the right fit.

## Core Concepts

### Tokens

A token is the unit of text the model processes — roughly 0.75 words in English. Both input (prompt) and output (completion) consume tokens.

| Concept | Definition | Why it matters |
|---|---|---|
| **Context window** | Maximum tokens the model can process at once | Limits how much context (conversation history, documents) you can include |
| **Input tokens** | Tokens in your prompt + context | Cost driver for most API-based models |
| **Output tokens** | Tokens in the model's response | Affects response length and cost |
| **Token limit** | Max output tokens per request | Caps response length; important for streaming |

### Key Parameters

| Parameter | Range | Effect | When to adjust |
|---|---|---|---|
| **Temperature** | 0.0 — 2.0 | Higher = more creative/random, Lower = more deterministic | Creative writing: 0.7-0.9; Code/QA: 0.0-0.2 |
| **Top-p** | 0.0 — 1.0 | Nucleus sampling: only consider tokens whose cumulative probability ≥ top-p | Alternative to temperature; usually set one or the other |
| **Max tokens** | 1 — context limit | Caps the response length | Set based on expected response size |
| **Stop sequences** | Strings | Stops generation when encountered | Control output format (e.g., stop at `"""`) |

## Model Selection Framework

### Decision dimensions

| Dimension | Questions to ask | Weight |
|---|---|---|
| **Task fit** | Can the model do the specific task? Coding? Reasoning? Chat? | Highest |
| **Latency** | What's the P99 response time? Is streaming supported? | High for user-facing |
| **Cost** | What's the cost per 1K tokens? Input vs. output? | High for high-volume |
| **Context window** | Is the context window large enough for our use case? | High for RAG/long docs |
| **Deployment** | Local (Ollama) or cloud API? Privacy requirements? | Medium |
| **Language support** | Does it support Chinese? Technical domains? | Medium for our use case |

### Model categories

| Category | Examples | Best for | Limitations |
|---|---|---|---|
| **Frontier (cloud)** | Claude Opus 4.7, GPT-5.5 | Complex reasoning, code generation, nuanced tasks | Cost, latency, data privacy |
| **Balanced (cloud)** | Claude Sonnet 4.6, GPT-4.5 | General-purpose, good cost/quality ratio | Less capable on very complex tasks |
| **Local (Ollama)** | DeepSeek-V4, Qwen, Llama | Data privacy, offline, low cost | Hardware requirements, lower capability ceiling |
| **Specialized** | CodeLlama, DeepSeek-Coder | Code-specific tasks | Narrower general capability |

## YiAi's Current Setup

YiAi uses **Ollama** for local LLM inference. Key considerations:

- **Privacy:** All data stays on-premise; no external API calls
- **Cost:** Zero per-token cost; hardware cost is fixed
- **Latency:** Depends on hardware (GPU vs. CPU inference)
- **Flexibility:** Can swap models without API changes

### When to consider cloud API instead

| Scenario | Recommendation |
|---|---|
| Task requires frontier-level reasoning | Add a cloud API fallback for complex tasks |
| Hardware is saturated | Offload some traffic to cloud API |
| Need a specific model capability | Use cloud API for that specific feature |

## Selection checklist

Before finalizing a model choice, verify:

- [ ] Model has been tested on 3-5 representative prompts from your use case
- [ ] Latency at expected load is within SLO
- [ ] Cost projection for expected volume is within budget
- [ ] Context window is large enough for your RAG chunks + conversation history
- [ ] Model supports the languages you need (Chinese for YiAi)
- [ ] Deployment path (local/cloud) aligns with privacy requirements

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Picking the "best" model without testing | Benchmarks don't reflect your specific use case | Test 3 models on your actual prompts before deciding |
| Ignoring cost for low-volume features | $0.01/request vs $0.001/request adds up at scale | Project costs at expected volume, not just per-request |
| Using cloud API for everything | Unnecessary cost and latency for simple tasks | Use local model for simple tasks; cloud for complex ones |
| Never revisiting model choice | New models are released frequently; last year's best may be obsolete | Re-evaluate model choice quarterly |
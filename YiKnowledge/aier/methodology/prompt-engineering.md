---
title: Prompt Engineering Guide
tags: [aier, prompt-engineering, llm, methodology]
category: aier/methodology
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier, engineer]
benefit: "Engineers write effective prompts for chat, RAG, and agent use cases"
related:
  - ./agent-architecture-patterns.md
  - ./prompts/README.md
  - ../../../engineer/learn/projects/yiai/README.md
---

# Prompt Engineering Guide

> **Prompts are code.** They live in version control, follow the same review cycle, and are tested like any other code.

## Prompt structure

```
[System]  ← Role, constraints, output format (persistent, not in message history)
[Context] ← RAG results, tool results, budget warnings (injected per-turn)
[User]    ← The actual task or question
```

## System prompt patterns

| Pattern | Example | When to use |
|---------|---------|------------|
| **Role** | "You are a BRD assistant for overseas after-sales..." | All chat modes |
| **Constraints** | "Never invent data. If unsure, say so." | Agent, RAG |
| **Output format** | "Respond in JSON: {section, content, sources}" | Structured output |
| **Tool awareness** | "You have access to: db_list, db_create, db_delete..." | Agent mode |

## Context injection patterns

| Pattern | Example | When |
|---------|---------|------|
| **RAG grounding** | "Relevant knowledge:\n[chunk 1]\n[chunk 2]" | Before user message |
| **Tool results** | "[Tool result: db_list]\n[{...}, {...}]" | After tool execution |
| **Budget** | "[BUDGET] 3 turns remaining. Compress non-essential steps." | Near max_turns |
| **Mission re-injection** | "Original task: create 2 menus for the sidebar..." | After compaction |

## Anti-patterns

- **Stuffing everything into the system prompt.** Long system prompts consume context and push out conversation history. Use RAG grounding instead.
- **No output format specification.** "Write a BRD" → unstructured. "Write a BRD with sections: Background, Requirements, Scope, Risks" → structured.
- **Prompt inlining.** Hardcoding prompts in Python/TypeScript makes them unmaintainable. Extract to config or dedicated prompt files.
- **No fallback for tool-calling failures.** When a model can't produce valid tool calls, fall back to text mode and parse `<tool_call>` XML from the text stream.
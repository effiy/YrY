---
title: "ADR: YiAi Agent Mode — Generic Data Tools + Confirmation Gate"
tags: [adr, yiai, agent, pi-agent, tool-calling, ollama, resilience]
category: leader/decisions/yiai
created: 2026-08-24
updated: 2026-08-24
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the agent loop architecture — generic data tools, confirmation gate, resilience guards, and resume-by-session"
related:
  - ../../../engineer/learn/projects/yiai/README.md
  - ./brd-agent-launch.md
  - ./llm-multi-provider-rollout.md
---

# ADR: YiAi Agent Mode — Generic Data Tools + Confirmation Gate

> **Status**: Accepted (2026-08-08) — implemented

## Context

The YiAi backend needed a multi-turn agent loop that could perform CRUD operations on MongoDB collections. The initial approach was to build per-domain tools (menu-specific, BRD-specific), but this would not scale — each new collection would require new tool code. The agent also needed safety guards: write operations required confirmation, and the loop needed resilience against model stalls, repeated observations, and context overflow.

## Decision

**Implement a pi-inspired agent loop with generic data tools (`db_list`, `db_schema`, `db_create`, `db_update`, `db_delete`), a confirmation gate for write operations, and a comprehensive resilience layer.**

### Architecture

```
domain/ai/
├── agent.py           # Agent loop: plan→execute→observe→repeat
│   ├── _wait_for_confirmation  # 120s poll, in-memory decision store
│   ├── _watch_disconnect       # ASGI receive channel abort detection
│   └── resume-by-session       # Persist/restore full tool trajectory
├── data_tools.py      # Generic CRUD tools over _WRITABLE_COLLECTIONS
│   ├── db_list / db_schema     # Read-only (no confirmation)
│   ├── db_create / db_update   # Write (confirmation-gated)
│   └── db_delete               # Write (confirmation-gated + orphan guard)
└── runtime.py         # OllamaRuntime with native tool calling + XML fallback
```

### Key design decisions

1. **Generic data tools over domain-specific tools**: The agent reasons over collection schemas (`_COLLECTION_SCHEMAS`) instead of hard-coded domain tools. `db_schema` returns collection structure as LLM context; the model decides which collection and operation to use. This means adding a new collection requires only a schema entry, not new tool code.

2. **Confirmation gate for writes**: `db_create`, `db_update`, `db_delete` are gated by `_WRITABLE_COLLECTIONS` + confirmation. The loop emits `confirmation_required`, pauses via `_wait_for_confirmation` (polls in-memory decision store, 120s timeout), and executes only on `"approved"`. Confirmation IDs are per-turn unique (`t{turn}:{call.id}`).

3. **Rejection memory**: `_session_rejections` stores canonical call signatures per session. Re-issuing an identical rejected call is auto-blocked — no second confirmation prompt. Bounded to last 20 per session.

4. **Resilience guards**:
   - **Narrate-and-stop guard**: When a model streams a plan as content without invoking tools, checks if text names unexecuted tools and injects `[CONTINUE]` nudge. Bounded by `_MAX_NUDGES = 2`.
   - **Failure-based model escalation**: When nudge guard is exhausted, escalates to a stronger fallback model (config `agent_model_fallback`). Emits `model_switch` event.
   - **Repeated-observation spin guard**: 3 consecutive identical tool-result observations trigger a `[TASK]` nudge.
   - **Turn-budget awareness**: `_budget_warning` injects `[BUDGET]` note within 3 turns of `max_turns`.
   - **Bound oversized tool results**: Caps at 6000 chars in LLM context (head 70% + tail 22% + re-query note).
   - **Length-stop tool-call failure**: When response hits output token limit, tool calls are failed with error instead of executing garbled args.

5. **Resume-by-session**: `save_session_history`/`load_session_history` persist each run's full `agent_messages` (incl. `tool_result` messages) per `session_id`, in-memory with 1h TTL. `resume: true` restores the faithful trajectory — only the user's continuation travels in the request.

6. **Native Ollama tool calling with XML fallback**: `OllamaRuntime.stream_chat` accepts `tools` and forwards structured `tool_calls`. The `<tool_call>` XML text parser remains as fallback for models that don't support native tool calling.

7. **Client disconnect abort**: `_watch_disconnect` runs alongside the SSE stream — polls the raw ASGI receive channel, sets an `abort` event checked between turns and tool calls.

### Consequences

- **Positive**: Generic tools scale to any collection; confirmation gate prevents accidental writes; resilience guards handle model stalls gracefully; resume-by-session enables long-running tasks across turn limits
- **Negative**: Complex state machine with many edge cases; in-memory session storage (1h TTL) is lost on restart; dual tool-calling path (native + XML fallback) doubles the parsing surface
- **Risk**: `_WRITABLE_COLLECTIONS` must be kept in sync with actual collection sensitivity; a missing collection in the allowlist silently blocks writes

## Alternatives considered

1. **Per-domain tools (menu_create, brd_update, etc.)** — rejected because it doesn't scale; each new collection requires new tool code, schema, and frontend wiring
2. **No confirmation gate (auto-execute)** — rejected as unsafe; the LLM can hallucinate destructive operations
3. **LangChain agent loop** — rejected because it adds framework dependency; the custom loop is ~500 lines and gives full control over turn budget, confirmation, and resilience
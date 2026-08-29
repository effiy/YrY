---
title: "ADR: YiVad Agent Mode (pi Agent Loop)"
tags: [adr, yivad, agent, ai, sse, pi-agent, tool-calling]
category: leader/decisions/yivad
created: 2026-08-24
updated: 2026-08-24
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the agent mode architecture decision — confirmation gates, auto-steer, resume-by-session, and chat-based permission"
related:
  - ../../../engineer/learn/projects/yivad/README.md
  - ../../yiai/brd-agent-launch.md
  - ../../yiai/llm-multi-provider-rollout.md
---

# ADR: YiVad Agent Mode (pi Agent Loop)

> **Status**: Accepted (2026-08-08) — implemented

## Context

YiVad's aiChat had basic SSE streaming chat but no support for multi-turn tool-calling agent loops. The YiAi backend introduced a pi-inspired agent loop with generic data tools (`db_list`, `db_schema`, `db_create`, `db_update`, `db_delete`), confirmation gates for write operations, and natural-language steering. The frontend needed to surface these capabilities: tool confirmation UI, live turn progress, model switch visibility, and the ability to steer/continue a running agent from chat.

## Decision

**Implement a full agent mode UI in aiChat with four key protocols: confirmation gate, auto-steer, resume-by-session, and chat-based permission answers.**

### Architecture

```
aiChat store (Pinia)
  ├── sendMessage ──→ POST /agent/chat (agent mode)
  │                   POST /agent/steer (mid-run correction)
  │                   POST /agent/confirm (approve/reject tool)
  │                   POST /agent/follow-up (queue after completion)
  ├── runStream ────→ SSE event loop
  │   ├── tool_execution_start/end → AgentTimeline (live tool lifecycle)
  │   ├── confirmation_required → MessageList banner (Approve/Reject)
  │   ├── model_switch → surfacing in streamed message
  │   └── agent_end → stop_reason handling (completed vs max_turns_reached)
  └── agentTurnProgress → el-progress bar (current/max/nearLimit)
```

### Key design decisions

1. **Confirmation gate UI**: Write operations (`db_create`/`db_update`/`db_delete`) trigger a confirmation banner with Approve/Reject buttons. Auto-rejects after 120s to match backend timeout. Confirmation IDs are per-turn unique (`t{turn}:{call.id}`) to prevent stale-decision collisions.

2. **Chat-based permission answers**: `confirmationAnswerFor(text)` classifies plain chat messages as approve/reject — users type `可以`/`yes` to approve, `不要`/`no` to reject. Reject with extra text both rejects AND steers the correction. Unit-tested 51/51.

3. **Auto-steer mid-run messages**: While the agent loop is running, plain chat messages are no longer silently dropped — they auto-steer via `POST /agent/steer`. The steered message reflects as a user bubble. Slash commands keep prior behavior.

4. **Resume-by-session for continue**: After `max_turns_reached`, the next send with a genuine continuation (`继续`/`continue`) sends only the user message with `resume: true`. The backend restores the persisted tool trajectory. New tasks after max_turns go as fresh runs. `isContinuationMessage(text)` mirrors the backend's `_is_continuation` exactly — parity is load-bearing. Unit-tested 21/21.

5. **Live turn-progress indicator**: `agentTurnProgress` computed shows current/max turns with an `el-progress` bar. Turns warning-colored within 2 of max_turns so users see the budget approaching.

6. **Model switch surfacing**: `model_switch` events append `⚙️ 模型自动切换：from → to` to the streamed message — escalation recovery is visible.

7. **Queued /followup messages**: `/followup` messages render as `followup`-typed bubbles on the user side with a "Follow-up queued" pill. Kept out of request history so consumed follow-ups are never re-sent.

### Consequences

- **Positive**: Users can run multi-turn tool-calling tasks from chat; confirmation gate prevents accidental writes; auto-steer enables natural correction without slash commands; resume-by-session enables long-running tasks across turn limits
- **Negative**: Complex state machine — `pendingConfirmation`, `agentTurnSummaries`, `lastAgentInterrupt`, `steering_consumed` flags must stay in sync with backend state
- **Risk**: Frontend/backend `isContinuationMessage` parity is load-bearing — a divergence would cause duplicate tool executions or lost trajectories

## Alternatives considered

1. **Slash-command-only agent control** — rejected because requiring `/steer` syntax for mid-run correction is unintuitive and easy to forget
2. **Separate agent page** — rejected because agent mode is a natural extension of aiChat, not a separate feature; subsuming into aiChat components avoids duplicating the chat infrastructure
3. **No confirmation gate (auto-execute writes)** — rejected as unsafe; the confirmation gate is the only barrier between the LLM and destructive data operations
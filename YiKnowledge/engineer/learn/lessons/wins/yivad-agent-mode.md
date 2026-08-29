---
title: "Win: YiVad Agent Mode — Chat-to-Action with Confirmation Gates"
tags: [win, yivad, agent, pi-agent, tool-calling, ai-chat]
category: engineer/learn/lessons/wins
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader]
benefit: "Engineers understand the architecture and impact of turning aiChat from a streaming chat into a multi-turn agent with tool execution"
acceptance_criteria:
  - "What was built and why it succeeded"
  - "Key architectural decisions that made it work"
  - "Metrics or qualitative impact"
related:
  - ./README.md
  - ../../../leader/decisions/yivad/agent-mode-pi-loop.md
  - ../../../projects/yivad/README.md
---

# Win: YiVad Agent Mode — Chat-to-Action with Confirmation Gates

## What was built

Transformed YiVad's aiChat from a basic SSE streaming chat into a multi-turn agent loop with tool execution. The agent can now perform CRUD operations on any MongoDB collection via generic data tools, with write operations gated by a confirmation banner.

**Key capabilities delivered (2026-08-08):**

- **Confirmation gate UI**: Write operations trigger an Approve/Reject banner with 120s auto-reject. Users type `可以`/`yes` to approve or `不要`/`no` to reject directly in chat.
- **Auto-steer**: Mid-run plain text messages are no longer silently dropped — they steer the running agent via `POST /agent/steer`.
- **Resume-by-session**: After `max_turns_reached`, typing `继续`/`continue` resumes the persisted tool trajectory without re-executing completed work.
- **Live turn progress**: `el-progress` bar shows current/max turns with warning color near the limit.
- **Model switch surfacing**: When the backend escalates to a stronger model, the handoff is visible in the stream.
- **Queued /followup**: Deferred instructions wait until the agent finishes, then execute.

## Why it succeeded

1. **Chat-based confirmation removed the mouse requirement.** Users approve/reject write operations by typing in the chat input — no need to click banner buttons. The `confirmationAnswerFor()` utility (51/51 unit tests) classifies natural language as approve/reject.

2. **Frontend/backend continuation parity is load-bearing.** `isContinuationMessage()` mirrors YiAi's `_is_continuation` exactly. A divergence would cause duplicate tool executions or lost trajectories. Unit-tested 21/21.

3. **Auto-steer eliminated the `/steer` syntax barrier.** Before: users needed to type `/steer <msg>` to correct a running agent. After: any plain text mid-run auto-steers. The steered message reflects as a user bubble so the correction is visible.

4. **Resume-by-session solved the turn-limit wall.** Before: every resume re-sent text-only narration and the model re-ran completed writes. After: the backend restores the full tool trajectory (incl. `tool_result` messages), so the model continues from reality.

## Impact

- Users can now complete multi-step CRUD tasks (e.g., "create 3 menus, update the first one, delete the second") entirely from chat
- The confirmation gate prevents accidental writes while keeping the flow conversational
- Resume-by-session enables long-running tasks across turn limits — measured 8/8 resumed runs complete the full lifecycle with zero duplicate tool executions
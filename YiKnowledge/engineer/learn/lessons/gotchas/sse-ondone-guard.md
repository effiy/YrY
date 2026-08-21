---
title: SSE onDone Guard — Prevent Side Effects on Aborted Streams
tags: [gotcha, sse, streaming, side-effects, chat]
category: engineer/learn/lessons/gotchas
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers avoid auto-forwarding partial or aborted chat content to external channels"
acceptance_criteria:
  - "Bug scenario described with root cause"
  - "Fix pattern documented with code example"
  - "Applicable to all SSE handlers with external side effects"
related:
  - ./README.md
  - ../../../../YiVad/CLAUDE.md
---

# SSE onDone Guard

> **Every SSE `onDone` handler with external side effects must check `!aborted && !error` before acting.**

## The bug (2026-07-28)

YiVad's `aiChat.ts` store had an `onDone` callback that called `autoForwardToRobots(streamed)` — forwarding the completed chat response to WeCom robots. When the user aborted mid-stream, the `onDone` callback still fired, and the partial content was auto-forwarded to WeCom.

**Impact**: Users who aborted a chat mid-response would have incomplete, potentially misleading content sent to WeCom channels. The abort was meant to cancel the response, but the side effect fired anyway.

**Root cause**: The `onDone` callback treated "stream ended" as equivalent to "stream completed successfully." SSE streams can end for multiple reasons: natural completion, user abort, network error, or server error. Only natural completion should trigger side effects.

## The fix

```typescript
// Before (broken)
onDone: () => {
  autoForwardToRobots(streamed);
}

// After (fixed)
onDone: () => {
  if (!lastPet?.aborted && !lastPet?.error) {
    autoForwardToRobots(streamed);
  }
}
```

The guard checks two conditions:
- `!aborted` — The user didn't cancel the stream
- `!error` — No network or server error occurred

Only when both conditions pass does the side effect fire.

## Where this applies

Any SSE `onDone` handler that has external side effects needs this guard:

| Side effect | Example | Guard needed? |
|---|---|---|
| Forward to external channel | WeCom, Slack, email | Yes |
| Persist to database | Save chat history | No (partial content should be saved) |
| Send notification | Push notification, toast | Yes |
| Update UI state | Set "done" flag | No (UI should reflect actual state) |
| Trigger downstream workflow | Start next pipeline step | Yes |

The rule: **if the side effect is visible outside the current user's session, guard it.**

## Detection

- **Symptom**: External channels receive partial or garbled content after a user aborts
- **Check**: Grep for `onDone` in SSE handlers and verify each one with external side effects has the guard
- **Prevention**: Add this pattern to the code review checklist for any new SSE handler

## Cross-project relevance

This pattern applies to all three projects:
- **YiVad**: `aiChat.ts` SSE handlers (fixed 2026-07-28)
- **YiPet**: Chat controller SSE handlers (inherits the same pattern via `ApiClient`)
- **YiAi**: Agent SSE streaming (the `_watch_disconnect` pattern is the backend equivalent — ensuring the loop stops when the client disconnects)
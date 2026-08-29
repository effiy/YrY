---
title: "ADR: Knowledge Watcher Deployment"
tags: [adr, yiai, knowledge, watcher, macOS, polling]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-08-21
last_verified: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand why the knowledge watcher uses polling instead of filesystem events"
acceptance_criteria:
  - "decision rationale and implementation details are documented"
related:
  - ../../../engineer/learn/lessons/gotchas/macos-fsevents-silent-drop.md
  - ../../../engineer/learn/projects/yiai/README.md
---

# ADR: Knowledge Watcher Deployment

> **Status**: Accepted (2026-08-03) — implemented via apscheduler polling

## Context

YiAi needs to detect changes to the `YiKnowledge` markdown tree and re-index them into MongoDB + vector store. The natural approach is filesystem events (macOS FSEvents, Linux inotify). However, on this machine, **macOS FSEvents silently drops events**, making file-watching unreliable.

## Decision

**Use apscheduler polling every 5 seconds instead of filesystem events, with incremental index, debounce, failure retry, and monitoring.**

### Implementation details

| Component | Behavior |
|-----------|----------|
| Polling interval | 5 seconds (apscheduler) |
| Change detection | Compare file modification times against last-indexed state |
| Incremental index | Only re-index changed files, not the entire tree |
| Debounce | 2-second debounce to avoid re-indexing files being actively edited |
| Failure retry | Retry failed index operations up to 3 times with exponential backoff |
| Monitoring | Log scan duration, file count, and index errors per cycle |

## Rationale

- FSEvents is unreliable on this specific machine (observed event loss)
- 5-second polling is a reasonable trade-off between responsiveness and CPU usage
- Incremental indexing keeps the cost proportional to changes, not tree size

## Consequences

- New files are discoverable within 5 seconds (not instant)
- CPU usage is proportional to file count (acceptable for current tree size)
- This is a platform-specific workaround — if the machine changes, revisit FSEvents
- The gotcha is documented in `YiKnowledge/engineer/learn/lessons/gotchas/macos-fsevents-silent-drop.md`
---
title: macOS FSEvents Silent Drop — File Watcher Polling Fallback
tags: [gotcha, macos, fsevents, file-watcher, knowledge-base]
category: engineer/learn/lessons/gotchas
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers understand why YiAi's knowledge watcher uses polling instead of FSEvents, and when to apply the same pattern"
acceptance_criteria:
  - "Platform-specific failure mode documented"
  - "Polling fallback implementation described"
  - "Trade-offs between polling interval and CPU usage discussed"
related:
  - ./README.md
  - ../../../../YiAi/CLAUDE.md
---

# macOS FSEvents Silent Drop

> **macOS FSEvents silently drops events on this machine.** YiAi's knowledge watcher uses apscheduler polling every 5 seconds as a fallback.

## The problem

YiAi's knowledge watcher monitors `../YiKnowledge` for file changes (create, update, delete) and syncs them to MongoDB + the RAG vector index. The initial implementation used macOS FSEvents via `watchdog` for real-time file change notifications.

On this specific machine, FSEvents **silently drops events** — files are created or modified on disk, but the watcher never receives the notification. The knowledge base and MongoDB fall out of sync without any error or warning.

**Impact**: Knowledge files added to YiKnowledge would not appear in the RAG index or MongoDB `knowledge_files` collection. The knowledge base appeared empty or stale to all consumers (YiVad, YiPet, RAG queries).

## The fix

Replaced FSEvents with **apscheduler polling** at a 5-second interval:

```python
# domain/knowledge/watcher.py
scheduler.add_job(
    scanner.scan_and_sync,
    'interval',
    seconds=5,
    id='knowledge_watcher'
)
```

The poll loop:
1. Walks the YiKnowledge directory tree
2. Compares file hashes/modtimes against the last known state
3. Syncs changed files to MongoDB (`knowledge_files` collection)
4. Triggers incremental RAG index updates for changed files

## Trade-offs

| Approach | Latency | CPU | Reliability |
|---|---|---|---|
| FSEvents (ideal) | <1s | Near zero | Unreliable on this machine |
| Polling 5s | ≤5s | Low (directory walk of ~1000 files) | Reliable |
| Polling 1s | ≤1s | Moderate | Reliable |
| Polling 30s | ≤30s | Very low | Reliable, but stale |

The 5-second interval was chosen as a balance: fast enough that knowledge changes appear promptly in RAG queries, slow enough that the directory walk doesn't consume meaningful CPU.

## When to apply this pattern

- **File watchers on macOS** — Always provide a polling fallback. FSEvents reliability varies by machine, OS version, and file system.
- **Directory watching in containers** — Docker volume mounts and network file systems often don't support FSEvents/inotify at all.
- **Critical sync paths** — If stale data has user-visible impact, a polling fallback is cheaper than debugging missing events.

## Detection

- **Symptom**: Files exist on disk but don't appear in the application (MongoDB, RAG index, search results)
- **Check**: Compare `ls YiKnowledge/<role>/` against `db.knowledge_files.find({})` count
- **Log**: The watcher logs each sync cycle. If the log shows "0 files synced" but new files exist on disk, the watcher may have missed events.
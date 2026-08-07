---
title: macOS FSEvents silently drops events
aliases: [macos-fsevents-silent-drop, fsevents-unreliable]
tags: [gotcha, macOS, file-monitoring, FSEvents, polling]
category: engineer/lessons
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
tacit: true
roles: [engineer, oncall-sre]
benefit: "same mistake avoided"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./vite-to-rsbuild-migration.md
 - ../../strategies/check-engineering-gotchas.md
---

# macOS FSEvents silently drops events

> **As an** engineer, **I want to** macos fsevents silent drop, **so that** same mistake avoided. 

> On macOS, watchfiles / watchdog based on FSEvents will silently lose events; using apscheduler polling is most stable. 

## Summary

- macOS FSEvents under many users, network drives, APFS snapshots, and specific macOS versions is unstable — events merge, have latency, get dropped. 
- watchfiles docs explicitly warn that macOS cannot be relied on, but developers often assume cross-platform consistency. 
- Solution: use apscheduler 30s polling for knowledge base / docs monitoring; use watchfiles `force_polling=True` for hot reload; for large directory sync use scheduled full sync rather than event-based. 
- YiKnowledge monitoring has already switched from watchfiles to apscheduler 30s polling. 

## Core viewpoints

- **FSEvents is not inotify, and the difference is silent — Linux file watching is real-time and reliable; macOS FSEvents merges, delays, and drops events without raising errors.** The API is designed as best-effort, and the best-effort nature is the danger. A system that depends on FSEvents for correctness (not just performance) cannot distinguish between "no changes" and "the watcher is broken" without an out-of-band liveness check. The watchfiles documentation explicitly warns about this, but developers assume cross-platform consistency because the API surface is identical.

- **Cross-platform projects cannot assume that a consistent API implies consistent behavior.** `watchfiles` and `watchdog` provide a unified Python API, but their underlying implementations — FSEvents on macOS, inotify on Linux, ReadDirectoryChangesW on Windows — have fundamentally different reliability guarantees. The abstraction leaks at the reliability boundary. Every cross-platform project that depends on file watching must test on all three platforms, not just the development platform, and must have a platform-specific fallback strategy.

- **Polling is the correct default for file watching on macOS, not a degraded fallback.** The apscheduler polling solution was implemented in 2 person-days and immediately restored functionality. While event-driven architectures are more elegant, polling provides deterministic reliability at the cost of a small latency trade-off. For file watching on macOS specifically, polling is the correct default strategy. The trade-off — 30 seconds of worst-case latency for guaranteed detection — is almost always the right call for knowledge base scanning, hot reload, and CI change detection.

- **File watching is a critical-path dependency disguised as a convenience feature.** When FSEvents silently drops events, the blast radius includes knowledge base scanning, code review file tree refresh, and hot reload — three features that appear unrelated but share a single point of failure. Critical-path dependencies must be identified and documented in an architecture diagram, not discovered during an incident. Every file-watching consumer must have a liveness check: "has the watcher detected any event in the last N minutes?"

- **OS-specific bugs require OS-specific detection mechanisms deployed to every development machine, not just CI.** The FSEvents silent-drop behavior is specific to certain macOS versions and configurations and may not reproduce on other machines. The detection mechanism — a stale watcher last-event timestamp monitor — must run on every development machine, because the bug may not manifest in CI. OS-specific bugs are the hardest to catch because they do not reproduce in controlled environments. 

## Key information

### Symptoms

When using `watchfiles` (Rust) or `watchdog` (Python) on macOS for file monitoring, **events are silently lost**: 

- File changes, monitoring does not trigger
- Large batch changes trigger only a few events
- After restart, it often works for a few minutes, then fails

watchfiles docs explicitly state macOS FSEvents is unreliable, but developers often assume cross-platform consistency. 

### Root cause

- macOS filesystem events are provided via the FSEvents API
- FSEvents is unstable under some scenarios (many users, network drives, APFS snapshots, specific macOS versions)
- Events can merge, have latency, get dropped
- Unlike Linux inotify, FSEvents does not guarantee real-time

### Impact scope

- File sync tools (such as Rclone, Syncthing on Mac)
- Hot-reload dev servers
- Knowledge base monitoring auto-discovery of new content
- CI file change detection

### Solutions

**Solution 1: Use polling instead (recommended)**

Abandon event-driven, use apscheduler scheduled scanning: 

```python
from apscheduler.schedulers.background import BackgroundScheduler

def scan_and_update():
 files = glob.glob("knowledge/**/*.md", recursive=True)
 for f in files:
 mtime = os.path.getmtime(f)
 if mtime > last_scan_time:
 process(f)

scheduler = BackgroundScheduler()
scheduler.add_job(scan_and_update, 'interval', seconds=30)
scheduler.start()
```

Advantages: stable and reliable, cross-platform consistent, simple implementation. 
Disadvantages: latency (30s polling → worst-case 30s latency) ; CPU usage (small directory impact is small) . 

**Solution 2: watchfiles force-polling mode**

```python
from watchfiles import watch

for changes in watch("./target", force_polling=True):
...
```

Forces the underlying layer to switch to non-FSEvents polling. Performance is acceptable, still uses the watchfiles API. 

**Solution 3: Use the fsevents library directly (not recommended)**

Complex and unstable, does not solve the problem. 

### Type-based decisions

| scenario | recommendation |
|---|---|
| Knowledge base / docs monitoring | apscheduler 30s polling |
| Dev hot reload | watchfiles force_polling |
| Large directory sync | scheduled full sync |
| On Linux | watchfiles / inotify commonly used |

### Similar gotchas

- Windows ReadDirectoryChangesW also has boundary issues (buffer overflow loses events) 
- Network drives (NFS / SMB) events are unreliable
- Container-internal file mounts lose events (Docker for Mac known issue) 

## Action recommendations

1. Cross-platform projects should not assume FSEvents and inotify are equivalent; docs should explicitly mark macOS specifics. 
2. Use apscheduler 30s polling for knowledge base / docs monitoring (YiKnowledge has already landed) . 
3. Use watchfiles `force_polling=True` for dev hot reload. 
4. For large directory sync use scheduled full sync + bulk handling, avoid depending on events. 
5. Add fallback for key features (polling + event dual-track) , run CI on Linux to avoid macOS instability. 
6. Docs sync: scheduled full sync + bulk handling. 

## Anti-patterns

- **Assuming FSEvents and inotify are equivalent** — watchfiles and watchdog provide a consistent API but the underlying OS primitives differ radically. Code that works flawlessly on Linux will silently miss events on macOS, and the failure is invisible because no error is raised.

- **Relying on event-driven monitoring without a polling fallback** — FSEvents does not guarantee delivery, so any feature that depends solely on file-change events will experience silent data loss. Every critical path must have a polling-based fallback (e.g., apscheduler at 30-second intervals).

- **Running CI file-change detection on macOS** — macOS FSEvents instability makes CI pipelines that depend on file-change triggers non-deterministic. Always run file-watching CI jobs on Linux where inotify is reliable.

- **Using watchfiles in its default mode on macOS for production workflows** — the default mode uses FSEvents and will drop events under load, with network drives, or with APFS snapshots. Always use `force_polling=True` on macOS or switch to apscheduler polling.

- **Ignoring the silent nature of FSEvents failures** — when FSEvents drops events, it does not log, warn, or throw. The monitoring system appears healthy while data drifts out of sync, making this one of the most dangerous classes of silent failure in the macOS stack.

## Related

- [./gotcha-vite-to-rsbuild-migration.md](./gotcha-vite-to-rsbuild-migration.md) — Vite to Rsbuild migration where FSEvents impacted HMR reliability
- [./win-yry-vite-to-rsbuild-migration.md](./win-yry-vite-to-rsbuild-migration.md) — Success case where FSEvents fallback (`force_polling`) was used in production
- [./win-yiai-knowledge-watcher.md](./win-yiai-knowledge-watcher.md) — YiKnowledge watcher switched from watchfiles to apscheduler polling due to this gotcha
- [../../architecture-design/sse-streaming.md](../architecture-design/sse-streaming.md) — SSE streaming patterns where file-watching reliability matters

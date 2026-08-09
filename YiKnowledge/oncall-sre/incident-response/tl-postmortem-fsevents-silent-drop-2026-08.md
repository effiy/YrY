---

title: macOS FSEvents Silent Drop
lifecycle: active
status: stable
key: tl_postmortem_fsevents_silent_drop_2026_08
tags:
- incident
- macos
- fsevents
- watcher
incident_date: '2026-08-03'
severity: p2
duration_minutes: 0
detection_method: user report + integration test mock failure
type: summary
category: oncall-sre/incident-response
roles:
- oncall-sre
- tech-lead
benefit: incident handled
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
created: 2026-08-03
updated: 2026-08-07
source: internal
last_verified: 2026-08-07
tacit: false
related:
  - ./dashboard-incident-trends.md
  - ./dashboard-oncall-health.md
  - ./do-a-blast-radius-analysis.md
  - ../README.md
  - ../INDEX.md
---

# Postmortem — macOS FSEvents Silent Event Drop

> **As a** oncall sre, **I want to** tl_postmortem_fsevents_silent_drop_2026_08, **so that** incident handled.

## Summary

- P2 macOS FSEvents bug where watchfiles and watchdog both silently drop file events on this specific Mac, breaking YiKnowledge file scanning, aicr file tree refresh, and YiAi hot reload — three features sharing a single critical-path dependency
- Root cause: FSEvents API is designed as best-effort with no error reporting for dropped events; integration tests used mocks that always delivered events correctly, passing while the real system was broken for months
- Mitigation: switched to apscheduler polling (scan directory every N seconds + diff mtime), implemented in 2 person-days — polling is the correct default on macOS, not a degraded mode
- Best-effort APIs are silently unreliable by design — any system depending on one for correctness needs an out-of-band liveness check (heartbeat file whose modification must be detected within a timeout)
- OS-specific bugs require OS-specific detection mechanisms deployed to every development machine, not just CI, because they don't reproduce in controlled environments

## Incident Summary

- **Date:** 2026-08 (ongoing / not one-time)
- **Severity:** P2
- **Duration:** ongoing (no clear end)
- **Impact:** YiKnowledge file scanning / aicr file tree refresh / YiAi hot reload — all features depending on file watching failed; user had to manually refresh after edits.
- **Detection:** user reported "edit file but knowledge base scan not triggered" + unit test mock verification failure.

## Timeline (UTC)

| Time | Event |
|------|-------|
| Multiple times historically | user reported watcher not working |
| 2026-08 | Root cause identified: watchfiles / watchdog both depend on FSEvents, which silently drops events on this Mac |
| 2026-08 | Mitigation: switched to apscheduler polling (scan directory every N seconds + diff mtime) |

## Root Cause Chain (5-Why)

1. **Why** did the watcher fail? → FSEvents does not emit events.
2. **Why** does it not emit events? → macOS FSEvents has a bug that silently drops events in certain scenarios.
3. **Why** did it impact multiple features? → file watching is core to multiple feature chains (YiKnowledge scan / aicr file tree / YiAi hot reload).
4. **Why** no error? → FSEvents API is designed as best-effort; dropped events do not raise errors.
5. **Why** not caught earlier? → unit tests use mocks and cannot cover real OS events; integration tests missing.

**ROOT CAUSE:** macOS FSEvents silently drops events + integration tests lack real OS event coverage.

## Contributing Factors

- FSEvents API is designed as best-effort.
- watchfiles / watchdog both depend on FSEvents, with no fallback.
- Integration tests use mocks, with no real OS event verification.

## What Went Well

- After diagnosis, switching to apscheduler polling restored functionality immediately.

## What Went Wrong

- Early on, not recognized as an OS-layer bug; misdiagnosed as a code bug.
- No integration test covering real OS events.

## Where We Got Lucky

- apscheduler polling fallback was very cheap (2 person-days).

## Action Items

| # | Action | Owner | Due | Priority |
|---|--------|-------|-----|----------|
| 1 | File-watching class function switched to apscheduler polling fallback (done) | YiAi backend | 2026-08 | P0 |
| 2 | Integration test explicitly asserts "edit file → callback triggered" | YiAi backend | 2026-09-30 | P1 |
| 3 | Monitoring: watcher last event time stale check | YiAi backend | 2026-10-15 | P2 |

## Core viewpoints

- **Best-effort APIs are silently unreliable by design, and the silence is the danger.** FSEvents does not raise errors when it drops events — it simply fails to deliver them. Any system that depends on a best-effort API for correctness (not just performance) needs an out-of-band liveness check: a heartbeat file that is written periodically and whose modification must be detected within a timeout. Without this, the system cannot distinguish between "no changes" and "the watcher is broken."

- **File watching is a critical-path dependency for multiple features, not a convenience.** When FSEvents silently drops events, the blast radius includes knowledge base scanning, code review file tree refresh, and hot reload — three features that appear unrelated but share a single point of failure. Critical-path dependencies should be identified and hardened before they fail, not after.

- **Polling is a legitimate fallback strategy, not an admission of defeat.** The apscheduler polling solution was implemented in 2 person-days and immediately restored functionality. While event-driven architectures are more elegant, polling provides deterministic reliability at the cost of a small latency trade-off. For file watching on macOS specifically, polling is the correct default, not a degraded mode.

- **Integration tests that mock OS-level APIs are testing the mock, not the system.** The unit tests for file watching used mocks that always delivered events correctly. The mock tests passed while the real system was broken. Integration tests must exercise the real OS API surface, or they provide false confidence. The test should write a file, wait for the callback, and assert it was invoked within a timeout.

- **OS-specific bugs require OS-specific detection mechanisms.** This bug is specific to this Mac's FSEvents implementation and may not reproduce on other machines. The detection mechanism (stale watcher last-event timestamp monitoring) must be deployed to every development machine, not just CI. OS-specific bugs are the hardest to catch because they don't reproduce in controlled environments.

## Action recommendations

1. **Deploy an out-of-band liveness check for every best-effort API that the system depends on for correctness.** FSEvents does not raise errors when it drops events. A heartbeat file written periodically, whose modification must be detected within a timeout, is the only way to distinguish "no changes" from "the watcher is broken." Deploy this check on every development machine, not just CI.

2. **Use polling (apscheduler) as the default file-watching strategy on macOS, not an event-driven fallback.** The FSEvents bug is specific to this Mac's implementation and may not reproduce on other machines. Polling provides deterministic reliability at the cost of a small latency trade-off. For file watching on macOS, polling is the correct default, not a degraded mode.

3. **Write integration tests that exercise the real OS API surface, not mocked versions of it.** The unit tests for file watching used mocks that always delivered events correctly. The mock tests passed while the real system was broken for months. Integration tests must write a file, wait for the callback, and assert it was invoked within a timeout -- using the real filesystem.

4. **When a feature that depends on an OS API fails silently, start the investigation at the API boundary, not in the application code.** Multiple rounds of debugging the application code produced no findings because the bug was in the OS layer. The investigation protocol should check the OS API's known failure modes before diving into application logic.

5. **Map the blast radius of every critical-path dependency before it fails.** When FSEvents silently dropped events, the impact spanned knowledge base scanning, code review file tree refresh, and hot reload -- three features that appeared unrelated but shared a single point of failure. Critical-path dependencies should be identified and documented in an architecture diagram, not discovered during an incident.

## Anti-patterns

- **Assuming that because a library is popular (watchfiles, watchdog), it handles edge cases.** Both libraries depend on FSEvents, and both inherit its silent-drop behavior. Library popularity is not a substitute for understanding the underlying OS API's failure modes. Before adopting a file-watching library, test it with the specific OS and filesystem combination used in production.

- **Using mocks for OS-level integration tests.** Mocking `FSEvents` or `inotify` in tests verifies that the callback logic is correct, not that events are actually delivered. The mock test passed while the real system was broken for months. Integration tests for OS-level APIs must exercise the real API, even if it makes the test slower or environment-dependent.

- **Misdiagnosing OS-layer bugs as application code bugs.** The initial investigation assumed a code defect in the watcher logic. Multiple rounds of debugging the application code produced no findings because the bug was in the OS layer. When a feature that depends on an OS API fails silently, the investigation should start at the API boundary, not in the application code.

- **Deploying file-watching without a liveness monitoring check.** Without a stale-event timestamp monitor, the system cannot detect when the watcher has silently stopped working. A simple check — "has the watcher detected any event in the last N minutes?" — would have caught the FSEvents issue immediately and alerted the team before users reported it.

- **Treating the polling fallback as temporary without addressing the root cause.** Switching to polling fixed the immediate symptom, but the underlying question remains: why does FSEvents silently drop events on this Mac? The polling solution should be permanent on macOS, and the investigation into the root cause should continue as a separate track, with findings shared upstream to the watchfiles/watchdog maintainers.

## Related

- [No-lockfile supply chain postmortem](./tl-postmortem-no-lockfile-supply-chain-2026-07.md) — another postmortem with similar 5-Why methodology and platform-level root cause analysis
- [YiAi engineering CLAUDE.md](../../engineer/projects/yiai/engineering/claude.md) — knowledge watcher polling fallback documented in YiAi's architecture
- [Reactive large data and stream backpressure](../../engineer/quality-security/reactive-large-data-and-stream-backpressure.md) — SSE chunk consumption patterns, related to the watcher-to-scan data pipeline
- [Monitoring alert governance](../../engineer/process/monitoring-governance.md) — monitoring liveness checks for the watcher stale-event timestamp
- [Bug-logging protocol](../../engineer/quality-security/bug-logging-protocol.md) — recurring bug pattern #5 (stale computed bindings) shares the same "silent failure" anti-pattern

---
> References: YiKnowledge → (memory: project_macos_fsevents_broken.md) | risk-register
> Blameless principle: ask "how did the system allow this?" not "who caused this?"

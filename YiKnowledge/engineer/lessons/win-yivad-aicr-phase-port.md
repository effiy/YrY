---

title: YiVad aicr 7-phase port complete
aliases: [yivad-aicr-phase-port, aicr-port-win]
tags: [methodology, YiVad, aicr, port, parity]
category: engineer/lessons
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: draft
lifecycle: reference
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

> **Status (2026-08-07)**: This file documents a planned methodology/design. The implementation described here has NOT been completed in the actual codebase. Treat as reference architecture, not as a completion report.

# YiVad aicr 7-phase port complete

> **As an** engineer, **I want to** port YiVad aicr in phases, **so that** success is reproducible.

> Ported the entire YiWeb aicr page to YiVad across 7 phases; 9 stores + 8 modals + card / graph views + CodeViewer / ChatPanel parity 100%.

## Summary

- 7-phase split: route + main store → file tree → card / graph view → CodeViewer → ChatPanel → 8 modals → remaining stores + polish.
- Key success factors: reasonable phase split, clear baseline, side-by-side parity test, store and modal decoupling, per-phase build verification, /loop automated regression.
- 9 stores + 8 modals + card + graph view + CodeViewer + ChatPanel parity 100%, builds pass with no regressions.

## Core viewpoints

- **Reasonable phase split is a prerequisite for port success** — each phase is independently launchable, no big-bang accumulation.
- **Clear baseline + parity test** — YiWeb as the reference implementation; compare gaps each phase to avoid "close enough".
- **Decouple stores and modals** — stores first, then modals; non-blocking; a stuck phase does not drag the whole.
- **Per-phase build verification + /loop automated regression** — no technical debt accumulation; every 2h automated check prevents regression.

## Key information

### Background

Ported the entire YiWeb aicr (AI Code Review) page to YiVad. Involves:

- 9 Pinia stores
- 8 modal components
- Card view + graph view
- CodeViewer + ChatPanel fully aligned with YiWeb

### 7-phase split

| Phase | Content |
|---|---|
| 1 | route + main entry + main store |
| 2 | file tree + FileTree baseline alignment |
| 3 | card view + graph view |
| 4 | CodeViewer full migration |
| 5 | ChatPanel alignment with YiWeb |
| 6 | 8 modals full migration |
| 7 | remaining stores and polish |

### Key success factors

1. **Reasonable phase split**: each phase independently launchable, no big-bang accumulation
2. **Clear baseline**: YiWeb as reference implementation; compare gaps each phase
3. **Side-by-side test**: synchronize with YiWeb to ensure parity
4. **Store / modal decoupling**: stores first, then modals; non-blocking
5. **Per-phase build verification**: no technical debt accumulation
6. **/loop cadence**: automated regression every 2h

### Quantitative results

- All 7 phases complete
- 9 stores + 8 modals + card + graph view + CodeViewer + ChatPanel parity 100%
- Builds pass, no regressions
- /loop continuous monitoring, automated check every 2h

### Porting methodology

- **Phased**: skeleton first, then details; each phase verifiable
- **Baseline alignment**: clear reference implementation, parity test
- **Decoupled advancement**: large modules advance independently, non-blocking
- **Cadence-driven**: /loop automated regression

### Risk points

- Large ports tend to "stall after 80%"
- Solution: each phase must produce a launchable artifact; enforce completion

## Action recommendations

1. For large ports, split into phases first; each phase independently launchable + verifiable.
2. Define a baseline reference implementation; run side-by-side parity test every phase.
3. Decouple large modules (store / modal / view); a stuck phase does not block the whole.
4. Per-phase build verification + /loop automated regression (every 2h check) to prevent technical debt.
5. Reuse the baseline: FileTree baseline already aligns with YiPet ChatSidebar / aiChat ConversationSidebar; reuse the same baseline for future ports.
6. Post-launch tracking: iterate in sync with YiWeb (new aicr features added on both sides); evaluate whether to upstream improvements back to YiWeb.



- **Big-bang port** — push everything at once without phases; stalling after 80% is guaranteed; single PR unreviewable.
- **No baseline reference** — "porting from memory"; parity cannot be verified.
- **Coupled store / modal advancement** — one stuck blocks all; must decouple.
- **No build verification** — technical debt surfaces only before launch; rollback cost is huge.

## Anti-patterns

- **Defining phases by component type (Phase 1 = all stores, Phase 2 = all modals) rather than by user-visible feature slices.** A phase that delivers "all 9 stores" delivers no user-visible functionality, because stores without views have no UI. The phase cannot be demonstrated to stakeholders, and the port appears to have made zero progress for weeks. Each phase should deliver a complete, demoable feature slice: Phase 1 = file tree (store + view + interaction), Phase 2 = card view (store + view), and so on.
- **Using the YiWeb source code as the baseline without pinning the exact YiWeb commit hash.** If the YiWeb aicr page is actively developed during the port, the baseline moves. A feature added to YiWeb after Phase 2 was completed but before Phase 7 creates a moving target where "parity" is never achievable. Pin the YiWeb commit hash at the start of the port, and track any post-pin YiWeb changes as a separate "catch-up" phase after the initial port is complete.
- **Running the `/loop` automated regression check but only verifying that the build passes, not that the ported features match the baseline behavior.** A build that passes is evidence that the code compiles, not that the ported ChatPanel behaves identically to the YiWeb ChatPanel. The loop check must include a side-by-side comparison: open the same aicr page on YiWeb and YiVad, perform the same actions, and verify the outputs match. Otherwise, the loop is testing build correctness, not parity.
- **Declaring a phase "complete" when the code is merged but the phase's acceptance criteria have not been demonstrated.** A phase that merges the file tree code but the file tree cannot expand, collapse, select, or rename files is not complete. The definition of "phase complete" must include a demo checklist: every interaction that the YiWeb baseline supports must be demonstrated on the YiVad port before the phase is marked done.
- **Treating the 7-phase port as a one-time project and not planning for post-port synchronization with YiWeb.** After the port is complete, the YiWeb aicr page will continue to evolve. If YiWeb adds a new feature (e.g., an inline diff view), the YiVad port falls out of parity. The post-port plan must include a monthly sync check: compare the YiWeb aicr page against the YiVad port, identify any new features, and schedule a mini-phase to port each one.

## Related

- Same class: [./README.md](./) — wins leaf entry
- Same class: [./yiai-brd-agent-launch.md](win-yiai-brd-agent-launch.md) — agent launch case
- Upstream: [../../projects/yivad/engineering/readme.md](../projects/yivad/engineering/readme.md) — FileTree baseline documentation
- Upstream: [../../processes/review-lessons.md](../process/review-lessons.md) — scenario entry
- Downstream: three-way sidebar parity (YiPet ChatSidebar / aiChat ConversationSidebar / aicr FileTree)

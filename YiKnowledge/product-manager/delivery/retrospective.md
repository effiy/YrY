---
title: Yi family retrospective instance (2026 week 31)
aliases: [retrospective-sample, retrospective-example, yry-retrospective]
tags: [retrospective, instance, sample, yi-family, week-31]
category: product-manager/delivery
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
last_verified: 2026-08-03
tacit: false
roles: [product-manager, tech-lead]
benefit: "Teams reflect on what worked and what didn't, turning iteration experience into actionable process improvements"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ./retrospective-meeting.md
  - ./weekly-report.md
  - ../../knowledge-curator/templates/retrospective.md
  - ../../engineer/lessons/win-yivad-aicr-phase-port.md
  - ../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md
  - ../../engineer/lessons/gotcha-vite-to-rsbuild-migration.md
  - ../../engineer/lessons/gotcha-react-jsxdev-mismatch.md
---

> **Status (2026-08-07)**: This file is a historical retrospective instance (W31 2026). Several claims in this report do not match the actual codebase state as of 2026-08-07: the aicr 7-phase port was never landed (`src/views/aicr/` + `src/stores/modules/aicr/` absent from master), knowledge 28 leaf views do not exist, and the aicr KnowledgeTree/story/bug pages were never shipped. The aiChat port, sidebar parity, YiPet stack migration, and YiAi RAG/Knowledge domains are real and shipped. Treat this retrospective as a historical snapshot, not a verified completion record.

# Yi family retrospective instance (2026 week 31)

> **As a** product manager, **I want to** retrospective, **so that** meeting effective.

> This file is a filled-in retrospective sample, serving as a run instance of [retrospective-meeting-template.md](./retrospective-meeting.md) and [retrospective-template.md](../../knowledge-curator/templates/retrospective.md). Run once after each domain landing or cross-project bug fix. This retrospective corresponds to the end of the 2026 week 31 iteration.

## Summary

This week's iteration had high-density landings: YiAi dual domains (RAG + Knowledge) + YiVad 4 major pages (knowledge leaf / aicr KnowledgeTree / story / bug) + YiPet stack migration (React 18 + Biome) + YiPett shortcut + chat box. 3 gotchas captured (macOS FSEvents / Vite→Rsbuild migration / React 18 jsxDEV mismatch). 1 win captured (YiVad aicr 7-phase port completed). **Keep**: contract-first across projects + dual-world boundary demo. **Drop**: cross-project SSE `onDone` auto-forward without guard. **Try**: introduce lockfile in YiAi + introduce Vitest in YiVad.

## Core viewpoints (retrospective output)

- **Contract-first is effective** — This week the `filter` / `target_file` field name pitfalls had no new violations; once the YiAi CLAUDE.md contract table is registered, callers write code per the contract instead of guessing field names.
- **Dual-world boundary demo is effective** — YiPet newcomer dual-world boundary relies on demo (ISOLATED calls `chrome.runtime.*`, MAIN calls page globals); documentation descriptions cannot replace a hands-on.
- **Cross-project SSE half-sent outbound is closed** — After the 2026-07-28 fix in `aicr/chat.ts`, `onDone` guards `!aborted && !error` before auto-forwarding to WeCom; aligned with the `aiChat.ts` port pattern.
- **Supply chain hardening gap is large** — YiAi has no lockfile, no min-release-age; Pi Agent Harness already provides a mature template; we will borrow it starting next week.
- **Test infrastructure gap is large** — YiAi has no `pytest`, YiVad has no Vitest; this week's regression relied on manual testing; must introduce next week.

## Key information

### Keep (continue doing)

| Item | Why keep |
|---|---|
| Cross-project contract-first (register in CLAUDE.md contract table before writing code) | No new violations for `filter` / `target_file` this week; contract table registration works |
| Dual-world boundary demo (YiPet newcomers must see it) | Documentation cannot replace hands-on; after the demo the dual-world concept becomes immediately clear |
| Domain-driven iteration (each cadence focuses on one domain / view domain / component group) | This week YiAi dual domains + YiVad 4 pages + YiPet stack migration ran in parallel without confusion |
| `lessons/gotchas/` capture (every engineering pitfall must land as markdown) | 3 gotchas captured this week; in the AI era structured knowledge will not be lost |
| Monthly OSS tracking (llama_index + Pi Agent Harness) | Two tracking entries landed; monthly scan of release notes for maintenance |

### Drop (stop doing)

| Item | Why drop |
|---|---|
| Cross-project SSE `onDone` auto-forward to WeCom without guard | Half-sent messages bother users; closed by the 2026-07-28 fix |
| Fake tests / lint (YiAi currently has none) | Documentation or commits pretending otherwise will mislead; must either truly introduce or truly be absent next week |
| Cross-project contract changes only on the backend without notifying frontend | Caller field names wrong; must align monthly |
| Retrospective only covers success, not failure | Failure lessons are more valuable; must land in `lessons/failures/` |
| Daily / weekly reports without blockers and help requests | Risks smolder; must write help items |

### Try (try doing)

| Item | Landing point | Owner | Time window |
|---|---|---|---|
| YiAi introduces `uv` + lockfile + `pip-audit` | Borrow pi supply chain hardening checklist | YiAi main owner | Next week |
| YiAi introduces `pytest` + `httpx` integration tests | RPC contract + `_build_filter` boundary priority | YiAi main owner | Next 2 weeks |
| YiVad introduces Vitest | Composable + store priority | YiVad main owner | Next week |
| YiVad adds "Ask RAG about this leaf" button | Call `/rag` with `scope=category/leaf/` | YiVad main owner | Next week |
| YiPet adds `RagService` + `KnowledgeService` | YiAi endpoints ready; `ApiClient` already supports SSE | YiPet main owner | Next 2 weeks |
| Cross-project shared client design meeting (YiVad + YiPet) | 1 hour; api-client base class shared | 1 person each side | Next week |

### Captured outputs (new `lessons/` this week)

| Type | File | Summary |
|---|---|---|
| win | [yivad-aicr-phase-port.md](../../engineer/lessons/win-yivad-aicr-phase-port.md) | YiVad aicr 7-phase port complete: 9 stores + 8 modals + cards/graph + CodeViewer/ChatPanel parity |
| win | [yiai-brd-agent-launch.md](../../engineer/lessons/win-yiai-brd-agent-launch.md) | YiAi BRD agent launch |
| gotcha | [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) | macOS FSEvents silently drops events; watchfiles & watchdog both affected; use apscheduler polling |
| gotcha | [vite-to-rsbuild-migration.md](../../engineer/lessons/gotcha-vite-to-rsbuild-migration.md) | Vite→Rsbuild migration pitfalls; env prefix `RSBUILD_ENV_*`; svg-sprite + views-glob custom plugin |
| gotcha | [react-jsxdev-mismatch.md](../../engineer/lessons/gotcha-react-jsxdev-mismatch.md) | React 18 dev plugin + production NODE_ENV define = `jsxDEV is not a function`; chat bundle dev script `--mode production` |

### Key event timeline

| Date | Event |
|---|---|
| 2026-07-27 | YiVad aiChat port (from YiWeb sessionChat) |
| 2026-07-27 | YiVad aicr 7-phase port complete |
| 2026-07-27 | YiPet YiPett shortcut + chat box port |
| 2026-07-28 | YiAi `data/database.py` adds `find_many` / `delete_one` |
| 2026-07-28 | YiAi `data/repository.py` `_handle_range_or_list_filter` fix |
| 2026-07-28 | YiPet stack migration: React 15 + Bootstrap → React 18.3 + Ant Design 5.21 |
| 2026-07-28 | YiPet chat.js jsxDEV mismatch fix |
| 2026-07-28 | YiVad Vite→Rsbuild migration |
| 2026-07-28 | YiVad `fileService` fix: `path` → `target_file` |
| 2026-07-28 | YiVad `aicr/chat.ts` `onDone` guard fix |
| 2026-07-29 | YiVad sidebar parity (ChatSidebar + aiChat + aicr FileTree aligned) |
| 2026-07-30 | RSS body offloaded to YiKnowledge markdown |
| 2026-07-30 | YiKnowledge content refresh (11 summary/template files to 2026) |
| 2026-07-31 | YiAi RAG + Knowledge dual-domain landing |
| 2026-07-31 | YiVad knowledge 28 leaf views + 56 literal routes |
| 2026-07-31 | YiVad aicr KnowledgeTree + story + bug three pages |
| 2026-08-03 | YiKnowledge directory rename (`_lifecycle/` → `lifecycle/` etc.) + architecture overview + OSS tracking + functional modules + dev standards + project management + weekly report / retrospective instance |

## Action recommendations

1. **Before next Monday** — Each project owner confirms the Try items' owners and time windows; no empty TBD.
2. **Next Friday weekly meeting** — Walk through Try item progress; blockers go into `weekly-report-sample.md` blocker section.
3. **Next retrospective** — Run a mini retrospective after each Try item lands; results land in `lessons/`.
4. **Cross-project SSE `onDone` guard diffusion** — YiPet chat controller also follows this pattern (guard `!aborted && !error` before persisting + auto-forward).
5. **Supply chain hardening kickoff** — YiAi main owner borrows pi checklist next week to land `uv` + `pip-audit`.
6. **Test infrastructure kickoff** — YiAi + YiVad each introduce `pytest` + Vitest next week; prioritize covering cross-project contract boundaries.

## Anti-patterns / common misuses (observed this week)

- **Cross-project SSE `onDone` not guarded** — Half-sent messages outbound; closed, diffuse to YiPet.
- **Guessing field names (not reading contract table)** — Callers guess `query` / `path`; mitigated via documentation + monthly alignment.
- **Cross-project contract changed only on backend without notifying frontend** — Callers discover field name change a week later; mitigated by monthly alignment scanning CLAUDE.md contract table.
- **Retrospective only covers success, not failure** — Failure lessons are more valuable; mandate landing in `lessons/failures/`.
- **Assuming tests / lint exist** — Documentation or commits pretending otherwise will mislead; either truly introduce or truly be absent; must be clear next week.

## Related

- [retrospective meeting template](./retrospective-meeting.md) · [retrospective template](../../knowledge-curator/templates/retrospective.md)
- [weekly report instance](./weekly-report.md) (this week's report)
- [YiAi project management](../projects/yiai/project-management.md) · [YiVad project management](../projects/yivad/project-management.md) · [YiPet project management](../projects/yipet/project-management.md)
- [lessons/wins/](../../engineer/lessons) · [lessons/failures/](../../engineer/lessons) · [lessons/gotchas/](../../engineer/lessons)

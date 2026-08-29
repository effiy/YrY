---
title: lessons/ MOC
aliases: [lessons-moc, lessons-index]
tags: [MOC, lessons, retrospective, wins, failures, gotchas, bugs]
category: engineer/learn/lessons
created: 2026-08-03
updated: 2026-08-26
last_verified: 2026-08-26
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [engineer]
benefit: "Navigate lessons learned by category with file-level detail"
acceptance_criteria:
  - "all entries in the index map to existing files"
  - "entries are grouped by logical category"
  - "cross-references to related gotchas and project bugs"
related:
  - ./README.md
  - ../INDEX.md
  - ../../INDEX.md
  - ../../run/check-engineering-gotchas.md
  - ../../run/review-lessons.md
  - ../../../leader/risk/write-a-postmortem.md
  - ../../../projects/
---

# lessons/ — Lessons Learned

> Field notes from real implementation experience. Wins to replicate, failures to learn from, gotchas to avoid, bugs to fix.

## Wins (成功案例)

Patterns and approaches that worked well — replicate these.

| File | Description |
|---|---|
| [wins/yipet-cross-project-hub.md](./wins/yipet-cross-project-hub.md) | YiPet 作为跨项目桥梁连接 YiVad |
| [wins/yivad-agent-mode.md](./wins/yivad-agent-mode.md) | YiVad Agent 模式成功落地 |

## Failures (失败复盘)

Things that went wrong — learn from these.

| File | Description |
|---|---|
| [failures/yivad-aicr-port-hallucination.md](./failures/yivad-aicr-port-hallucination.md) | AiCR 移植中的幻觉问题 |

## Gotchas (陷阱与注意事项)

Subtle pitfalls that caused real bugs. **Hard requirement**: add within 24h of hitting them.

| File | Description | Related bug |
|---|---|---|
| [gotchas/rpc-parameter-name-mismatch.md](./gotchas/rpc-parameter-name-mismatch.md) | RPC 参数名不匹配导致后端静默忽略 | [protable-search-param-mismatch](../../../projects/yivad/bugs/2026-08-21/data/protable-search-param-mismatch.md) |
| [gotchas/sse-ondone-guard.md](./gotchas/sse-ondone-guard.md) | SSE 流 onDone 回调守卫缺失 | — |
| [gotchas/macos-fsevents-silent-drop.md](./gotchas/macos-fsevents-silent-drop.md) | macOS FSEvents 静默丢弃事件 | — |
| [gotchas/yipet-jsxdev-production-mode.md](./gotchas/yipet-jsxdev-production-mode.md) | YiPet JSX Dev 生产模式问题 | — |

## Bugs (缺陷分析)

Detailed bug analyses with root cause and fix.

| File | Description |
|---|---|
| [bugs/bug_topicdetail_meta_validation_20260801.md](./bugs/bug_topicdetail_meta_validation_20260801.md) | TopicDetail 元数据校验缺陷 |

## Cross-references

### Related knowledge areas
- [../../run/check-engineering-gotchas.md](../../run/check-engineering-gotchas.md) — Scenario entry: engineering gotchas checklist
- [../../run/review-lessons.md](../../run/review-lessons.md) — Scenario entry: retrospective and lessons review
- [../../../leader/risk/write-a-postmortem.md](../../../leader/risk/write-a-postmortem.md) — Postmortem writing methodology
- [../../../srer/incident-response/respond-to-an-incident.md](../../../srer/incident-response/respond-to-an-incident.md) — Incident response procedure

### Project bug trackers
- [../../../projects/yivad/bugs/](../../../projects/yivad/bugs/) — YiVad bug reports
- [../../../projects/yiai/bugs/](../../../projects/yiai/bugs/) — YiAi bug reports

### Navigation
- [../INDEX.md](../INDEX.md) — Learn phase index
- [../../INDEX.md](../../INDEX.md) — Engineer role index
- [../../../INDEX.md](../../../INDEX.md) — Knowledge base top-level index
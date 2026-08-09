---
title: lessons/ MOC
aliases: [lessons-moc, lessons-index]
tags: [MOC, lessons, retrospective]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [engineer]
benefit: "INDEX outcome clear"
acceptance_criteria:
  - "all entries in the index map to existing files"
  - "entries are grouped by logical category or domain"
  - "one-liner descriptions are specific enough to disambiguate
related:
  - ../process/check-engineering-gotchas.md
  - ../process/review-lessons.md
---

# lessons/ MOC — Lessons Learned

> **As an** engineer, **I want to** INDEX, **so that** INDEX outcome clear. 

> PARA: Areas. Success cases, failure retrospectives, engineering gotchas three leaf total index. 

## Leaf overview

| Leaf | Content | file count | state |
|---|---|---|---|
| [wins/](.) | Success cases | 2 | active |
| [failures/](.) | Failure cases + bugs/ sub-category | 5 | active |
| [gotchas/](.) | Gotchas / notes | 3 | active |

## Full leaf table

| path | Title | type | lifecycle | updated |
|---|---|---|---|---|
| [wins/yivad-aicr-phase-port.md](win-yivad-aicr-phase-port.md) | YiVad aicr 7-phase port methodology (STALE — not landed; reference architecture) | design | reference | 2026-08-07 |
| [wins/yiai-brd-agent-launch.md](win-yiai-brd-agent-launch.md) | YiAi BRD agent launch | summary | active | 2026-08-03 |
| [failures/ai-product-launch-lessons-summary.md](failure-ai-product-launch-lessons.md) | AI product launch failure cases and lessons | summary | active | 2026-08-03 |
| [failures/incident-postmortem-summary.md](failure-incident-postmortem.md) | Incident retrospective summary | summary | active | 2026-08-03 |
| [failures/incident-postmortem-template.md](failure-incident-postmortem.md) | Incident retrospective template | template | reference | 2026-08-03 |
| [failures/bugs/bug-metaschemas-sed-deletion.md](bug-bug-metaschemas-sed-deletion.md) | sed chain operation overwrote metaColumns array declaration | summary | active | 2026-08-03 |
| [failures/bugs/bug-topicdetail-meta-validation.md](bug-bug-topicdetail-meta-validation.md) | TopicDetailPage form model and validation path out of sync | summary | active | 2026-08-03 |
| [gotchas/macos-fsevents-silent-drop.md](gotcha-macos-fsevents-silent-drop.md) | macOS FSEvents silently drops events | summary | active | 2026-08-03 |
| [gotchas/vite-to-rsbuild-migration.md](gotcha-vite-to-rsbuild-migration.md) | Vite -> Rsbuild migration gotchas | summary | active | 2026-08-03 |
| [gotchas/react-jsxdev-mismatch.md](gotcha-react-jsxdev-mismatch.md) | React 18 + jsxDEV mismatch | summary | active | 2026-08-03 |
| [gotchas/air-gap-first-boot-surprise.md](gotcha-air-gap-first-boot-surprise.md) | Air-gap first boot missing cert/NTP/secrets | summary | active | 2026-08-05 |
| [gotchas/discovery-three-whys-skipped.md](gotcha-discovery-three-whys-skipped.md) | Discovery skipped Three Whys leading to Delta misjudgment | summary | active | 2026-08-05 |
| [gotchas/adk-eval-drift-between-local-and-runtime.md](gotcha-adk-eval-drift-between-local-and-runtime.md) | ADK local vs Agent Runtime eval drift | summary | active | 2026-08-05 |
| [gotchas/agents-cli-alpha-instability.md](gotcha-agents-cli-alpha-instability.md) | Agents CLI Alpha breaking changes | summary | active | 2026-08-05 |
| [failures/fde-day-two-without-internal-owner.md](failure-fde-day-two-without-internal-owner.md) | FDE exit without internal owner means Day 2 certain death | summary | active | 2026-08-05 |
| [failures/enterprise-rag-pure-semantic-fails-on-nomenclature.md](failure-enterprise-rag-pure-semantic-fails-on-nomenclature.md) | Enterprise RAG pure semantic recall collapses on terminology | summary | active | 2026-08-05 |
| [failures/air-gapped-pipeline-broke-without-sneakernet.md](failure-air-gapped-pipeline-broke-without-sneakernet.md) | Air-gapped Day 1 without sneakernet means pipeline collapse | summary | active | 2026-08-05 |

## Frequently referenced Top

- [gotchas/macos-fsevents-silent-drop.md](gotcha-macos-fsevents-silent-drop.md)
- [gotchas/vite-to-rsbuild-migration.md](gotcha-vite-to-rsbuild-migration.md)
- [failures/incident-postmortem-template.md](failure-incident-postmortem.md)
- [failures/ai-product-launch-lessons-summary.md](failure-ai-product-launch-lessons.md)
- [wins/yiai-brd-agent-launch.md](win-yiai-brd-agent-launch.md)

## Cross-category exits

- [../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md)
- [../processes/review-lessons.md](../process/review-lessons.md)
- [../processes/incident-response.md](../process/incident-response.md) — Incident process
- [../../product-manager/delivery/retrospective-meeting.md](../../product-manager/delivery/retrospective-meeting.md) — Retrospective meeting

## Submission process

Hit a new pitfall -> within 24h write a gotcha -> frontmatter `lifecycle: active` + `tacit: true` -> link to [../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md). 

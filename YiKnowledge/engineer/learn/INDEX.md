---
title: "Learn phase index"
tags: [index, learn, lessons, projects, wins, failures, gotchas]
category: engineer/learn
created: 2026-08-26
updated: 2026-08-26
last_verified: 2026-08-26
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Navigate lessons learned and project-specific docs from a single index"
acceptance_criteria:
  - "lessons/ and projects/ subdirectories listed with file counts"
  - "Cross-references to related phases"
related:
  - ./README.md
  - ../INDEX.md
  - ../../INDEX.md
  - ../build/
  - ../ship/
  - ../run/
---

# Learn — Phase Index

> **Pipeline phase**: LEARN — Capture what worked and what didn't. For the build phase → [../build/](../build/). For shipping → [../ship/](../ship/).

## Subdirectories

| Phase | Domain | Content | Index |
|---|---|---|---|
| LESSONS | [lessons/](./lessons/) | Wins, failures, gotchas, bugs from real projects | [INDEX](./lessons/INDEX.md) |
| PROJECTS | [projects/](./projects/) | Per-project engineering docs (architecture, dev standards, stories) | [INDEX](./projects/INDEX.md) |

## Lessons at a glance

| Category | Description | Key files |
|---|---|---|
| [lessons/wins/](./lessons/wins/) | Success patterns to replicate | yipet-cross-project-hub, yivad-agent-mode |
| [lessons/failures/](./lessons/failures/) | Failures and retrospectives | yivad-aicr-port-hallucination |
| [lessons/gotchas/](./lessons/gotchas/) | Pitfalls to avoid | rpc-parameter-name-mismatch, sse-ondone-guard, macos-fsevents-silent-drop |
| [projects/yivad/bugs/](../../projects/yivad/bugs/) | Bug analyses | bug-topicdetail-meta-validation-20260801, bug-project-i18n-title-not-displayed-20260903 |

## Projects at a glance

| Project | Description | Key docs |
|---|---|---|
| [projects/yivad/](./projects/yivad/) | Vue 3.5 管理后台 | [architecture](./projects/yivad/架构设计.md), [dev-standards](./projects/yivad/开发规范.md), [functional-modules](./projects/yivad/功能模块.md) |
| [projects/yiai/](./projects/yiai/) | FastAPI 后端 | [architecture](./projects/yiai/架构设计.md), [dev-standards](./projects/yiai/开发规范.md), [functional-modules](./projects/yiai/功能模块.md) |
| [projects/yipet/](./projects/yipet/) | Chrome MV3 扩展 | [architecture](./projects/yipet/架构设计.md), [dev-standards](./projects/yipet/开发规范.md), [functional-modules](./projects/yipet/功能模块.md) |

## Cross-references

- [../build/](../build/) — Architecture and design patterns (BUILD phase)
- [../ship/](../ship/) — Quality, security, data, reliability (SHIP phase)
- [../run/](../run/) — Team workflows and onboarding (RUN phase)
- [../../leader/risk/write-a-postmortem.md](../../leader/risk/write-a-postmortem.md) — Postmortem methodology
- [../../projects/](../../projects/) — Project operational artifacts (bugs, issues, demos)
- [../../INDEX.md](../../INDEX.md) — Knowledge base top-level index
---
title: Project Knowledge Hub
tags: [projects, navigation, hub, yivad, yiai, yipet, yiknowledge]
category: projects
created: 2026-08-26
updated: 2026-08-26
last_verified: 2026-08-26
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, producter]
benefit: "Navigate all 4 project-specific knowledge areas from a single hub"
acceptance_criteria:
  - "All 4 projects have README links"
  - "Each project's subdirectories are listed"
  - "Cross-references to engineer/learn/projects/ are present"
related:
  - ./INDEX.md
  - ../INDEX.md
  - ../README.md
  - ../engineer/learn/projects/
---

# Project Knowledge Hub

> 4 projects, each with bugs, docs, issues, and demos. Project-specific knowledge lives here; cross-project patterns live in [engineer/](../engineer/).

## Projects

| Project | Description | Docs | Bugs | Issues | Demos |
|---|---|---|---|---|---|
| [YiVad](./yivad/) | Vue 3.5 管理后台 | [docs/](./yivad/docs/) | [bugs/](./yivad/bugs/) | [issues/](./yivad/issues/) | [demos/](./yivad/demos/) |
| [YiAi](./yiai/) | FastAPI 后端 | [docs/](./yiai/docs/) | [bugs/](./yiai/bugs/) | [issues/](./yiai/issues/) | [demos/](./yiai/demos/) |
| [YiPet](./yipet/) | Chrome MV3 扩展 | [docs/](./yipet/docs/) | — | [issues/](./yipet/issues/) | [demos/](./yipet/demos/) |
| [YiKnowledge](./yiknowledge/) | 知识库 | [docs/](./yiknowledge/docs/) | — | [issues/](./yiknowledge/issues/) | [demos/](./yiknowledge/demos/) |

## Project descriptions

| Project | Stack | Role |
|---|---|---|
| **YiVad** | Vue 3.5 + Rsbuild + Pinia | Admin dashboard, ProTable-driven, dynamic routing, button-level permissions |
| **YiAi** | FastAPI + MongoDB + Ollama | AI chat, file management, RAG, RSS aggregation, agent loop |
| **YiPet** | React 18 + Chrome MV3 | Browser extension, multi-role chat, knowledge grounding |
| **YiKnowledge** | Markdown + Frontmatter | Knowledge base, RAG data source, 7 role directories |

## Relationship to engineer/learn/projects/

The [engineer/learn/projects/](../engineer/learn/projects/) directory contains **engineering-focused** project documentation (architecture, dev standards, functional modules, stories). This `projects/` directory contains **operational** project artifacts (bugs, issues, demos, reference docs).

| Content type | Lives in |
|---|---|
| Architecture docs, dev standards, stories | [engineer/learn/projects/](../engineer/learn/projects/) |
| Bug reports, issue tracking, demos, reference docs | `projects/<project>/` |

## Navigation

- [INDEX.md](./INDEX.md) — Full file listing for all projects
- [../INDEX.md](../INDEX.md) — Knowledge base top-level index
- [../engineer/learn/projects/](../engineer/learn/projects/) — Engineering project documentation
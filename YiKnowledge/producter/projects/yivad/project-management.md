---
title: YiVad Project Management
tags: [yivad, project-management, producter]
category: producter/projects/yivad
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "Project management context for YiVad: iteration cadence, deliverables, key decisions"
related:
  - ../../engineer/learn/projects/yivad/README.md
  - ../../leader/decisions/yivad/
---

# YiVad Project Management

> **As a** producter/engineer, **I want to** understand YiVad project management context, **so that** I can coordinate cross-project work.

## Current primary owner

Chengliang Yi (YiVad frontend, aiChat, agent mode, knowledge features)

## Iteration cadence

- Feature development: continuous, no fixed sprints
- UI component extraction: ongoing (componentization axis)
- Knowledge base: updated with each significant change

## Deliverables

| Deliverable | Status | Last Updated |
|-------------|--------|-------------|
| Core Admin Dashboard | Shipped | 2026-07-27 |
| aiChat Port (from YiWeb) | Shipped | 2026-07-27 |
| Vite → Rsbuild Migration | Shipped | 2026-07-28 |
| Knowledge + RAG Features | Shipped | 2026-07-31 |
| Agent Mode (pi Loop) | Shipped | 2026-08-08 |
| Vitest Introduction | Planned | 2026-08-21 |

## Key decisions

- ProTable is the canonical table pattern — no raw `el-table`
- `v-auth` directive for button-level permissions — no inline `v-if`
- AiCR functionality subsumed into aiChat components
- Vite → Rsbuild migration with `RSBUILD_ENV_*` prefix

## Cross-project links

- **YiAi**: Consumed for chat, data, files, knowledge, RAG, agent
- **YiPet**: Cross-project bridge (seed YiVad sessions from YiPet)
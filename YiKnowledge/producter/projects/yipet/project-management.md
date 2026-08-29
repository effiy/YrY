---
title: YiPet Project Management
tags: [yipet, project-management, producter]
category: producter/projects/yipet
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "Project management context for YiPet: iteration cadence, deliverables, key decisions"
related:
  - ../../engineer/learn/projects/yipet/README.md
  - ../../leader/decisions/yipet/
---

# YiPet Project Management

> **As a** producter/engineer, **I want to** understand YiPet project management context, **so that** I can coordinate cross-project work.

## Current primary owner

Chengliang Yi (YiPet extension, chat window, API layer, CDN catalog)

## Iteration cadence

- Feature development: continuous, no fixed sprints
- Component extraction: ongoing (componentization axis)
- API layer: stable, changes driven by YiAi backend changes

## Deliverables

| Deliverable | Status | Last Updated |
|-------------|--------|-------------|
| Core MV3 Extension | Shipped | 2026-07-27 |
| Stack Migration (React 15→18, Bootstrap→Ant Design 5) | Shipped | 2026-07-28 |
| Biome Adoption (ESLint+Prettier→Biome) | Shipped | 2026-07-28 |
| Chat Box Port (from YiPett) | Shipped | 2026-07-27 |
| Knowledge + RAG Integration | Shipped | 2026-08-05 |
| Cross-Project Hub (bug reporting, bridges, navigation) | Shipped | 2026-08-05 |
| Session Features (export, branch, summarize, auto-title) | Shipped | 2026-08-05 |
| Agent Mode (port from YiVad) | Planned | — |

## Key decisions

- Dual-world boundary (ISOLATED + MAIN) — bootstrap self-injection pattern
- 4-tier API layer (client → endpoints → types → services)
- CDN resource injection from local `chrome-extension://` URLs (MV3 CSP)
- AiCR functionality integrated into chat window

## Cross-project links

- **YiAi**: Consumed for chat, sessions, data, knowledge, RAG
- **YiVad**: Cross-project bridge (seed YiVad sessions, bug reporting, navigation)
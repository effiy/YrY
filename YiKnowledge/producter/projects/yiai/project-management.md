---
title: YiAi Project Management
tags: [yiai, project-management, producter]
category: producter/projects/yiai
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "Project management context for YiAi: iteration cadence, deliverables, onboarding, handoff"
related:
  - ../../engineer/learn/projects/yiai/README.md
  - ../../leader/decisions/yiai/
---

# YiAi Project Management

> **As a** producter/engineer, **I want to** understand YiAi project management context, **so that** I can coordinate cross-project work.

## Current primary owner

Chengliang Yi (YiAi backend, agent loop, RAG, knowledge watcher)

## Iteration cadence

- Feature development: continuous, no fixed sprints
- ADRs: written at decision points, reviewed quarterly
- Knowledge base: updated with each significant change

## Deliverables

| Deliverable | Status | Last Updated |
|-------------|--------|-------------|
| AI Chat + Agent Loop | Shipped | 2026-08-08 |
| RAG Module | Shipped | 2026-07-31 |
| Knowledge Watcher | Shipped | 2026-07-31 |
| BRD Agent | In Progress | 2026-08-03 |
| Multi-Provider LLM | Planned | 2026-08-03 |
| Pytest Coverage | In Progress | 2026-08-21 |

## Onboarding

See [YiAi onboarding](../../engineer/run/onboarding/yiai-onboarding.md)

## Cross-project links

- **YiVad**: Consumes YiAi for chat, data, files, knowledge, RAG, agent
- **YiPet**: Consumes YiAi for chat, sessions, data, knowledge, RAG
- **YiKnowledge**: Scanned by YiAi's knowledge watcher into MongoDB + vector index
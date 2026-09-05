---
title: YiAi Engineering — INDEX
tags: [index, yiai, navigation]
category: engineer/learn/projects/yiai
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Navigate YiAi project documentation"
related:
  - ./README.md
  - ../../INDEX.md
---

# YiAi — Project Index

> FastAPI backend. AI chat, RAG, knowledge base, agent loop. Single source of truth for all Yi family data.

## Documents

| Document | Purpose |
|---|---|
| [README.md](./README.md) | Project card — architecture, core viewpoints, anti-patterns, recent changes |
| [architecture.md](./架构设计.md) | Architecture overview — tech stack, module boundary, data flow, degradation |
| [dev-standards.md](./开发规范.md) | Development standards — naming, layering, RPC field contract, SSE, config |
| [functional-modules.md](./功能模块.md) | Module inventory — 10 domains, 7 services, 13 routes, data, shared, models |

## Stories

| Story | Domain |
|---|---|
| [AI Chat Function](./stories/ai-chat-function/) | Chat — send message, conversation history |
| [Overseas After-Sales AI BRD Agent](./stories/overseas-after-sales-ai-brd-agent/) | BRD — draft generation, multilingual, approval flow |
| [YiAi Routes Module Analysis](./stories/yiai-routes-module-analysis/story.md) | Routes analysis |
| [User Import and Export](./stories/user-import-and-export/story.md) | User management |

## Decisions (ADRs)

| ADR | Status |
|---|---|
| [BRD Agent Launch](../../../leader/decisions/yiai/brd-agent-launch.md) | In Progress |
| [LLM Multi-Provider Rollout](../../../leader/decisions/yiai/llm-multi-provider-rollout.md) | Implemented |
| [RAG Evaluation Infra](../../../leader/decisions/yiai/rag-evaluation-infra.md) | Planned |
| [Pytest Introduction](../../../leader/decisions/yiai/pytest-introduction.md) | Planned |
| [Knowledge Watcher Deployment](../../../leader/decisions/yiai/knowledge-watcher-deployment.md) | Implemented |
| [Agent Mode — Generic Data Tools](../../../leader/decisions/yiai/agent-mode-generic-data-tools.md) | Implemented |

## Cross-project

- [YiAi CLAUDE.md](../../../../YiAi/CLAUDE.md) — Live project profile
- [RPC Protocol](../../build/cross-project-rpc-protocol.md) — RPC envelope, parameter contracts, bug patterns
- [Product Management](../../../producter/projects/yiai/project-management.md) — Iteration cadence, deliverables
- [Onboarding](../../run/onboarding/yiai/onboarding.md) — New hire setup
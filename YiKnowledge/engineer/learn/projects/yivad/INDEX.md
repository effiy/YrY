---
title: YiVad Engineering — INDEX
tags: [index, yivad, navigation]
category: engineer/learn/projects/yivad
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Navigate YiVad project documentation"
related:
  - ./README.md
  - ../../INDEX.md
---

# YiVad — Project Index

> Vue 3.5 admin dashboard. ProTable-driven, dynamic routing, button-level permissions.

## Documents

| Document | Purpose |
|---|---|
| [README.md](./README.md) | Project card — architecture, data flow, domain language, anti-patterns, recent changes |
| [architecture.md](./架构设计.md) | Architecture overview — tech stack, layer boundaries, degradation strategy |
| [dev-standards.md](./开发规范.md) | Development standards — coding conventions, ProTable, SSE, RPC field contract |
| [functional-modules.md](./功能模块.md) | Module inventory — 20+ view domains, 18 API modules, 11 stores |
| [pipeline-closed-loop.md](./流水线闭环.md) | Requirements-to-deployment page flow, data models, stage mapping |

## Stories

| Story | Domain |
|---|---|
| [analysis-files-prompt-generation-and-aicr-linkage](./stories/analysis-files-prompt-generation-and-aicr-linkage/story.md) | Analysis files + AiCR |
| [ai-code-review-aicr](./stories/ai-code-review-aicr/story.md) | AI Code Review |
| [story-board-page](./stories/story-board-page/story.md) | Story Board |

## Decisions (ADRs)

| ADR | Status |
|---|---|
| [AiCR Phase Port](../../../leader/decisions/yivad/aicr-phase-port.md) | Implemented |
| [Vitest Introduction](../../../leader/decisions/yivad/vitest-introduction.md) | Planned |
| [Vite to Rsbuild Migration](../../../leader/decisions/yivad/vite-to-rsbuild-migration.md) | Implemented |
| [Agent Mode (pi Loop)](../../../leader/decisions/yivad/agent-mode-pi-loop.md) | Implemented |

## Cross-project

- [YiVad CLAUDE.md](../../../../YiVad/CLAUDE.md) — Live project profile
- [RPC Protocol](../../build/cross-project-rpc-protocol.md) — RPC envelope, parameter contracts, bug patterns
- [Product Management](../../../producter/projects/yivad/project-management.md) — Iteration cadence, deliverables
- [Onboarding](../../run/onboarding/yivad/onboarding.md) — New hire setup
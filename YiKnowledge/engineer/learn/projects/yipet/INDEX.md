---
title: YiPet Engineering — INDEX
tags: [index, yipet, navigation]
category: engineer/learn/projects/yipet
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Navigate YiPet project documentation"
related:
  - ./README.md
  - ../../INDEX.md
---

# YiPet — Project Index

> Chrome MV3 extension. Interactive pet companion, multi-role AI chat, dual-world execution.

## Documents

| Document | Purpose |
|---|---|
| [README.md](./README.md) | Project card — architecture, dual-world boundary, API layer, anti-patterns, recent changes |
| [architecture.md](./架构设计.md) | Architecture overview — dual-world boundary, four-tier API, CDN injection |
| [dev-standards.md](./开发规范.md) | Development standards — coding conventions, build config, API layer standards |
| [functional-modules.md](./功能模块.md) | Module inventory — popup, chat, content, API, shared modules |

## Stories

| Story | Domain |
|---|---|
| [Pet Settings](./stories/pet-settings/story.md) | Pet configuration |

## Decisions (ADRs)

| ADR | Status |
|---|---|
| [Chrome MV3 Dual-World Boundary](../../../leader/decisions/yipet/chrome-mv3-dual-world.md) | Implemented |
| [Biome Lint/Format](../../../leader/decisions/yipet/biome-lint-format.md) | Implemented |
| [AiCR Port](../../../leader/decisions/yipet/aicr-port.md) | Implemented |
| [React 18 + Ant Design Migration](../../../leader/decisions/yipet/react-18-antd-migration.md) | Implemented |
| [Four-Tier API Layer](../../../leader/decisions/yipet/four-tier-api-layer.md) | Implemented |
| [Cross-Project Hub](../../../leader/decisions/yipet/cross-project-hub.md) | Implemented |

## Cross-project

- [YiPet CLAUDE.md](../../../../YiPet/CLAUDE.md) — Live project profile
- [RPC Protocol](../../build/cross-project-rpc-protocol.md) — RPC envelope, parameter contracts, bug patterns
- [Product Management](../../../producter/projects/yipet/project-management.md) — Iteration cadence, deliverables
- [Onboarding](../../run/onboarding/yipet/onboarding.md) — New hire setup
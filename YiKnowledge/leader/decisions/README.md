---
title: 技术负责人 — 决策 (ADR)
tags: [leaf, leader, adr, decisions, architecture]
category: leader/decisions
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "技术负责人可以按项目找到所有项目级架构决策记录"
acceptance_criteria:
  - "ADR 按项目组织（YiAi、YiVad、YiPet、FDE）"
  - "跨项目 ADR 仪表盘可访问"
  - "每个 ADR 遵循 12 节模板"
related:
  - ../INDEX.md
  - ../架构/design-architecture-decision.md
  - ../../engineer/build/
---

# 技术负责人 — 决策 (ADR)

> **作为**技术负责人，**我想要**找到所有项目级架构决策记录，**以便**理解过去决策的原因并做出前后一致的未来决策。

## 项目

| Project | ADRs | Key decisions |
|---|---|---|
| [yiai/](./yiai/) | 6 | BRD agent 启动、LLM 多供应商路由、RAG 评估基础设施、pytest、知识监听器 |
| [yivad/](./yivad/) | 3 | AiCR 阶段移植、Vitest 引入和推出 |
| [yipet/](./yipet/) | 3 | Biome lint/format、AiCR 移植、Chrome MV3 双世界边界 |
| [fde/](./fde/) | 4 | Air-gap 优先、Delta 作为契约、企业 RAG 混合搜索、双循环评估 |

## 跨项目

| File | Description |
|---|---|
| [dashboard-architecture-decisions.md](./dashboard-architecture-decisions.md) | 所有项目的 ADR 状态仪表盘 |
| [stack-migration-sequencing.md](./stack-migration-sequencing.md) | 多项目技术栈迁移排序 |

## 交叉引用

- [../架构/design-architecture-decision.md](../架构/design-architecture-decision.md) — ADR 框架和模板
- [../../engineer/build/](../../engineer/build/) — 系统设计模式
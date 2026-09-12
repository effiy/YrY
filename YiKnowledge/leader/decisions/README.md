---
title: 技术负责人 — 决策 (ADR)
tags: [leaf, leader, adr, decisions, architecture]
category: leader/decisions
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "技术负责人可以按项目找到所有项目级架构决策记录，理解过去决策的原因并做出前后一致的未来决策"
acceptance_criteria:
  - "ADR 按项目组织（YiAi、YiVad、YiPet、FDE）"
  - "跨项目 ADR 仪表盘可访问"
  - "每个 ADR 遵循 12 节模板"
related:
  - ../INDEX.md
  - ../architecture/design-architecture-decision.md
  - ../../engineer/build/
---

# 技术负责人 — 决策 (ADR)

> **作为**技术负责人，**我想要**找到所有项目级架构决策记录，**以便**理解过去决策的原因并做出前后一致的未来决策。
>
> 架构决策记录 (ADR) 是 YrY 单体仓库中技术决策的权威来源。每一篇 ADR 记录了一个决策的上下文（为什么需要做决策）、决策内容（选择了什么）和后果（带来了哪些正面和负面影响）。

## 项目

| 项目 | ADR 数量 | 关键决策 |
|---|---|---|
| [yiai/](./yiai/) | 5 | Agent 启动、LLM 多供应商路由、RAG 评估基础设施、pytest、知识监听器 |
| [yivad/](./yivad/) | 3 | AiCR 移植、Vite 到 Rsbuild 迁移、Vitest 引入 |
| [yipet/](./yipet/) | 6 | Biome 代码检查与格式化、AiCR 移植、Chrome MV3 双世界边界、跨项目 Hub、四层 API 架构、React 18 + Ant Design 5 迁移 |

## 跨项目

| 文件 | 描述 |
|---|---|
| [dashboard-architecture-decisions.md](./dashboard-architecture-decisions.md) | 所有项目的 ADR 状态仪表盘 |
| [stack-migration-sequencing.md](./stack-migration-sequencing.md) | 多项目技术栈迁移排序 |

## ADR 编写流程

1. **识别决策需求**：当面临多种可行方案时，启动 ADR 流程
2. **选择模板**：使用 [../architecture/01-架构-架构决策设计.md](../architecture/01-架构-架构决策设计.md) 提供的 12 节模板
3. **撰写 ADR**：重点在上下文、替代方案和后果，而非仅描述最终决策
4. **评审**：至少一位技术负责人和一位受影响者参与评审
5. **归档**：按项目放到 `decisions/<项目名>/` 目录中
6. **定期审查**：每季度检查 ADR 状态，确认是否仍有效或需替代

## ADR 状态说明

| 状态 | 含义 |
|---|---|
| `proposed` | 已提出，正在讨论中 |
| `accepted` | 已批准并正在执行 |
| `deprecated` | 已废弃，不再执行（决策已不重要）|
| `superseded` | 被新 ADR 替代（需链接到新 ADR）|

## 交叉引用

- [../architecture/01-架构-架构决策设计.md](../architecture/01-架构-架构决策设计.md) — ADR 框架和 12 节模板
- [../../engineer/build/](../../engineer/build/) — 系统设计模式

## 适用场景

- 设计新功能时查阅已有 ADR 避免重复决策
- 技术选型时参考类似场景的历史决策
- 新成员入职时了解项目关键决策的历史背景

## 反模式

- **ADR 写了但不再维护。** ADR 的状态必须保持准确。已被替代的 ADR 应标记为 `superseded` 并链接到新的 ADR
- **跨项目决策未交叉引用。** 如果 YiAi 的 ADR 影响 YiVad，应在双方的 ADR 中通过 `related` 字段相互引用
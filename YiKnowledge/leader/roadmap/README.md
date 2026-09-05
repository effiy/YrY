---
title: 技术负责人 — 路线图
tags: [leaf, leader, roadmap, planning, tech-debt, slo, deprecation]
category: leader/roadmap
created: 2026-08-06
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, producter]
benefit: "技术负责人可以在一个地方找到路线图规划、技术债务管理、SLO 定义和废弃流程"
acceptance_criteria:
  - "路线图规划和审查流程已记录"
  - "技术债务管理和 SLO 定义存在"
  - "废弃和下线流程已包含"
  - "所有文件引用均为可点击的 markdown 链接"
related:
  - ./INDEX.md
  - ../INDEX.md
  - ../../executiver/roadmap/
  - ../../producter/strategy/
---

# 技术负责人 — 路线图

> **作为**技术负责人，**我想要**找到路线图规划指南和技术债务管理流程，**以便**规划、排定优先级并执行工程路线图。

涵盖路线图规划、容量管理、技术选型、PoC、技术债务、SLO 和服务生命周期管理。

## 目录

| Section | Description |
|---|---|
| [快速开始](#快速开始该用哪个文档) | 常见规划需求 → 对应文档 |
| [范围](#范围) | 本目录的包含和排除内容 |
| [文件清单](#文件清单) | 全部 10 份文档及描述 |
| [文档关系](#文档关系) | 文档在规划生命周期中的关联方式 |
| [角色与使用场景](#角色与使用场景) | 哪个角色负责哪个文档 |
| [Frontmatter 模板](#frontmatter-模板) | 新文件的 YAML frontmatter |
| [反模式](#反模式) | 常见错误及替代做法 |
| [何时审查](#何时审查) | 触发条件 → 行动表 |
| [相关叶子目录](#相关叶子目录) | 与其他知识库叶子目录的交叉引用 |

## 快速开始：该用哪个文档？

| 规划需求 | 从这里开始 | 产出 |
|---|---|---|
| "我们需要规划工程路线图" | [Plan Tech Roadmap](./plan-tech-roadmap.md) | 带容量分配的排序路线图 |
| "我们实际有多少容量？" | [Do a Capacity Plan](./do-a-capacity-plan.md) | 带开销分解的人周估算 |
| "Q4 规划要来了 — 我需要什么？" | [TL Roadmap Review Q4 Preview](./tl-roadmap-review-2026-q4-preview.md) | Q3 实际数据 + Q4 预览模板 |
| "我们应该用 X 还是 Y 技术？" | [Do a Tech Selection](./do-a-tech-selection.md) | 加权标准矩阵 + PoC 建议 |
| "我们能做 X 吗？快速测试一下" | [Do a Proof of Concept](./do-a-proof-of-concept.md) | 一页 PoC 报告及 go/no-go |
| "技术债务在拖慢我们" | [Manage Tech Debt](./manage-tech-debt.md) | 分类、排定优先级的技术债务登记册 |
| "我们需要可靠性目标" | [Define an SLO](./define-an-slo.md) | SLI、SLO、错误预算、告警规则 |
| "这个功能是死重 — 移除它" | [Deprecate a Feature](./deprecate-a-feature.md) | 时间线、迁移路径、沟通计划 |
| "这个服务需要下线" | [Decommission a Service](./decommission-a-service.md) | 依赖图、分阶段迁移、清理 |
| "给我看全局视图" | [Dashboard — Roadmap Progress](./dashboard-roadmap-progress.md) | 容量、交付、债务、SLO、风险一览 |

## 范围

- 工程路线图规划和排序
- 容量估算和分配
- 技术评估和选型
- 概念验证（PoC）方法论
- 技术债务识别、分类和削减
- 服务等级目标（SLO）定义
- 功能废弃和服务下线

**范围外**（参见相关叶子目录）：
- 架构模式和技术成熟度模型 → [../架构/](../架构/)
- 架构决策记录（ADR） → [../decisions/](../decisions/)
- 风险登记册和事故复盘 → [../risk/](../risk/)
- 高管级规划和 OKR → [../../executiver/roadmap/](../../executiver/roadmap/)
- 产品战略和路线图 → [../../producter/strategy/](../../producter/strategy/)

## 文件清单

### 路线图与规划（5 份）

| File | Description | Status |
|---|---|---|
| [plan-tech-roadmap.md](./plan-tech-roadmap.md) | 技术路线图规划 — 4 类工作分解、排序、利益相关者沟通 | ✅ |
| [tl-roadmap-review-2026-q4-preview.md](./tl-roadmap-review-2026-q4-preview.md) | 2026 年 Q4 路线图预览 — Q3 实际数据模板、容量展望、规划时间线 | ✅ |
| [do-a-capacity-plan.md](./do-a-capacity-plan.md) | 容量规划 — 原始到净容量计算、开销估算、季度校准 | ✅ |
| [do-a-tech-selection.md](./do-a-tech-selection.md) | 技术选型 — 加权标准、PoC 验证、ADR 文档化 | ✅ |
| [do-a-proof-of-concept.md](./do-a-proof-of-concept.md) | PoC 验证方法论 — 时间盒约束、成功标准、一页报告 | ✅ |

### 技术债务与生命周期（4 份）

| File | Description | Status |
|---|---|---|
| [manage-tech-debt.md](./manage-tech-debt.md) | 技术债务管理 — 5 种分类、成本量化、ROI 优先级排序 | ✅ |
| [define-an-slo.md](./define-an-slo.md) | SLO 定义 — SLI 选择、错误预算、燃烧速率告警 | ✅ |
| [deprecate-a-feature.md](./deprecate-a-feature.md) | 功能废弃 — 公告/警告/移除阶段、迁移路径、沟通计划 | ✅ |
| [decommission-a-service.md](./decommission-a-service.md) | 服务下线 — 依赖发现、5 阶段迁移、清理检查清单 | ✅ |

### 仪表盘（1 份）

| File | Description | Status |
|---|---|---|
| [dashboard-roadmap-progress.md](./dashboard-roadmap-progress.md) | 路线图进度仪表盘 — 容量、交付、技术债务、SLO、风险板块 | ✅ |

## 文档关系

```mermaid
flowchart TD
    subgraph Strategy["战略输入"]
        ER["executiver/roadmap/\n(组织规划, OKRs)"]
        PS["producter/strategy/\n(产品方向)"]
    end

    subgraph Planning["规划"]
        CP["do-a-capacity-plan.md"]
        PTR["plan-tech-roadmap.md"]
        TLR["tl-roadmap-review-*.md"]
        TS["do-a-tech-selection.md"]
        POC["do-a-proof-of-concept.md"]
    end

    subgraph Lifecycle["生命周期管理"]
        MTD["manage-tech-debt.md"]
        SLO["define-an-slo.md"]
        DEP["deprecate-a-feature.md"]
        DECOM["decommission-a-service.md"]
    end

    subgraph Tracking["追踪"]
        DASH["dashboard-roadmap-progress.md"]
    end

    ER --> CP
    PS --> PTR
    CP --> PTR
    PTR --> TLR
    TS --> POC
    POC --> TS
    PTR --> DASH
    MTD --> DASH
    SLO --> DASH

    style PTR fill:#2e7d32,color:#fff
    style DASH fill:#4a90d9,color:#fff
```

## 角色与使用场景

| Role | Primary documents | Why |
|---|---|---|
| **Leader (TL)** | [Plan Tech Roadmap](./plan-tech-roadmap.md), [Capacity Plan](./do-a-capacity-plan.md), [Manage Tech Debt](./manage-tech-debt.md) | 负责工程规划和执行 |
| **Leader (Infra)** | [Define an SLO](./define-an-slo.md), [Decommission a Service](./decommission-a-service.md) | 负责可靠性和基础设施生命周期 |
| **Leader + Producter** | [Tech Selection](./do-a-tech-selection.md), [PoC](./do-a-proof-of-concept.md), [Deprecate a Feature](./deprecate-a-feature.md) | 技术和功能生命周期的联合决策 |
| **All roles** | [Dashboard](./dashboard-roadmap-progress.md) | 路线图进度可见性 |

## Frontmatter 模板

```yaml
---
title: Some Roadmap Document
tags: [roadmap, topic, leader]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: YYYY-MM-DD
source: <link or internal>
type: summary
lifecycle: reference
review_cycle: quarterly
related:
  - ./plan-tech-roadmap.md
  - ../README.md
  - ../INDEX.md
---
```

## 反模式

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| 100% 功能开发，0% 技术投资 | 技术债务增长；交付速度下降 | [Plan Tech Roadmap](./plan-tech-roadmap.md)：保护 20–30% 用于技术投资 |
| 容量规划假设 100% 利用率 | 没有缓冲；每次意外都导致延误 | [Do a Capacity Plan](./do-a-capacity-plan.md)：留 10–15% 缓冲 |
| 技术债务登记册没有优先级排序 | 积压变成坟墓 | [Manage Tech Debt](./manage-tech-debt.md)：每月审查；删除永远不会修复的条目 |
| SLO 没有错误预算 | 没有机制平衡可靠性与交付速度 | [Define an SLO](./define-an-slo.md)：错误预算策略是核心产出 |
| 无预警废弃 | 用户感到意外和愤怒 | [Deprecate a Feature](./deprecate-a-feature.md)：至少提前 30 天通知 |
| 下线前未做依赖发现 | 孤立的调用方在下线后崩溃 | [Decommission a Service](./decommission-a-service.md)：将 50% 的项目时间用于依赖发现 |

## 何时审查

| Trigger | Action |
|---|---|
| 季度开始 | 执行 [do-a-capacity-plan.md](./do-a-capacity-plan.md) → [plan-tech-roadmap.md](./plan-tech-roadmap.md) |
| 季度结束 | 执行 [tl-roadmap-review-*.md](./tl-roadmap-review-2026-q4-preview.md)；更新 [dashboard](./dashboard-roadmap-progress.md) |
| 考虑新技术 | 执行 [do-a-tech-selection.md](./do-a-tech-selection.md) → [do-a-proof-of-concept.md](./do-a-proof-of-concept.md) |
| 交付速度下降 | 审查 [manage-tech-debt.md](./manage-tech-debt.md)；检查容量分配 |
| 新服务上线 | 执行 [define-an-slo.md](./define-an-slo.md) |
| 功能待移除 | 执行 [deprecate-a-feature.md](./deprecate-a-feature.md) |
| 服务待下线 | 执行 [decommission-a-service.md](./decommission-a-service.md) |
| 每周 | 更新 [dashboard](./dashboard-roadmap-progress.md) 第 1、2、5 节 |

## 相关叶子目录

| Leaf | Relevance |
|---|---|
| [../../executiver/roadmap/](../../executiver/roadmap/) | 高管级规划 — 输入到技术路线图 |
| [../../executiver/strategy/](../../executiver/strategy/) | 业务战略框架 — 为产品优先级提供信息 |
| [../../producter/strategy/](../../producter/strategy/) | 产品战略 — 将产品方向与技术路线图对齐 |
| [../架构/](../架构/) | 架构模式 — 在技术选型和 ADR 中引用 |
| [../decisions/](../decisions/) | ADR — 技术选型决策的记录位置 |
| [../risk/](../risk/) | 风险管理 — 事故复盘输入到技术债务登记册 |
| [../INDEX.md](../INDEX.md) | Leader 角色索引 — 所有 leader 子目录 |
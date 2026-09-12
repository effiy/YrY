---
title: 产品经理
tags:
- leaf
- producter
- frameworks
- discovery
- delivery
- strategy
- projects
category: producter
created: '2026-08-06'
updated: 2026-09-10
last_verified: '2026-09-10'
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- producter
- engineer
benefit: "产品经理可以按问题领域找到 PM 框架、发现工具、交付流程和战略指南"
acceptance_criteria:
- '5 个问题领域子目录：frameworks、discovery、delivery、strategy、projects'
- 每个子目录有 README 及分类文件列表
- 最多 3 级目录深度
related:
- ./INDEX.md
- ../INDEX.md
- ../curator/COLLABORATION.md
---

# 产品经理

> **流水线阶段 1/5：需求** — 输入芯片：`业务战略` → 输出芯片：`PRD`、`用户故事`、`优先级排序`
>
> **作为**产品经理，**我想要**找到 PM 框架、发现工具和交付流程，**以便**定义、构建并交付正确的产品。
>
> 产品经理定义"做什么"。产品经理不决定"如何构建"（→ [engineer/](../engineer/)）、不做技术决策（→ [leader/](../leader/)）、不制定业务战略（→ [executiver/](../executiver/)）。

## 适用场景

本知识区适用于以下场景：

- **新产品从零到一**：需要系统化的发现框架、用户研究方法和 PRD 模板来定义产品方向
- **现有产品迭代**：需要优先级排序工具（RICE/ICE/MoSCoW）来决定每个版本的功能取舍
- **跨项目协作**：YrY 仓库包含 3 个产品（YiVad、YiPet、YiAi），需要统一的 PM 方法论来协调跨项目需求
- **团队对齐**：需要 OKR 设计和北极星指标来确保产品、工程、设计团队朝同一方向努力
- **AI 产品探索**：YiAi 作为 AI 平台，需要专门的 AI 产品方法论来指导功能设计

## 入门指南

| 我是新来的，想要... | 去这里 |
|---|---|
| 了解角色索引 | [INDEX.md](./INDEX.md) — 按芯片列出的完整文件清单 |
| 学习优先级排序框架 | [frameworks/06-框架-RICE-ICE优先级.md](./frameworks/06-框架-RICE-ICE优先级.md) — RICE/ICE 评分方法 |
| 写我的第一份 PRD | [discovery/01-发现-编写PRD.md](./discovery/01-发现-编写PRD.md) — PRD 撰写完整指南 |
| 了解 Sprint 如何运作 | [delivery/01-交付-运作Sprint.md](./delivery/01-交付-运作Sprint.md) — Sprint 管理全流程 |
| 学习 AI 产品案例 | [strategy/01-战略-AI客服案例.md](./strategy/01-战略-AI客服案例.md) — AI 客服三种模式 |
| 查看项目专属文档 | [projects/](./projects/) — YiAi、YiVad、YiPet PM 文档 |

## 流水线芯片契约

| 芯片 | 类型 | 描述 | 知识区 |
|---|---|---|---|
| 业务战略 | ← 输入 | 市场情报、竞争格局、组织级目标 | [executiver/](../executiver/) |
| `prds` | 输出 → | 产品需求文档 — 做什么、为谁做、为什么做 | [discovery/01-发现-编写PRD.md](./discovery/01-发现-编写PRD.md), [discovery/prd/](./discovery/prd/) |
| `user-stories` | 输出 → | 用户故事和 JTBD 叙述，描述用户真实需求 | [frameworks/](./frameworks/), [discovery/](./discovery/) |
| `priorities` | 输出 → | 优先级排序框架（RICE/ICE/MoSCoW）和北极星指标体系 | [frameworks/](./frameworks/), [discovery/metrics/](./discovery/metrics/) |

## 范围

### 范围内（producter 负责）

**`prds` 芯片 — 产品需求文档：**
- [01-发现-编写PRD.md](./discovery/01-发现-编写PRD.md) — PRD 撰写方法论和分步指南
- [discovery/prd/](./discovery/prd/) — 具体 PRD 实例和可复用模板
- [frameworks/07-框架-用户故事地图.md](./frameworks/07-框架-用户故事地图.md) — 将 PRD 拆解为可视化用户旅程

**`user-stories` 芯片 — 用户需求理解：**
- [frameworks/01-框架-用户研究方法.md](./frameworks/01-框架-用户研究方法.md) — 五种用户研究方法及使用时机
- [frameworks/02-框架-JTBD框架摘要.md](./frameworks/02-框架-JTBD框架摘要.md) — Jobs-to-Be-Done 框架核心概念
- [frameworks/03-框架-Kano模型摘要.md](./frameworks/03-框架-Kano模型摘要.md) — Kano 模型用于功能分类
- [frameworks/07-框架-用户故事地图.md](./frameworks/07-框架-用户故事地图.md) — 用户故事地图构建方法
- [discovery/ux/01-体验-UX检查清单.md](./discovery/ux/01-体验-UX检查清单.md) — UX 可用性、无障碍、视觉设计检查清单

**`priorities` 芯片 — 优先级与指标体系：**
- [frameworks/04-框架-MoSCoW优先级.md](./frameworks/04-框架-MoSCoW优先级.md) — MoSCoW 四分类优先级方法
- [frameworks/05-框架-OKR设计摘要.md](./frameworks/05-框架-OKR设计摘要.md) — OKR 设计原则和常见反模式
- [frameworks/06-框架-RICE-ICE优先级.md](./frameworks/06-框架-RICE-ICE优先级.md) — RICE/ICE 量化评分框架
- [discovery/metrics/01-指标-北极星指标.md](./discovery/metrics/01-指标-北极星指标.md) — 北极星指标定义与验证方法
- [delivery/01-交付-运作Sprint.md](./delivery/01-交付-运作Sprint.md) — Sprint 管理五项仪式
- [strategy/](./strategy/) — 竞争分析、行业案例研究
- [projects/](./projects/) — 各项目 PM 管理文档
- [okr/](./okr/) — 季度 OKR 与指标追踪

### 范围外（委托给其他角色）

- 业务/企业战略 → **[executiver/strategy/](../executiver/strategy/)**
- 市场情报和行业报告 → **[executiver/industry/](../executiver/industry/)**
- 技术实现模式 → **[engineer/](../engineer/)**
- 架构决策 → **[leader/decisions/](../leader/decisions/)**
- 技术路线图 → **[leader/roadmap/](../leader/roadmap/)**
- 工程团队流程 → **[engineer/run/](../engineer/run/)**
- 知识库治理 → **[curator/](../curator/)**

## 边界情况决策规则

| 当内容涉及... | 归属 | 原因 |
|---|---|---|
| 产品定位与竞争对手对比 | producter/strategy/ | 产品级竞争分析 |
| 市场趋势和行业报告 | executiver/industry/ | 业务级市场情报 |
| 功能优先级排序框架 | producter/frameworks/ | PM 核心工具 |
| 功能的技术可行性评估 | engineer/build/ | 工程评估 |
| Sprint 回顾会议形式 | producter/delivery/ | PM 交付流程 |
| 工程团队回顾会议形式 | engineer/run/ | 工程团队工作流 |
| 产品路线图（什么功能、何时上线） | producter/strategy/ | 产品方向决策 |
| 技术路线图（什么技术、何时采用） | leader/roadmap/ | 技术方向决策 |
| 用户研究访谈指南 | producter/discovery/ | PM 发现工具 |
| 用户研究综合报告 | producter/discovery/ | PM 交付物 |

## 问题领域

| 领域 | 解决的问题 | 文件数 | 关键入口 |
|---|---|---|---|
| [frameworks/](./frameworks/) | 如何对产品决策进行优先级排序和结构化分析？ | 7+ | [06-RICE-ICE优先级](./frameworks/06-框架-RICE-ICE优先级.md), [02-JTBD框架摘要](./frameworks/02-框架-JTBD框架摘要.md), [03-Kano模型摘要](./frameworks/03-框架-Kano模型摘要.md) |
| [discovery/](./discovery/) | 如何深入理解用户并准确定义需求？ | 4+ | [01-编写PRD](./discovery/01-发现-编写PRD.md), [metrics/](./discovery/metrics/), [ux/](./discovery/ux/) |
| [delivery/](./delivery/) | 如何高效运作 Sprint 并按时交付价值？ | 1+ | [01-运作Sprint](./delivery/01-交付-运作Sprint.md) |
| [strategy/](./strategy/) | 如何在市场中定位产品并借鉴行业案例？ | 1+ | [01-AI客服案例](./strategy/01-战略-AI客服案例.md) |
| [projects/](./projects/) | 各项目（YiAi、YiVad、YiPet）PM 管理文档 | 4 | [projects/README](./projects/README.md) |
| [okr/](./okr/) | 季度目标与关键结果追踪 | 3+ | [okr/2026-Q3/](./okr/2026-Q3/) |

## 快速参考

| 我想要... | 芯片 | 去这里 |
|---|---|---|
| 用 RICE 量化评分排优先级 | `priorities` | [frameworks/06-框架-RICE-ICE优先级.md](./frameworks/06-框架-RICE-ICE优先级.md) |
| 用 ICE 快速打分排优先级 | `priorities` | [frameworks/06-框架-RICE-ICE优先级.md](./frameworks/06-框架-RICE-ICE优先级.md) |
| 使用 MoSCoW 强制做范围取舍 | `priorities` | [frameworks/04-框架-MoSCoW优先级.md](./frameworks/04-框架-MoSCoW优先级.md) |
| 理解用户真实需求（JTBD） | `user-stories` | [frameworks/02-框架-JTBD框架摘要.md](./frameworks/02-框架-JTBD框架摘要.md) |
| 用 Kano 模型分类功能属性 | `user-stories` | [frameworks/03-框架-Kano模型摘要.md](./frameworks/03-框架-Kano模型摘要.md) |
| 创建用户故事地图 | `user-stories` | [frameworks/07-框架-用户故事地图.md](./frameworks/07-框架-用户故事地图.md) |
| 做用户研究访谈 | `user-stories` | [frameworks/01-框架-用户研究方法.md](./frameworks/01-框架-用户研究方法.md) |
| 撰写一份完整的 PRD | `prds` | [discovery/01-发现-编写PRD.md](./discovery/01-发现-编写PRD.md) |
| 使用 PRD 模板快速起稿 | `prds` | [discovery/prd/01-需求-PRD模板.md](./discovery/prd/01-需求-PRD模板.md) |
| 定义产品的北极星指标 | `priorities` | [discovery/metrics/01-指标-北极星指标.md](./discovery/metrics/01-指标-北极星指标.md) |
| 设计团队 OKR | `priorities` | [frameworks/05-框架-OKR设计摘要.md](./frameworks/05-框架-OKR设计摘要.md) |
| 运作一个完整的 Sprint | `priorities` | [delivery/01-交付-运作Sprint.md](./delivery/01-交付-运作Sprint.md) |
| 进行 UX 可用性检查 | `user-stories` | [discovery/ux/01-体验-UX检查清单.md](./discovery/ux/01-体验-UX检查清单.md) |
| 学习 AI 产品实施案例 | `priorities` | [strategy/01-战略-AI客服案例.md](./strategy/01-战略-AI客服案例.md) |
| 查看 YiVad 项目 PM 文档 | `priorities` | [projects/yivad/01-项目-管理.md](./projects/yivad/01-项目-管理.md) |
| 查看 YiPet 项目 PM 文档 | `priorities` | [projects/yipet/01-项目-管理.md](./projects/yipet/01-项目-管理.md) |
| 查看 YiAi 项目 PM 文档 | `priorities` | [projects/yiai/01-项目-管理.md](./projects/yiai/01-项目-管理.md) |

## 交叉引用

### 上游（producter 的输入来源）
- [../executiver/strategy/](../executiver/strategy/) — 业务战略、市场定位
- [../executiver/industry/](../executiver/industry/) — 市场情报、行业报告

### 下游（producter 输出的消费者）
- [../leader/decisions/](../leader/decisions/) — PRD 输入到架构决策记录（ADR）
- [../leader/roadmap/](../leader/roadmap/) — 优先级排序影响技术路线图
- [../engineer/run/](../engineer/run/) — 用户故事驱动工程工作流

### 同级角色
- [../curator/COLLABORATION.md](../curator/COLLABORATION.md) — 跨角色协作领域索引
- [../aier/methods/](../aier/methods/) — AI 方法论（面向 AI 产品 PM）

### 内部导航
- [./INDEX.md](./INDEX.md) — 完整角色索引及所有文件列表
- [../INDEX.md](../INDEX.md) — 知识库顶级索引

## 流水线流程

```
executiver/（业务战略）
    │ 市场情报、组织战略
    ▼
┌── producter/（阶段 1：需求定义）──┐
│  输入：业务战略                    │
│  输出：PRD、用户故事、优先级        │
└─────────────────────────────────┘
    │ PRD、用户故事、优先级排序
    ▼
leader/（阶段 2：架构决策）
    │ ADR、技术选型、容量规划
    ▼
engineer/（阶段 3：设计与构建）
    │ 架构模式、开发实践、质量安全
    ▼
srer/（阶段 4+5：质量发布 + 运维学习）
```

### 关键跨阶段链接
- [01-发现-编写PRD.md](./discovery/01-发现-编写PRD.md) → [leader/decisions/](../leader/decisions/) — PRD 驱动架构决策
- [01-指标-北极星指标.md](./discovery/metrics/01-指标-北极星指标.md) → [leader/roadmap/](../leader/roadmap/) — 产品指标驱动 SLO 定义
- [06-框架-RICE-ICE优先级.md](./frameworks/06-框架-RICE-ICE优先级.md) → leader 容量规划 — 优先级影响资源分配
- [01-交付-运作Sprint.md](./delivery/01-交付-运作Sprint.md) → [engineer/run/](../engineer/run/) — 交付流程输入到工程回顾
- [01-体验-UX检查清单.md](./discovery/ux/01-体验-UX检查清单.md) → [aier/methods/](../aier/methods/) — UX 模式与 AI 方法论对齐
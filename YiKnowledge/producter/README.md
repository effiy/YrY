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
updated: '2026-08-12'
last_verified: '2026-08-12'
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

> **流水线阶段 1/5：需求** — 输入芯片：`Business strategy` → 输出芯片：`PRDs`、`user stories`、`priorities`
>
> **作为**产品经理，**我想要**找到 PM 框架、发现工具和交付流程，**以便**定义、构建并交付正确的产品。
> Producter 定义做什么。Producter 不决定如何构建（→ [engineer/](../engineer/)）、不做技术决策（→ [leader/](../leader/)）、不制定业务战略（→ [executiver/](../executiver/)）。

## 入门指南

| 我是新来的，想要... | 去这里 |
|---|---|
| 了解角色索引 | [INDEX.md](./INDEX.md) — 按芯片列出的完整文件清单 |
| 学习优先级排序框架 | [frameworks/rice-ice-prioritization.md](./frameworks/rice-ice-prioritization.md) — RICE/ICE 评分 |
| 写我的第一份 PRD | [discovery/write-a-prd.md](./discovery/write-a-prd.md) — PRD 撰写指南 |
| 了解 Sprint 如何运作 | [delivery/run-a-sprint.md](./delivery/run-a-sprint.md) — Sprint 管理 |
| 学习 AI 产品案例 | [strategy/ai-customer-service-cases.md](./strategy/ai-customer-service-cases.md) — AI 客服案例 |
| 查看项目专属文档 | [projects/](./projects/) — YiAi、YiVad、YiPet PM 文档 |

## Pipeline chip contract

| Chip | Type | Description | Knowledge area |
|---|---|---|---|
| Business strategy | ← Input | 市场情报、竞争格局、组织级目标 | [executiver/](../executiver/) |
| `prds` | Output → | 产品需求文档 — 做什么、为谁做 | [discovery/write-a-prd.md](./discovery/write-a-prd.md), [discovery/prd/](./discovery/prd/) |
| `user-stories` | Output → | 用户故事和 JTBD 叙述 | [frameworks/](./frameworks/), [discovery/](./discovery/) |
| `priorities` | Output → | 优先级排序框架（RICE/ICE）和北极星指标 | [frameworks/](./frameworks/), [discovery/metrics/](./discovery/metrics/) |

## 范围

### 范围内（producter 负责）

**`prds` 芯片：**
- [write-a-prd.md](./discovery/write-a-prd.md) — PRD 撰写方法论和指南
- [discovery/prd/](./discovery/prd/) — 具体 PRD 实例（BRD agent、aiChat 移植）
- [frameworks/write-a-brd.md](./frameworks/write-a-brd.md) — BRD 撰写指南
- [frameworks/write-a-spec-or-prd.md](./frameworks/write-a-spec-or-prd.md) — Spec/PRD 撰写

**`user-stories` 芯片：**
- [frameworks/jobs-to-be-done.md](./frameworks/jobs-to-be-done.md) — Jobs-to-be-Done 框架
- [frameworks/kano-model.md](./frameworks/kano-model.md) — Kano 模型用于功能分类
- [frameworks/jtbd-kano.md](./frameworks/jtbd-kano.md) — JTBD + Kano 整合方法
- [frameworks/story-mapping.md](./frameworks/story-mapping.md) — 用户故事地图
- [frameworks/do-user-research.md](./frameworks/do-user-research.md) — 用户研究方法
- [discovery/ux/](./discovery/ux/) — UX 模式、可用性、无障碍（9 个文件）

**`priorities` 芯片：**
- [frameworks/rice-ice-prioritization.md](./frameworks/rice-ice-prioritization.md) — RICE/ICE 评分
- [frameworks/moscow-prioritization.md](./frameworks/moscow-prioritization.md) — MoSCoW 方法
- [frameworks/heart-aarrr-metrics.md](./frameworks/heart-aarrr-metrics.md) — HEART + AARRR 框架
- [frameworks/okr-design.md](./frameworks/okr-design.md) — OKR 设计指南
- [discovery/metrics/north-star-metric.md](./discovery/metrics/north-star-metric.md) — 北极星指标定义
- [discovery/metrics/](./discovery/metrics/) — 完整指标目录（7 个文件）
- [delivery/run-a-sprint.md](./delivery/run-a-sprint.md) — Sprint 管理
- [delivery/](./delivery/) — 会议、回顾、规划（15 个文件）
- [strategy/](./strategy/) — 竞争分析、行业案例（7 个文件）
- [projects/](./projects/) — 各项目 PM 文档（4 个文件）

**`frameworks`（完整目录 — 20 个文件）：**
- [frameworks/dual-track-agile.md](./frameworks/dual-track-agile.md) — 双轨敏捷（发现 + 交付）
- [frameworks/agile-product-management.md](./frameworks/agile-product-management.md) — 敏捷 PM 方法论
- [frameworks/lean-startup.md](./frameworks/lean-startup.md) — 精益创业方法论
- [frameworks/product-discovery-framework.md](./frameworks/product-discovery-framework.md) — 产品发现框架
- [frameworks/prioritize-a-backlog.md](./frameworks/prioritize-a-backlog.md) — 积压需求优先级排序
- [frameworks/handle-an-edge-case-backlog.md](./frameworks/handle-an-edge-case-backlog.md) — 边缘案例管理
- [frameworks/launch-an-ai-product.md](./frameworks/launch-an-ai-product.md) — AI 产品发布指南
- [frameworks/write-a-weekly-report.md](./frameworks/write-a-weekly-report.md) — 周报撰写
- [frameworks/README.md](./frameworks/README.md) — 完整框架索引

### 范围外（委托给其他角色）
- 业务/企业战略 → **[executiver/strategy/](../executiver/strategy/)**
- 市场情报和行业报告 → **[executiver/industry/](../executiver/industry/)**
- 技术实现模式 → **[engineer/](../engineer/)**
- 架构决策 → **[leader/decisions/](../leader/decisions/)**
- 技术路线图 → **[leader/roadmap/](../leader/roadmap/)**
- 工程团队流程 → **[engineer/run/](../engineer/run/)**
- 知识库治理 → **[curator/治理/](../curator/治理/)**

## 边界情况决策规则

| 当内容涉及... | Route to | Because |
|---|---|---|
| 产品定位与竞争对手对比 | producter/strategy/ | 产品级竞争分析 |
| 市场趋势和行业报告 | executiver/industry/ | 业务级市场情报 |
| 功能优先级排序框架 | producter/frameworks/ | PM 工具 |
| 功能的技术可行性 | engineer/build/ | 工程评估 |
| Sprint 回顾会议形式 | producter/delivery/ | PM 交付流程 |
| 工程团队回顾会议形式 | engineer/run/ | 工程团队工作流 |
| 产品路线图（什么功能何时上线） | producter/strategy/ | 产品方向 |
| 技术路线图（什么技术何时采用） | leader/roadmap/ | 技术方向 |
| 用户研究访谈指南 | producter/discovery/ | PM 发现工具 |
| 用户研究综合报告 | producter/discovery/ | PM 交付物 |

## 问题领域

| Domain | Solves | Files | Key entry points |
|---|---|---|---|
| [frameworks/](./frameworks/) | 如何对产品决策进行优先级排序和结构化？ | 20 | [README](./frameworks/README.md), [RICE/ICE](./frameworks/rice-ice-prioritization.md), [JTBD](./frameworks/jobs-to-be-done.md) |
| [discovery/](./discovery/) | 如何理解用户并定义需求？ | 24 | [INDEX](./discovery/INDEX.md), [write-a-prd](./discovery/write-a-prd.md), [metrics/](./discovery/metrics/), [ux/](./discovery/ux/) |
| [delivery/](./delivery/) | 如何运行 Sprint 并按时交付？ | 15 | [README](./delivery/README.md), [run-a-sprint](./delivery/run-a-sprint.md), [retrospective](./delivery/retrospective.md) |
| [strategy/](./strategy/) | 如何在市场中定位产品？ | 7 | [README](./strategy/README.md), [overseas-brd](./strategy/overseas-brd-case-study.md), [rag-agent](./strategy/rag-agent-case-study.md) |
| [projects/](./projects/) | 各项目 PM 文档（YiAi、YiVad、YiPet） | 4 | [README](./projects/README.md) |

## 快速参考

| 我想要... | Chip | 去这里 |
|---|---|---|
| 用 RICE/ICE 排优先级 | `priorities` | [frameworks/rice-ice-prioritization.md](./frameworks/rice-ice-prioritization.md) |
| 使用 MoSCoW 优先级排序 | `priorities` | [frameworks/moscow-prioritization.md](./frameworks/moscow-prioritization.md) |
| 对积压需求排优先级 | `priorities` | [frameworks/prioritize-a-backlog.md](./frameworks/prioritize-a-backlog.md) |
| 理解用户需求（JTBD） | `user-stories` | [frameworks/jobs-to-be-done.md](./frameworks/jobs-to-be-done.md) |
| 用 Kano 分类功能 | `user-stories` | [frameworks/kano-model.md](./frameworks/kano-model.md) |
| 结合 JTBD + Kano | `user-stories` | [frameworks/jtbd-kano.md](./frameworks/jtbd-kano.md) |
| 创建故事地图 | `user-stories` | [frameworks/story-mapping.md](./frameworks/story-mapping.md) |
| 做用户研究 | `user-stories` | [frameworks/do-user-research.md](./frameworks/do-user-research.md) |
| 写一份 PRD | `prds` | [discovery/write-a-prd.md](./discovery/write-a-prd.md) |
| 写一份 BRD | `prds` | [frameworks/write-a-brd.md](./frameworks/write-a-brd.md) |
| 定义北极星指标 | `priorities` | [discovery/metrics/north-star-metric.md](./discovery/metrics/north-star-metric.md) |
| 建立产品指标体系 | `priorities` | [discovery/metrics/](./discovery/metrics/) — AARRR、DORA、NPS/CSAT、漏斗 |
| 设计 OKR | `priorities` | [frameworks/okr-design.md](./frameworks/okr-design.md) |
| 运行一个 Sprint | `priorities` | [delivery/run-a-sprint.md](./delivery/run-a-sprint.md) |
| 运行 Sprint 回顾 | `priorities` | [delivery/retrospective.md](./delivery/retrospective.md) |
| 召开回顾会议 | `priorities` | [delivery/retrospective-meeting.md](./delivery/retrospective-meeting.md) |
| 规划一个季度 | `priorities` | [delivery/quarterly-planning.md](./delivery/quarterly-planning.md) |
| 开高效会议 | `priorities` | [delivery/meeting-efficiency.md](./delivery/meeting-efficiency.md) |
| 写周报 | `priorities` | [delivery/weekly-report.md](./delivery/weekly-report.md) |
| 做设计评审 | `priorities` | [delivery/design-review.md](./delivery/design-review.md) |
| 审查 UX 启发式原则 | `user-stories` | [discovery/ux/nielsen-heuristics.md](./discovery/ux/nielsen-heuristics.md) |
| 设计 AI 产品 UX | `user-stories` | [discovery/ux/ai-product-ux-patterns.md](./discovery/ux/ai-product-ux-patterns.md) |
| 分析竞争对手 | `priorities` | [strategy/](./strategy/) — 案例研究、行业洞察 |
| 学习 AI 实施案例 | `priorities` | [strategy/rag-agent-case-study.md](./strategy/rag-agent-case-study.md) |
| 发布 AI 产品 | `priorities` | [frameworks/launch-an-ai-product.md](./frameworks/launch-an-ai-product.md) |
| 处理积压中的边缘案例 | `priorities` | [frameworks/handle-an-edge-case-backlog.md](./frameworks/handle-an-edge-case-backlog.md) |

## 交叉引用

### 上游（producter 的输入）
- [../executiver/strategy/](../executiver/strategy/) — 业务战略、市场定位
- [../executiver/industry/](../executiver/industry/) — 市场情报、行业报告

### 下游（producter 输出的消费者）
- [../leader/decisions/](../leader/decisions/) — PRD 输入到 ADR
- [../leader/roadmap/](../leader/roadmap/) — 优先级影响技术路线图
- [../engineer/run/](../engineer/run/) — 用户故事驱动工程工作流
- [../engineer/learn/lessons/learn-pm-frameworks.md](../engineer/learn/lessons/learn-pm-frameworks.md) — PM 方法论学习路径

### 同级角色
- [../curator/COLLABORATION.md](../curator/COLLABORATION.md) — 协作领域索引
- [../aier/方法/](../aier/方法/) — AI 方法论（面向 AI 产品 PM）

### 内部导航
- [./INDEX.md](./INDEX.md) — 完整角色索引及所有文件列表
- [../INDEX.md](../INDEX.md) — 知识库顶级索引

## Pipeline flow

```
executiver/ (Business Strategy)
    │ market-intel, org-strategy
    ▼
┌── producter/ (Stage 1: Requirements) ──┐
│  Input:  Business strategy              │
│  Output: PRDs, user stories, priorities │
└─────────────────────────────────────────┘
    │ prds, user-stories, priorities
    ▼
leader/ (Stage 2: Decisions)
    │ adrs, tech-selections, capacity-plans
    ▼
engineer/ (Stage 3: Design+Build)
    │ architecture-patterns, dev-practices, quality-security
    ▼
srer/ (Stage 4+5: Quality+Release + Operate+Learn)
```

### 关键跨阶段链接
- [write-a-prd.md](./discovery/write-a-prd.md) → [leader/decisions/](../leader/decisions/) — PRD 输入到 ADR
- [north-star-metric.md](./discovery/metrics/north-star-metric.md) → [leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md) — 指标驱动 SLO
- [rice-ice-prioritization.md](./frameworks/rice-ice-prioritization.md) → [leader/capacity/run-a-finops-review.md](../leader/capacity/run-a-finops-review.md) — 优先级影响容量
- [run-a-sprint.md](./delivery/run-a-sprint.md) → [engineer/run/run-a-retrospective.md](../engineer/run/run-a-retrospective.md) — 交付输入到回顾
- [heart-aarrr-metrics.md](./frameworks/heart-aarrr-metrics.md) → [srer/observability/](../srer/observability/) — 产品指标影响可观测性
- [discovery/ux/ai-product-ux-patterns.md](./discovery/ux/ai-product-ux-patterns.md) → [aier/方法/](../aier/方法/) — AI UX 模式与 AI 方法论对齐
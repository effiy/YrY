---
title: 高管
tags: [leaf, executiver, strategy, industry, roadmap, reading-list]
category: executiver
created: 2026-08-06
updated: 2026-08-12
last_verified: 2026-08-12
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [executiver]
benefit: "高管可以按领域找到战略框架、行业情报、路线图和学习资源"
acceptance_criteria:
  - "4 个子目录：strategy、industry、roadmap、reading-list"
  - "每个子目录有 README 及分类文件列表"
  - "最多 3 级目录深度"
related:
  - ./INDEX.md
  - ../INDEX.md
  - ../producter/strategy/
---

# 高管

> **流水线层级：业务战略（横切）** — 为阶段 1（需求）提供 `Business strategy` 输入芯片。贯穿整个流水线。
>
> **作为**高管，**我想要**找到业务战略框架、行业情报和组织规划指南，**以便**做出明智的战略决策。
>
> Executiver 提供业务上下文。Executiver 不定义产品战略（→ [producter/](../producter/)）、不做技术决策（→ [leader/](../leader/)）、不实施任何东西（→ [engineer/](../engineer/)）。

## Pipeline chip contract

| Chip | Type | Description | Knowledge area |
|---|---|---|---|
| `market-intel` | Output → | 市场趋势、竞争格局、行业报告 | [industry/](./industry/) |
| `org-strategy` | Output → | 业务战略框架、组织设计、竞争定位 | [strategy/](./strategy/) |
| `reading-list` | Output → | 精选高管阅读材料及提炼洞察 | [reading-list/](./reading-list/) |

## 范围

### 范围内（executiver 负责）

**`market-intel` 芯片：**
- 市场趋势分析和半年度回顾 → [industry/market-trends/](./industry/market-trends/)
- 竞争对手分析和格局地图 → [industry/competitors/](./industry/competitors/)
- 第三方行业报告摘要（Gartner、McKinsey、a16z、CAICT、IDC） → [industry/reports/](./industry/reports/)

**`org-strategy` 芯片：**
- 业务和企业战略框架（Porter、Blue Ocean、VRIO、SWOT） → [strategy/](./strategy/)
- 商业模式设计和价值主张 → [strategy/business-model-canvas.md](./strategy/business-model-canvas.md)
- 组织路线图和战略规划（年度、季度、OKR） → [roadmap/](./roadmap/)
- 人员编制和预算规划 → [roadmap/headcount-budget-planning.md](./roadmap/headcount-budget-planning.md)
- 监管合规和数据留存策略 → [strategy/handle-a-regulatory-change.md](./strategy/handle-a-regulatory-change.md)

**`reading-list` 芯片：**
- 月度精选阅读清单，滚动更新 → [reading-list/reading-list.md](./reading-list/reading-list.md)
- 高管读书笔记，含可操作收获 → [reading-list/reading-note-high-output-management.md](./reading-list/reading-note-high-output-management.md)

### 范围外（委托给其他角色）

- 产品战略和定位 → **[producter/strategy/](../producter/strategy/)**
- 产品路线图（什么功能何时上线） → **[producter/strategy/](../producter/strategy/)**
- 技术路线图（什么技术何时采用） → **[leader/roadmap/](../leader/roadmap/)**
- PM 框架和发现工具 → **[producter/](../producter/)**
- 架构决策 → **[leader/decisions/](../leader/decisions/)**
- 实现模式 → **[engineer/](../engineer/)**
- 事故响应 → **[srer/](../srer/)**
- 知识库治理 → **[curator/](../curator/)**

## 边界情况决策规则

| 当内容涉及... | Route to | Because |
|---|---|---|
| 市场趋势分析 | [executiver/industry/](./industry/) | 业务情报 |
| 产品竞争分析 | [producter/strategy/](../producter/strategy/) | 产品级分析 |
| 企业战略框架 | [executiver/strategy/](./strategy/) | 业务战略 |
| 产品定位策略 | [producter/strategy/](../producter/strategy/) | 产品战略 |
| 组织路线图（业务目标） | [executiver/roadmap/](./roadmap/) | 业务规划 |
| 技术路线图（技术里程碑） | [leader/roadmap/](../leader/roadmap/) | 技术规划 |
| 行业报告摘要 | [executiver/industry/reports/](./industry/reports/) | 业务情报 |
| 竞争对手功能对比 | [producter/strategy/](../producter/strategy/) | 产品分析 |
| 组织结构和团队拓扑 | [executiver/strategy/](./strategy/) | 组织设计 |
| 团队工作流和流程 | [engineer/run/](../engineer/run/) | 工程运营 |
| 监管合规策略 | [executiver/strategy/](./strategy/) | 业务风险管理 |
| 数据合规实施 | [engineer/quality/](../engineer/quality/) | 工程执行 |
| 预算和人员编制规划 | [executiver/roadmap/](./roadmap/) | 业务规划 |
| 招聘和团队增长 | [leader/roadmap/](../leader/roadmap/) | 技术领导力 |

## 领域

| Domain | Solves | Content |
|---|---|---|
| [strategy/](./strategy/) | 如何定义和传达业务战略？ | 14 个文件：战略框架（Porter、Blue Ocean、VRIO、SWOT）、商业模式画布、价值主张、产品战略实例、监管合规 |
| [industry/](./industry/) | 市场和竞争对手在发生什么？ | 19 个文件：竞争对手分析（LLM 供应商、SaaS、区域）、市场趋势（H1 回顾、新兴领域）、行业报告（Gartner、McKinsey、a16z、CAICT、IDC） |
| [roadmap/](./roadmap/) | 我们的组织规划和发展方向是什么？ | 5 个文件：年度战略规划、季度业务评审、OKR 追踪、人员编制/预算规划 |
| [reading-list/](./reading-list/) | 我应该读什么来保持信息灵通？ | 4 个文件：月度阅读清单、读书笔记、书籍摘要 |
| [./okr/2026-Q3/](./okr/2026-Q3/) | 我们的 Q3 目标和指标是什么？ | 14 个文件：3 个目标、5 个指标、11 个 KR 证据文件 |

## 快速参考

### 战略框架

| 我想要... | 去这里 |
|---|---|
| 定义产品战略 | [strategy/product-strategy-framework.md](./strategy/product-strategy-framework.md) |
| 设计商业模式 | [strategy/business-model-canvas.md](./strategy/business-model-canvas.md) |
| 分析竞争力量 | [strategy/porter-five-forces.md](./strategy/porter-five-forces.md) |
| 发现蓝海机会 | [strategy/blue-ocean.md](./strategy/blue-ocean.md) |
| 评估内部能力（VRIO） | [strategy/vrio-framework.md](./strategy/vrio-framework.md) |
| 进行 SWOT 分析 | [strategy/swot-analysis.md](./strategy/swot-analysis.md) |
| 绘制客户价值 | [strategy/value-proposition-canvas.md](./strategy/value-proposition-canvas.md) |
| 规划第二曲线增长 | [strategy/second-curve.md](./strategy/second-curve.md) |
| 设计产品路线图（Now/Next/Later） | [strategy/now-next-later-roadmap.md](./strategy/now-next-later-roadmap.md) |
| 查看我们的 AI 平台战略实例 | [strategy/product-strategy-instance.md](./strategy/product-strategy-instance.md) |

### 行业情报

| 我想要... | 去这里 |
|---|---|
| 分析竞争对手 | [industry/competitors/competitor-analysis.md](./industry/competitors/competitor-analysis.md) |
| 绘制 LLM 供应商格局 | [industry/competitors/llm-vendor-landscape.md](./industry/competitors/llm-vendor-landscape.md) |
| 追踪 SaaS 头部玩家 | [industry/competitors/saas-top-players.md](./industry/competitors/saas-top-players.md) |
| 查看区域竞争对手 | [industry/competitors/regional-competitors.md](./industry/competitors/regional-competitors.md) |
| 分析 AI BRD 竞品 | [industry/competitors/ai-brd-competitors.md](./industry/competitors/ai-brd-competitors.md) |
| 阅读 2026 年上半年 AI 市场趋势 | [industry/market-trends/ai-market-trend-first-half.md](./industry/market-trends/ai-market-trend-first-half.md) |
| 进行半年度回顾 | [industry/market-trends/half-year-retrospective.md](./industry/market-trends/half-year-retrospective.md) |
| 追踪新兴领域 | [industry/market-trends/emerging-sector-tracking.md](./industry/market-trends/emerging-sector-tracking.md) |
| 观察区域市场 | [industry/market-trends/regional-market-observation.md](./industry/market-trends/regional-market-observation.md) |
| 阅读 Gartner AI 技术成熟度曲线 | [industry/reports/gartner-ai-hype-cycle.md](./industry/reports/gartner-ai-hype-cycle.md) |
| 阅读 McKinsey AI 报告 | [industry/reports/mckinsey-ai-report.md](./industry/reports/mckinsey-ai-report.md) |
| 阅读 a16z AI 展望 | [industry/reports/a16z-ai-outlook.md](./industry/reports/a16z-ai-outlook.md) |
| 阅读 CAICT AI 白皮书 | [industry/reports/caict-ai-whitepaper.md](./industry/reports/caict-ai-whitepaper.md) |
| 阅读 IDC 客服报告 | [industry/reports/idc-customer-service.md](./industry/reports/idc-customer-service.md) |
| 阅读 AI 行业报告 | [industry/reports/ai-industry-report.md](./industry/reports/ai-industry-report.md) |

### 组织规划

| 我想要... | 去这里 |
|---|---|
| 进行年度战略规划 | [roadmap/annual-strategic-planning.md](./roadmap/annual-strategic-planning.md) |
| 进行季度业务评审 | [roadmap/quarterly-business-review.md](./roadmap/quarterly-business-review.md) |
| 建立组织级 OKR 追踪 | [roadmap/org-okr-tracking.md](./roadmap/org-okr-tracking.md) |
| 规划人员编制和预算 | [roadmap/headcount-budget-planning.md](./roadmap/headcount-budget-planning.md) |

### 学习资源

| 我想要... | 去这里 |
|---|---|
| 浏览月度阅读清单 | [reading-list/reading-list.md](./reading-list/reading-list.md) |
| 使用读书笔记模板 | [reading-list/reading-notes.md](./reading-list/reading-notes.md) |
| 阅读《High Output Management》笔记 | [reading-list/reading-note-high-output-management.md](./reading-list/reading-note-high-output-management.md) |

### 合规与风险

| 我想要... | 去这里 |
|---|---|
| 处理监管变更 | [strategy/handle-a-regulatory-change.md](./strategy/handle-a-regulatory-change.md) |
| 规划数据合规策略 | [strategy/handle-data-compliance.md](./strategy/handle-data-compliance.md) |
| 进行数据留存审查 | [strategy/do-a-data-retention-review.md](./strategy/do-a-data-retention-review.md) |

## 交叉引用

### 委托给其他角色
- [../producter/strategy/](../producter/strategy/) — 产品战略和竞争定位
- [../leader/roadmap/](../leader/roadmap/) — 技术路线图和工程规划
- [../leader/decisions/](../leader/decisions/) — 架构决策
- [../engineer/](../engineer/) — 实施和工程实践
- [../srer/](../srer/) — 事故响应和运维卓越

### 场景入口（其他角色 → executiver）
- [../engineer/run/understand-competitors.md](../engineer/run/understand-competitors.md) — 工程师学习竞争对手分析
- [../aier/机器学习/find-ai-deployment-cases.md](../aier/机器学习/find-ai-deployment-cases.md) — AI 工程师寻找部署案例
- [../curator/diagrams/knowledge-map.md](../curator/diagrams/knowledge-map.md) — 整个知识库的知识地图

### 治理
- [../curator/治理/inbox.md](../curator/治理/inbox.md) — 新内容通过 inbox 进入后再分类
- [../MEMORY.md](../MEMORY.md) — 知识库全局归档原则和 YAML 规范

## Pipeline flow

```
┌── executiver/ (Business Strategy — cross-cutting) ──┐
│  Output: market-intel, org-strategy, reading-list     │
└──────────────────────────────────────────────────────┘
    │ market-intel, org-strategy
    ▼
producter/ (Stage 1: Requirements)
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
- [business-model-canvas.md](./strategy/business-model-canvas.md) → [../producter/discovery/write-a-prd.md](../producter/discovery/write-a-prd.md) — 战略输入到 PRD
- [product-strategy-framework.md](./strategy/product-strategy-framework.md) → [../producter/strategy/ai-customer-service-cases.md](../producter/strategy/ai-customer-service-cases.md) — 战略驱动产品案例
- [competitor-analysis.md](./industry/competitors/competitor-analysis.md) → [../leader/架构/tl-tech-selection-llm-provider.md](../leader/架构/tl-tech-selection-llm-provider.md) — 市场情报影响技术选型
- [org-okr-tracking.md](./roadmap/org-okr-tracking.md) → [../leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md) — 业务 OKR 级联到技术 SLO
- [headcount-budget-planning.md](./roadmap/headcount-budget-planning.md) → [../leader/capacity/run-a-finops-review.md](../leader/capacity/run-a-finops-review.md) — 预算规划驱动 FinOps

## 维护

- **每月**：扫描 [industry/](./industry/) 的 `last_verified` 时间戳；超过 6 个月的条目 → 标记 `status: deprecated`
- **每季度**：审查所有战略框架的相关性；用新出版物更新 [reading-list](./reading-list/)
- **每半年**：执行 [half-year-retrospective.md](./industry/market-trends/half-year-retrospective.md) 并归档过时的市场观察
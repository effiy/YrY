---
title: 高管
tags: [leaf, executiver, strategy, industry, roadmap, reading-list]
category: executiver
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-09-10
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
> 高管角色提供业务上下文。高管不定义产品战略（委托给 [producter/](../producter/)）、不做技术决策（委托给 [leader/](../leader/)）、不实施任何东西（委托给 [engineer/](../engineer/)）。

## 流水线芯片合同

| 芯片 | 类型 | 描述 | 知识区域 |
|---|---|---|---|
| `market-intel` | 输出 | 市场趋势、竞争格局、行业报告 | [industry/](./industry/) |
| `org-strategy` | 输出 | 业务战略框架、组织设计、竞争定位 | [strategy/](./strategy/) |
| `reading-list` | 输出 | 精选高管阅读材料及提炼洞察 | [reading-list/](./reading-list/) |

## 范围

### 范围内（高管角色负责）

**`market-intel` 芯片：**
- 市场趋势分析和半年度回顾 → [industry/market-trends/](./industry/market-trends/)
- 竞争对手分析和格局地图 → [industry/competitors/](./industry/competitors/)
- 第三方行业报告摘要（Gartner、McKinsey、a16z、CAICT、IDC） → [industry/reports/](./industry/reports/)

**`org-strategy` 芯片：**
- 业务和企业战略框架（Porter 五力、蓝海战略、VRIO、SWOT） → [strategy/](./strategy/)
- 商业模式设计和价值主张 → [strategy/02-战略-商业模式画布.md](./strategy/02-战略-商业模式画布.md)
- 组织路线图和战略规划（年度、季度、OKR） → [roadmap/](./roadmap/)
- 人员编制和预算规划 → [roadmap/02-路线图-人员预算规划.md](./roadmap/02-路线图-人员预算规划.md)
- 监管合规和数据留存策略 → [strategy/04-战略-处理监管变更.md](./strategy/04-战略-处理监管变更.md)

**`reading-list` 芯片：**
- 月度精选阅读清单，滚动更新 → [reading-list/01-阅读-阅读清单.md](./reading-list/01-阅读-阅读清单.md)
- 高管读书笔记，含可操作收获 → [reading-list/02-阅读-读书笔记-高产出管理.md](./reading-list/02-阅读-读书笔记-高产出管理.md)

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

| 当内容涉及... | 路由到 | 原因 |
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

| 领域 | 解决的问题 | 内容 |
|---|---|---|
| [strategy/](./strategy/) | 如何定义和传达业务战略？ | 14 个文件：战略框架（Porter 五力、蓝海战略、VRIO、SWOT）、商业模式画布、价值主张、产品战略实例、监管合规 |
| [industry/](./industry/) | 市场和竞争对手在发生什么？ | 19 个文件：竞争对手分析（LLM 供应商、SaaS、区域）、市场趋势（上半年回顾、新兴领域）、行业报告（Gartner、McKinsey、a16z、CAICT、IDC） |
| [roadmap/](./roadmap/) | 我们的组织规划和发展方向是什么？ | 5 个文件：年度战略规划、季度业务评审、OKR 追踪、人员编制/预算规划 |
| [reading-list/](./reading-list/) | 我应该读什么来保持信息灵通？ | 4 个文件：月度阅读清单、读书笔记、书籍摘要 |
| [./okr/2026-Q3/](./okr/2026-Q3/) | 我们的 Q3 目标和指标是什么？ | 14 个文件：3 个目标、5 个指标、11 个 KR 证据文件 |

## 快速参考

### 战略框架

| 我想要... | 去这里 |
|---|---|
| 定义产品战略 | [strategy/08-战略-产品战略框架.md](./strategy/08-战略-产品战略框架.md) |
| 设计商业模式 | [strategy/02-战略-商业模式画布.md](./strategy/02-战略-商业模式画布.md) |
| 分析竞争力量 | [strategy/07-战略-波特五力模型.md](./strategy/07-战略-波特五力模型.md) |
| 发现蓝海机会 | [strategy/01-战略-蓝海战略.md](./strategy/01-战略-蓝海战略.md) |
| 评估内部能力（VRIO） | [strategy/12-战略-VRIO框架.md](./strategy/12-战略-VRIO框架.md) |
| 进行 SWOT 分析 | [strategy/10-战略-SWOT分析.md](./strategy/10-战略-SWOT分析.md) |
| 绘制客户价值 | [strategy/11-战略-价值主张画布.md](./strategy/11-战略-价值主张画布.md) |
| 规划第二曲线增长 | [strategy/09-战略-第二曲线.md](./strategy/09-战略-第二曲线.md) |
| 设计产品路线图（Now/Next/Later） | [strategy/06-战略-Now-Next-Later路线图.md](./strategy/06-战略-Now-Next-Later路线图.md) |
| 查看我们的 AI 平台战略实例 | [strategy/08-战略-产品战略框架.md](./strategy/08-战略-产品战略框架.md) |

### 行业情报

| 我想要... | 去这里 |
|---|---|
| 分析竞争对手 | [industry/competitors/01-行业-竞品分析模板.md](./industry/competitors/01-行业-竞品分析模板.md) |
| 绘制 LLM 供应商格局 | [industry/competitors/](./industry/competitors/) |
| 追踪 SaaS 头部玩家 | [industry/competitors/](./industry/competitors/) |
| 查看区域竞争对手 | [industry/competitors/](./industry/competitors/) |
| 分析 AI 竞品 | [industry/competitors/](./industry/competitors/) |
| 阅读 2026 年上半年 AI 市场趋势 | [industry/market-trends/](./industry/market-trends/) |
| 进行半年度回顾 | [industry/market-trends/](./industry/market-trends/) |
| 追踪新兴领域 | [industry/market-trends/](./industry/market-trends/) |
| 观察区域市场 | [industry/market-trends/](./industry/market-trends/) |
| 阅读 Gartner AI 技术成熟度曲线 | [industry/reports/](./industry/reports/) |
| 阅读 McKinsey AI 报告 | [industry/reports/](./industry/reports/) |
| 阅读 a16z AI 展望 | [industry/reports/](./industry/reports/) |
| 阅读 CAICT AI 白皮书 | [industry/reports/](./industry/reports/) |
| 阅读 IDC 客服报告 | [industry/reports/](./industry/reports/) |
| 阅读 AI 行业报告 | [industry/reports/](./industry/reports/) |

### 组织规划

| 我想要... | 去这里 |
|---|---|
| 进行年度战略规划 | [roadmap/01-路线图-年度战略规划.md](./roadmap/01-路线图-年度战略规划.md) |
| 进行季度业务评审 | [roadmap/04-路线图-季度业务回顾.md](./roadmap/04-路线图-季度业务回顾.md) |
| 建立组织级 OKR 追踪 | [roadmap/03-路线图-组织OKR追踪.md](./roadmap/03-路线图-组织OKR追踪.md) |
| 规划人员编制和预算 | [roadmap/02-路线图-人员预算规划.md](./roadmap/02-路线图-人员预算规划.md) |

### 学习资源

| 我想要... | 去这里 |
|---|---|
| 浏览月度阅读清单 | [reading-list/01-阅读-阅读清单.md](./reading-list/01-阅读-阅读清单.md) |
| 使用读书笔记模板 | [reading-list/03-阅读-读书笔记汇总.md](./reading-list/03-阅读-读书笔记汇总.md) |
| 阅读《High Output Management》笔记 | [reading-list/02-阅读-读书笔记-高产出管理.md](./reading-list/02-阅读-读书笔记-高产出管理.md) |

### 合规与风险

| 我想要... | 去这里 |
|---|---|
| 处理监管变更 | [strategy/04-战略-处理监管变更.md](./strategy/04-战略-处理监管变更.md) |
| 规划数据合规策略 | [strategy/05-战略-数据合规处理.md](./strategy/05-战略-数据合规处理.md) |
| 进行数据留存审查 | [strategy/03-战略-数据留存审查.md](./strategy/03-战略-数据留存审查.md) |

## 交叉引用

### 委托给其他角色
- [../producter/strategy/](../producter/strategy/) — 产品战略和竞争定位
- [../leader/roadmap/](../leader/roadmap/) — 技术路线图和工程规划
- [../leader/decisions/](../leader/decisions/) — 架构决策
- [../engineer/](../engineer/) — 实施和工程实践
- [../srer/](../srer/) — 事故响应和运维卓越

### 场景入口（其他角色 → 高管角色）
- [../engineer/run/understand-competitors.md](../engineer/run/understand-competitors.md) — 工程师学习竞争对手分析
- [../aier/machine-learning/find-ai-deployment-cases.md](../aier/machine-learning/find-ai-deployment-cases.md) — AI 工程师寻找部署案例
- [../curator/diagrams/knowledge-map.md](../curator/diagrams/knowledge-map.md) — 整个知识库的知识地图

### 治理
- [../curator/治理/inbox.md](../curator/治理/inbox.md) — 新内容通过 inbox 进入后再分类
- [../MEMORY.md](../MEMORY.md) — 知识库全局归档原则和 YAML 规范

## 流水线流程

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
- [strategy/02-战略-商业模式画布.md](./strategy/02-战略-商业模式画布.md) → [../producter/discovery/write-a-prd.md](../producter/discovery/write-a-prd.md) — 战略输入到 PRD
- [strategy/08-战略-产品战略框架.md](./strategy/08-战略-产品战略框架.md) → [../producter/strategy/ai-customer-service-cases.md](../producter/strategy/ai-customer-service-cases.md) — 战略驱动产品案例
- [industry/competitors/01-行业-竞品分析模板.md](./industry/competitors/01-行业-竞品分析模板.md) → [../leader/架构/tl-tech-selection-llm-provider.md](../leader/架构/tl-tech-selection-llm-provider.md) — 市场情报影响技术选型
- [roadmap/03-路线图-组织OKR追踪.md](./roadmap/03-路线图-组织OKR追踪.md) → [../leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md) — 业务 OKR 级联到技术 SLO
- [roadmap/02-路线图-人员预算规划.md](./roadmap/02-路线图-人员预算规划.md) → [../leader/capacity/run-a-finops-review.md](../leader/capacity/run-a-finops-review.md) — 预算规划驱动 FinOps

## 使用策略

### 何时使用高管角色知识

| 场景 | 推荐入口 | 产出 |
|---|---|---|
| 季度战略规划启动 | [roadmap/04-路线图-季度业务回顾.md](./roadmap/04-路线图-季度业务回顾.md) | QBR 议程、决策日志 |
| 新市场进入评估 | [strategy/07-战略-波特五力模型.md](./strategy/07-战略-波特五力模型.md) + [strategy/01-战略-蓝海战略.md](./strategy/01-战略-蓝海战略.md) | 行业吸引力评级 + 蓝海机会 |
| 年度预算编制 | [roadmap/02-路线图-人员预算规划.md](./roadmap/02-路线图-人员预算规划.md) | 四桶分配模型 + 预算情景 |
| 监管新规响应 | [strategy/04-战略-处理监管变更.md](./strategy/04-战略-处理监管变更.md) | 影响评估、适应计划 |
| 竞品动态跟踪 | [industry/competitors/](./industry/competitors/) | 竞品分析报告 |
| 阅读规划 | [reading-list/01-阅读-阅读清单.md](./reading-list/01-阅读-阅读清单.md) | 月度阅读计划 |

## 最佳实践

### 战略框架使用原则
- **不孤立使用**：单个框架只给出局部视角。组合使用 SWOT + VRIO + P5F 才能形成全景。
- **先分析后合成**：先用各框架完成独立分析，再用 [产品战略框架](./strategy/08-战略-产品战略框架.md) 将结果合成为统一战略。
- **有证据支撑**：每个评级和判断必须有具体数据或事实依据，不能靠直觉猜测。
- **定期刷新**：行业结构变化、内部能力变化、监管环境变化都会使框架结论失效。

### 反模式警示
- **分析瘫痪**：花太多时间做框架分析而不做决策。任何分析若不能在 2 周内产出 3 个行动项，就是浪费。
- **唯框架论**：战略框架是工具而非目标。如果某个框架的结论显而易见，不需要为了"完整"而强行填完所有格。
- **静止快照**：把分析当作一劳永逸的工作。市场和竞争格局变化极快，尤其在 AI 领域。
- **闭门造车**：仅由高管团队完成分析，不与一线团队交叉验证。工程师、销售、客服的输入至关重要。

## 维护

- **每月**：扫描 [industry/](./industry/) 的 `last_verified` 时间戳；超过 6 个月的条目 → 标记 `status: deprecated`
- **每季度**：审查所有战略框架的相关性；用新出版物更新 [reading-list](./reading-list/)
- **每半年**：执行半年度回顾并归档过时的市场观察
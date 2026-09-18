---
title: 技术负责人 — 架构决策 / 技术选型 / 容量规划 / 路线图 / 风险管理工作区
aliases: [leader-readme, leader-index]
tags: [category, leader, architecture, adr, capacity, roadmap, risk]
category: leader
created: 2026-08-05
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: monthly
roles: [leader, engineer, aier]
benefit: "架构决策 / ADR / 技术选型 / 容量规划 / 路线图 / 风险登记册集中管理；跨子项目技术决策可追溯"
acceptance_criteria:
  - "叶子目录范围边界清晰"
  - "文件清单表完整，包含一句话描述"
  - "包含与相关叶子目录和父级 INDEX 的交叉引用"
related:
  - ../INDEX.md
  - ../README.md
  - ../engineer/ship/README.md
  - ./INDEX.md
---

# 技术负责人 — 架构决策 / 技术选型 / 容量 / 路线图 / 风险工作区

> **流水线阶段 2/5：决策** — 输入芯片：`PRDs`、`requirements` → 输出芯片：`ADRs`、`tech selections`、`capacity plans`
>
> **作为**技术负责人，**我想要**理解并应用技术负责人 — 架构决策 / 技术选型 / 容量 / 路线图 / 风险工作区，**以便**跨项目技术决策可追溯，新负责人无需重新推导已有结论。
>
> Leader 决策技术方向。Leader 不实现模式（→ [engineer/](../engineer/)）、不响应事故（→ [srer/](../srer/)）、不定义产品需求（→ [producter/](../producter/)）。

## Pipeline chip contract

| Chip | Type | Description | Knowledge area |
|---|---|---|---|
| PRDs | ← Input | 来自 producter/ 的产品需求文档 | [producter/discovery/prd/](../producter/discovery/prd/) |
| requirements | ← Input | 功能和非功能需求 | [producter/discovery/](../producter/discovery/) |
| `adrs` | Output → | 架构决策记录 — 上下文/决策/后果 | [decisions/](./decisions/), [architecture/](./architecture/) |
| `tech-selections` | Output → | 技术栈评估、对比矩阵 | [architecture/](./architecture/), [roadmap/](./roadmap/) |
| `capacity-plans` | Output → | 容量规划、FinOps 审查、基础设施规模估算 | [capacity/](./capacity/), [roadmap/](./roadmap/) |

## 子目录（按流水线芯片）

| Chip | Domain | Content | Files |
|---|---|---|---|
| `adrs` | [architecture/](./architecture/) | 架构决策、技术选型、战略规划、设计标准、质量保障、运维策略 | 26 |
| `adrs` | [decisions/](./decisions/) | 按项目组织的 ADR：YiAi (5)、YiVad (3)、YiPet (6) | 14 |
| `adrs` | [risk/](./risk/) | 上线评估、事后复盘、风险登记册、依赖风险、事故指挥、安全审查、Runbook、灾难恢复 | 8 |
| `capacity-plans` | [capacity/](./capacity/) | FinOps、成本追踪、依赖审计、自研vs采购、规模估算、预算规划 | 6 |
| `tech-selections`, `capacity-plans` | [roadmap/](./roadmap/) | 看板、SLO、技术债量化、选型、PoC、路线图、审查、沟通、节奏、估算、委托、入职、反馈、获得支持、状态报告、健康检查 | 20 |
| `goals` | [okr/](./okr/) | Q3 已完成 + Q4 进行中（含 KR 追踪文档 + 撰写指南） | 6 |

## 范围

### 范围内（leader 负责）

**`adrs` 芯片：**
- 包含权衡和后果的架构决策（ADR） → [decisions/](./decisions/)
- 架构决策框架、成熟度模型 → [architecture/](./architecture/)
- 风险登记册和事前风险评估 → [risk/](./risk/)
- 跨项目技术决策对齐

**`tech-selections` 芯片：**
- 技术选型和供应商评估决策 → [architecture/](./architecture/)
- 技术路线图和季度规划 → [roadmap/](./roadmap/)

**`capacity-plans` 芯片：**
- 容量规划和 FinOps 策略 → [capacity/](./capacity/)
- SLO 定义和基础设施规模估算 → [roadmap/](./roadmap/)

### 范围外（委托给其他角色）
- 实现模式和操作指南 → **[engineer/](../engineer/)**
- 事故响应流程 → **[srer/incident-response/](../srer/incident-response/)**
- 事后复盘记录 → **[srer/incident-response/](../srer/incident-response/)**（leader/risk/ 有方法论，srer/ 有实际复盘报告）
- 成本监控和仪表盘 → **[srer/observability/](../srer/observability/)**
- 产品需求和 PRD → **[producter/discovery/](../producter/discovery/)**
- 业务战略和市场分析 → **[executiver/](../executiver/)**

## 边界情况决策规则

| 当内容涉及... | Chip | Route to | Because |
|---|---|---|---|
| ADR（为什么选择 X 而非 Y） | `adrs` | [leader/decisions/](./decisions/) | 包含权衡的决策 |
| 如何实现 X 模式 | `architecture-patterns` | [engineer/build/](../engineer/build/) | 实现知识 |
| 技术选型评估 | `tech-selections` | [leader/architecture/](./architecture/) | 战略性技术选择 |
| 事前风险评估 | `adrs` | [leader/risk/](./risk/) | 主动风险管理 |
| 事中事故响应 | `incident-response` | [srer/incident-response/](../srer/incident-response/) | 运维流程 |
| 事后复盘记录 | `postmortems` | [srer/incident-response/](../srer/incident-response/) | 运维记录 |
| 事后复盘方法论 | `adrs` | [leader/risk/](./risk/) | 方法论归 leader |
| 容量规划（多少资源、多少成本） | `capacity-plans` | [leader/capacity/](./capacity/) | 战略规划 |
| 容量监控（当前使用量） | `observability` | [srer/observability/](../srer/observability/) | 运维监控 |
| 技术路线图（何时用什么技术） | `tech-selections` | [leader/roadmap/](./roadmap/) | 技术领导力 |
| 业务路线图（什么业务目标） | — | [executiver/roadmap/](../executiver/roadmap/) | 业务领导力 |
| 依赖风险评估 | `adrs` | [leader/risk/](./risk/) | 风险管理 |

## 子目录描述

### architecture/
架构决策框架、技术选型评估和成熟度评估。包含 ADR 12 节模板、DORA 指标基线、架构成熟度/文档成熟度评估、LLM 提供商和 React 状态管理技术选型参考、YiVad 测试框架技术债务追踪。

关键文件：
- [01-架构决策设计](./architecture/01-架构-架构决策设计.md) — ADR 框架和 12 节模板
- [02-DORA指标基线](./architecture/02-架构-DORA指标-2026-Q2基线.md) — 交付能力基线
- [03-架构成熟度模型](./architecture/03-架构-架构成熟度模型-2026-08.md) — 各项目架构纪律评估
- [04-文档成熟度模型](./architecture/04-架构-文档成熟度模型-2026-08.md) — 文档体系评估
- [05-技术债-YiVad测试](./architecture/05-架构-技术债-YiVad缺少测试框架.md) — 测试框架技术债务
- [06-LLM提供商选型](./architecture/06-架构-技术选型-LLM提供商.md) — LLM 提供商选择标准
- [07-React状态管理选型](./architecture/07-架构-技术选型-React状态管理.md) — React 状态管理选择
- [08-技术战略-Q4方向](./architecture/08-架构-技术战略-2026-Q4方向.md) — Q4 技术战略和优先级
- [09-架构全景图](./architecture/09-架构-架构全景图.md) — 4 个子项目架构关系、数据流和关键决策
- [10-代码审查标准](./architecture/10-架构-代码审查标准.md) — 各项目的代码审查检查清单
- [README](./architecture/README.md) — 架构子目录导航（含场景索引）

### decisions/
按项目子目录组织的架构决策记录。每个 ADR 遵循 [architecture/01-架构决策设计](./architecture/01-架构-架构决策设计.md) 中的 12 节模板。

**YiAi（5 个 ADR）：** 知识监听器部署、LLM 多提供商上线、pytest 引入、RAG 评估基础设施、LLM 流量跨提供商路由

**YiVad（3 个 ADR）：** AiCR 移植、Vite 到 Rsbuild 迁移、Vitest 引入

**YiPet（6 个 ADR）：** AiCR 移植、Biome 代码检查与格式化、Chrome MV3 双世界架构、跨项目 Hub、四层 API 架构、React 18 + Ant Design 迁移

详见 [decisions/README.md](./decisions/README.md)

### capacity/
容量规划、成本追踪和 FinOps 审查。涵盖：FinOps 五步审查流程、成本归属标签、YiAi 专属成本优化、月度成本追踪模板。

关键文件：
- [01-FinOps审查](./capacity/01-容量-FinOps审查.md) — FinOps 审查方法论
- [02-成本追踪模板](./capacity/02-容量-成本追踪模板.md) — 月度成本追踪和季度汇总
- [03-依赖审计清单](./capacity/03-容量-依赖审计清单.md) — 季度依赖健康度审计
- [README](./capacity/README.md) — 容量子目录导航（含场景索引）

### risk/
风险登记册、上线前风险评估、事后复盘方法论和依赖风险管理。

关键文件：
- [01-上线风险评估](./risk/01-风险-上线风险评估.md) — 上线/不上线决策框架
- [02-事后复盘方法论](./risk/02-风险-事后复盘.md) — 无指责的事后复盘撰写指南
- [03-风险登记册模板](./risk/03-风险-风险登记册模板.md) — 风险持续追踪和优先级排序
- [04-依赖风险管理](./risk/04-风险-依赖风险管理.md) — 依赖风险识别、评估和缓解
- [05-事故指挥指南](./risk/05-风险-事故指挥指南.md) — 事故中技术负责人的角色和决策框架
- [06-安全审查清单](./risk/06-风险-安全审查清单.md) — 上线前/季度安全检查 15 项
- [README](./risk/README.md) — 风险子目录导航（含场景索引）

### roadmap/
路线图规划、技术债务管理、技术选型、PoC 验证、SLO 定义、功能废弃、服务下线和季度审查。

关键文件：
- [01-进度看板](./roadmap/01-路线图-进度看板.md) — 路线图进度追踪仪表盘
- [03-定义SLO](./roadmap/03-路线图-定义SLO.md) — SLO/SLI/错误预算定义指南
- [07-技术选型](./roadmap/07-路线图-技术选型.md) — 加权标准评估流程
- [08-管理技术债](./roadmap/08-路线图-管理技术债.md) — 技术债务管理框架
- [09-规划技术路线图](./roadmap/09-路线图-规划技术路线图.md) — 季度工程路线图规划
- [10-Q4预览](./roadmap/10-路线图-审查-2026-Q4预览.md) — 2026 Q4 路线图预览
- [11-季度审查流程](./roadmap/11-路线图-季度审查流程.md) — 季度审查四阶段流程
- [12-利益相关者沟通](./roadmap/12-路线图-利益相关者沟通.md) — 向上/向外/向内沟通方法
- [13-运营节奏](./roadmap/13-路线图-运营节奏.md) — 技术负责人时间管理节奏
- [14-估算指南](./roadmap/14-路线图-估算指南.md) — 工程工作量估算方法
- [README](./roadmap/README.md) — 路线图子目录导航（含场景索引）
- [00-INDEX](./roadmap/00-INDEX.md) — 路线图目录索引

### okr/
技术团队 OKR 追踪。包含 OKR 撰写指南、评分标准和季度组织方式。

关键文件：
- [README](./okr/README.md) — OKR 追踪和撰写指南
- [2026-Q3/lead-001](./okr/2026-Q3/lead-001-technical-review-loop/goal.md) — 技术评审可闭环（已完成）

## 核心观点

- **ADR 是决策的唯一真实来源** — 编写 ADR 不是文档负担，而是给"将来不会重新推导的审查者"的礼物；每个 ADR 包含 Context / Decision / Consequences
- **容量规划与 FinOps 挂钩** — leader 不仅决策技术，还决策成本上限；与 [srer/observability/](../srer/observability/) 联动进行监控
- **路线图是承诺** — 季度路线图是 leader 对 PM/executiver 的承诺；不得静默变更；季度审查确保路线图与实际一致
- **风险登记册前置** — 事后复盘是事后行为；事前风险评估归入 `risk/`，事后回顾归入 [srer/incident-response/](../srer/incident-response/)
- **方法论与记录分离** — leader/ 放方法论（怎么做），srer/ 放记录（实际做了什么）。不混淆两者

## 常用参考

- [01-架构决策设计](./architecture/01-架构-架构决策设计.md) — ADR 框架和 12 节模板
- [02-事后复盘方法论](./risk/02-风险-事后复盘.md) — 事后复盘撰写方法论
- [07-技术选型](./roadmap/07-路线图-技术选型.md) — 技术选型流程
- [05-容量规划](./roadmap/05-路线图-容量规划.md) — 容量规划方法论
- [01-FinOps审查](./capacity/01-容量-FinOps审查.md) — FinOps 审查方法论
- [08-管理技术债](./roadmap/08-路线图-管理技术债.md) — 技术债务管理框架
- [04-依赖风险管理](./risk/04-风险-依赖风险管理.md) — 依赖风险管理
- [03-定义SLO](./roadmap/03-路线图-定义SLO.md) — SLO 定义指南
- [11-季度审查流程](./roadmap/11-路线图-季度审查流程.md) — 季度审查四阶段流程
- [12-利益相关者沟通](./roadmap/12-路线图-利益相关者沟通.md) — 利益相关者沟通方法
- [13-运营节奏](./roadmap/13-路线图-运营节奏.md) — 技术负责人时间管理
- [03-风险登记册模板](./risk/03-风险-风险登记册模板.md) — 风险持续追踪
- [05-事故指挥指南](./risk/05-风险-事故指挥指南.md) — 事故中 IC 角色和决策框架
- [02-成本追踪模板](./capacity/02-容量-成本追踪模板.md) — 月度成本追踪
- [03-依赖审计清单](./capacity/03-容量-依赖审计清单.md) — 季度依赖健康度检查
- [10-代码审查标准](./architecture/10-架构-代码审查标准.md) — 各项目的代码审查检查清单

## 行动建议

1. **新决策走 ADR 流程**：使用 [ADR 模板](./architecture/01-架构-架构决策设计.md) 作为起点；落在 `decisions/<project>/` 目录
2. **路线图每季度同步**：任何路线图变更必须通过 [季度审查流程](./roadmap/11-路线图-季度审查流程.md) 更新 + 通知 PM/executiver
3. **风险前置登记**：通过 [风险登记册模板](./risk/03-风险-风险登记册模板.md) 识别新风险；每月审查更新
4. **容量评估联动 FinOps**：新服务上线前必须通过 [capacity/](./capacity/) 评估 + [成本追踪](./capacity/02-容量-成本追踪模板.md) 设置基准
5. **每月成本检查**：使用 [成本追踪模板](./capacity/02-容量-成本追踪模板.md) 记录月度成本，季度汇总汇报
6. **依赖每季度审计**：使用 [依赖风险管理](./risk/04-风险-依赖风险管理.md) 的检查清单

## 反模式

- **静默变更路线图** — 后果：PM/executiver 失去信任；路线图是承诺，变更必须通过季度审查同步
- **ADR 写了但不维护** — 后果：决策上下文丢失；后续审查者重新推导已废弃的方案
- **事后复盘未登记为风险** — 后果：同类故障重复发生；事后必须更新 [风险登记册](./risk/03-风险-风险登记册模板.md)
- **省略容量评估** — 后果：上线后成本超支；必须执行 [capacity/](./capacity/) 评估 + 设置上限
- **方法论和记录混放** — 后果：leader/ 变成杂物堆；方法论放 leader/，记录放 srer/ 或 engineer/

## 相关

- 同类（角色目录）：[../engineer/README.md](../engineer/README.md) / [../srer/README.md](../srer/README.md) / [../producter/README.md](../producter/README.md) / [../aier/README.md](../aier/README.md)
- 上游：[../README.md](../README.md) / [../INDEX.md](../INDEX.md)
- 角色索引：[./INDEX.md](./INDEX.md) — 完整文件列表及数量
- 速查卡：[./QUICKREF.md](./QUICKREF.md) — 按场景快速定位文件
- 子 README：[architecture/README.md](./architecture/README.md) / [capacity/README.md](./capacity/README.md) / [decisions/README.md](./decisions/README.md) / [okr/README.md](./okr/README.md) / [risk/README.md](./risk/README.md) / [roadmap/README.md](./roadmap/README.md)

## Pipeline flow

```
producter/ (Stage 1: Requirements)
    │ prds, user-stories, priorities
    ▼
┌── leader/ (Stage 2: Decisions) ─────────┐
│  Input:  PRDs, requirements               │
│  Output: ADRs, tech selections, capacity  │
└──────────────────────────────────────────┘
    │ adrs, tech-selections, capacity-plans
    ▼
engineer/ (Stage 3: Design+Build)
    │ architecture-patterns, dev-practices
    ▼
srer/ (Stage 4+5: Quality+Release + Operate+Learn)
```
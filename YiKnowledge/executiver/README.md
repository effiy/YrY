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
- 业务和战略框架（Porter五力/蓝海/VRIO/SWOT/安索夫/BCG/JTBD等52个框架） → [strategy/](./strategy/)
- 商业模式设计和定价策略 → [strategy/02-战略-商业模式画布.md](./strategy/02-战略-商业模式画布.md)
- 组织路线图和年度/季度规划 → [roadmap/](./roadmap/)
- 组织诊断（7S）和文化设计 → [strategy/19-战略-7S框架.md](./strategy/19-战略-7S框架.md)
- 决策方法论（决策框架/情景规划/第一性原理） → [strategy/](./strategy/)
- 人才管理（招聘/反馈/继任/可持续节奏） → [strategy/](./strategy/)
- 工程管理（技术选型/技术债/工程效能） → [strategy/](./strategy/)
- 风险管理（六类风险×应对策略） → [strategy/42-战略-风险管理框架.md](./strategy/42-战略-风险管理框架.md)
- 高管沟通（战略叙事/董事会/危机/写作/干系人） → [strategy/](./strategy/)
- 监管合规和数据留存 → [strategy/04-战略-处理监管变更.md](./strategy/04-战略-处理监管变更.md)

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
| 数据合规实施 | [engineer/ship/](../engineer/ship/) | 工程执行 |
| 预算和人员编制规划 | [executiver/roadmap/](./roadmap/) | 业务规划 |
| 招聘和团队增长 | [leader/roadmap/](../leader/roadmap/) | 技术领导力 |

## 领域

| 领域 | 解决的问题 | 内容 |
|---|---|---|
| [strategy/](./strategy/) | 如何定义战略、做决策、管组织？ | 55 个文件：52 个框架 + README + INDEX — 覆盖 18 个维度 |
| [industry/](./industry/) | 市场和竞争对手在发生什么？ | 14 个文件：竞品分析（模板+格局+Cursor+Copilot）、报告（模板+AI趋势+Gartner）、市场趋势（模板+H1分析） |
| [roadmap/](./roadmap/) | 如何做组织规划和OKR追踪？ | 6 个文件：年度规划、预算规划、OKR追踪、季度回顾 |
| [reading-list/](./reading-list/) | 我应该读什么来保持信息灵通？ | 9 个文件：阅读清单 + 模板 + 5 篇读书笔记 + 跨书洞察 |
| [okr/2026-Q3/](./okr/2026-Q3/) | Q3 目标和指标进展如何？ | 20 个文件：3 个目标 + KR证据 + 目录README |
| [CHECKLIST.md](./CHECKLIST.md) | 需要快速对照检查清单？ | 1 个文件：周/月/季度/年度实战清单 |

## 如何使用本目录

**第一次来？** 按你的角色和场景选择入口：

| 场景 | 最快入口 | 预计时间 |
|---|---|---|
| 我要做季度/年度战略规划 | [strategy/README.md](./strategy/README.md) → 决策流程选择框架 | 10 分钟选框架，按框架深度 1-3 小时 |
| 我要分析一个竞品 | [industry/competitors/01-行业-竞品分析模板.md](./industry/competitors/01-行业-竞品分析模板.md) | 按模板填写，2-4 小时 |
| 我要设定公司 OKR | [strategy/15-战略-OKR方法论.md](./strategy/15-战略-OKR方法论.md) → [roadmap/03-路线图-组织OKR追踪.md](./roadmap/03-路线图-组织OKR追踪.md) | 方法论 30 分钟 + 撰写 2-3 小时 |
| 我面临一个困难决策 | [strategy/18-战略-高管决策框架.md](./strategy/18-战略-高管决策框架.md) | 15 分钟 |
| 我需要准备董事会/投资人沟通 | [strategy/17-战略-战略叙事框架.md](./strategy/17-战略-战略叙事框架.md) + [strategy/22-战略-董事会汇报准备.md](./strategy/22-战略-董事会汇报准备.md) | 叙事 1 小时 + 板材料 2-4 小时 |
| 我不知道该用什么框架 | [strategy/README.md](./strategy/README.md) → 决策流程图 | 5 分钟 |
| 我想系统学习高管技能 | [reading-list/01-阅读-阅读清单.md](./reading-list/01-阅读-阅读清单.md) | 按阅读节奏 |
| 我需要一份周/月/季度的实战检查清单 | [CHECKLIST.md](./CHECKLIST.md) | 5 分钟快速对照 |

**浏览全部内容**：从 [INDEX.md](./INDEX.md) 开始——按角色和场景的完整导航。

## 快速参考

### 战略框架（按场景分类）

**分析与定位：**
| 我想要... | 去这里 |
|---|---|
| 了解行业结构 | [07-波特五力模型](./strategy/07-战略-波特五力模型.md) |
| 分析内外部状况 | [10-SWOT分析](./strategy/10-战略-SWOT分析.md) |
| 评估可持续优势 | [12-VRIO框架](./strategy/12-战略-VRIO框架.md) |
| 找到无竞争空间 | [01-蓝海战略](./strategy/01-战略-蓝海战略.md) |
| 理解客户待办任务 | [21-JTBD框架](./strategy/21-战略-JTBD框架.md) |

**商业模式与增长：**
| 我想要... | 去这里 |
|---|---|
| 设计商业模式 | [02-商业模式画布](./strategy/02-战略-商业模式画布.md) |
| 绘制客户价值 | [11-价值主张画布](./strategy/11-战略-价值主张画布.md) |
| 选择增长方向 | [13-安索夫矩阵](./strategy/13-战略-安索夫矩阵.md) |
| 分配业务线资源 | [16-BCG矩阵](./strategy/16-战略-BCG矩阵.md) |
| 规划第二曲线 | [09-第二曲线](./strategy/09-战略-第二曲线.md) |
| 设计定价策略 | [29-定价策略](./strategy/29-战略-定价策略.md) |

**执行与落地：**
| 我想要... | 去这里 |
|---|---|
| 合成统一战略 | [08-产品战略框架](./strategy/08-战略-产品战略框架.md) |
| 设定 OKR 目标 | [15-OKR方法论](./strategy/15-战略-OKR方法论.md) |
| 建立多维指标 | [14-平衡计分卡](./strategy/14-战略-平衡计分卡.md) |
| 设计产品路线图 | [06-Now-Next-Later](./strategy/06-战略-Now-Next-Later路线图.md) |
| 年度战略规划 | [roadmap/01](./roadmap/01-路线图-年度战略规划.md) |
| 季度业务评审 | [roadmap/04](./roadmap/04-路线图-季度业务回顾.md) |

**组织与人才：**
| 我想要... | 去这里 |
|---|---|
| 诊断组织一致性 | [19-7S框架](./strategy/19-战略-7S框架.md) |
| 设计组织文化 | [34-文化设计](./strategy/34-战略-文化设计.md) |
| 招聘关键人才 | [27-高管招聘框架](./strategy/27-战略-高管招聘框架.md) |
| 降低关键人依赖 | [38-继任规划](./strategy/38-战略-继任规划.md) |
| 委托和授权 | [20-委托授权框架](./strategy/20-战略-委托授权框架.md) |
| 给予和接收反馈 | [35-反馈与困难对话](./strategy/35-战略-反馈与困难对话.md) |

**决策与思维：**
| 我想要... | 去这里 |
|---|---|
| 做高质量决策 | [18-高管决策框架](./strategy/18-战略-高管决策框架.md) |
| 突破惯性思维 | [33-第一性原理](./strategy/33-战略-第一性原理.md) |
| 高不确定性下规划 | [23-情景规划](./strategy/23-战略-情景规划.md) |
| 自建 vs 采购 | [26-自建vs采购](./strategy/26-战略-自建vs采购.md) |
| 谈判合作/资源 | [30-谈判框架](./strategy/30-战略-谈判框架.md) |

**沟通与影响力：**
| 我想要... | 去这里 |
|---|---|
| 撰写战略叙事 | [17-战略叙事框架](./strategy/17-战略-战略叙事框架.md) |
| 准备董事会汇报 | [22-董事会汇报准备](./strategy/22-战略-董事会汇报准备.md) |
| 危机沟通 | [24-危机沟通框架](./strategy/24-战略-危机沟通框架.md) |
| 提升写作影响力 | [36-高管写作](./strategy/36-战略-高管写作.md) |
| 管理和影响干系人 | [32-干系人管理](./strategy/32-战略-干系人管理.md) |
| 管理会议时间 | [28-高管会议管理](./strategy/28-战略-高管会议管理.md) |

**竞争、风险与可持续：**
| 我想要... | 去这里 |
|---|---|
| 响应竞品动作 | [37-竞争响应策略](./strategy/37-战略-竞争响应策略.md) |
| 评估平台化潜力 | [25-平台战略](./strategy/25-战略-平台战略.md) |
| 管理创新组合 | [31-创新组合管理](./strategy/31-战略-创新组合管理.md) |
| 系统管理风险 | [42-风险管理框架](./strategy/42-战略-风险管理框架.md) |
| 管理技术债 | [40-技术债策略](./strategy/40-战略-技术债策略.md) |
| 建立复盘文化 | [39-复盘与组织学习](./strategy/39-战略-复盘与组织学习.md) |
| 保持可持续节奏 | [41-可持续节奏](./strategy/41-战略-可持续节奏.md) |

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
| 追踪市场趋势和新兴赛道 | [industry/market-trends/](./industry/market-trends/) |
| 观察区域市场 | [industry/market-trends/](./industry/market-trends/) |
| 阅读 Gartner AI 技术成熟度曲线 | [industry/reports/](./industry/reports/) |
| 阅读 McKinsey AI 报告 | [industry/reports/](./industry/reports/) |
| 阅读 a16z AI 展望 | [industry/reports/](./industry/reports/) |
| 阅读 CAICT AI 白皮书 | [industry/reports/](./industry/reports/) |
| 阅读 IDC 客服报告 | [industry/reports/](./industry/reports/) |
| 查看 AI 行业关键趋势（McKinsey/a16z/Gartner） | [industry/reports/02-行业-2026-AI行业关键趋势.md](./industry/reports/02-行业-2026-AI行业关键趋势.md) |
| 分析 AI 市场趋势（2026 H1） | [industry/market-trends/02-行业-2026H1-AI市场趋势分析.md](./industry/market-trends/02-行业-2026H1-AI市场趋势分析.md) |
| 分析 AI 开发工具竞品格局 | [industry/competitors/02-行业-AI开发工具竞品格局-2026H1.md](./industry/competitors/02-行业-AI开发工具竞品格局-2026H1.md) |
| Cursor 深度竞品分析 | [industry/competitors/03-行业-竞品分析-Cursor.md](./industry/competitors/03-行业-竞品分析-Cursor.md) |
| Copilot 深度竞品分析 | [industry/competitors/04-行业-竞品分析-Copilot.md](./industry/competitors/04-行业-竞品分析-Copilot.md) |
| 高管实战检查清单 | [CHECKLIST.md](./CHECKLIST.md) |
| 阅读 AI 行业报告 | [industry/reports/](./industry/reports/) |
| 分析 AI 技术成熟度（Gartner） | [industry/reports/03-行业-Gartner-2026-AI技术成熟度.md](./industry/reports/03-行业-Gartner-2026-AI技术成熟度.md) |

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
| 阅读《好战略坏战略》笔记 | [reading-list/04-阅读-读书笔记-好战略坏战略.md](./reading-list/04-阅读-读书笔记-好战略坏战略.md) |
| 阅读《创业维艰》笔记 | [reading-list/05-阅读-读书笔记-创业维艰.md](./reading-list/05-阅读-读书笔记-创业维艰.md) |
| 阅读《加速》笔记 | [reading-list/06-阅读-读书笔记-加速.md](./reading-list/06-阅读-读书笔记-加速.md) |
| 阅读《团队拓扑》笔记 | [reading-list/07-阅读-读书笔记-团队拓扑.md](./reading-list/07-阅读-读书笔记-团队拓扑.md) |

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
- [../engineer/run/01-运行-了解竞品.md](../engineer/run/01-运行-了解竞品.md) — 工程师学习竞争对手分析
- [../aier/machine-learning/01-机器学习-传统机器学习模式.md](../aier/machine-learning/01-机器学习-传统机器学习模式.md) — AI 工程师寻找部署案例
- [../curator/diagrams/03-图表-知识地图.md](../curator/diagrams/03-图表-知识地图.md) — 整个知识库的知识地图

### 治理
- [../curator/governance/03-治理-收件箱.md](../curator/governance/03-治理-收件箱.md) — 新内容通过收件箱进入后再分类
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
- [strategy/02-战略-商业模式画布.md](./strategy/02-战略-商业模式画布.md) → [../producter/discovery/01-发现-编写PRD.md](../producter/discovery/01-发现-编写PRD.md) — 战略输入到 PRD
- [strategy/08-战略-产品战略框架.md](./strategy/08-战略-产品战略框架.md) → [../producter/strategy/01-战略-AI客服案例.md](../producter/strategy/01-战略-AI客服案例.md) — 战略驱动产品案例
- [industry/competitors/01-行业-竞品分析模板.md](./industry/competitors/01-行业-竞品分析模板.md) → [../leader/architecture/06-架构-技术选型-LLM提供商.md](../leader/architecture/06-架构-技术选型-LLM提供商.md) — 市场情报影响技术选型
- [roadmap/03-路线图-组织OKR追踪.md](./roadmap/03-路线图-组织OKR追踪.md) → [../leader/roadmap/03-路线图-定义SLO.md](../leader/roadmap/03-路线图-定义SLO.md) — 业务 OKR 级联到技术 SLO
- [roadmap/02-路线图-人员预算规划.md](./roadmap/02-路线图-人员预算规划.md) → [../leader/capacity/01-容量-FinOps审查.md](../leader/capacity/01-容量-FinOps审查.md) — 预算规划驱动 FinOps

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
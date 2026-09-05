---
title: YiKnowledge 个人知识库概览
tags:
- knowledge-base
- index
- navigation
- role-tree
- pipeline
category: root
created: '2026-01-01'
updated: '2026-08-12'
last_verified: '2026-08-12'
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- curator
benefit: 新读者可一目了然地了解完整的软件交付流水线，并按阶段 x 角色定位内容
acceptance_criteria:
- 核心观点清晰陈述，且能与原始资料明确区分
- 提供可操作的建议，而非仅提供信息
- 识别出反模式或不应使用的场景
related:
- ./INDEX.md
- ./curator/治理/user-story-migration-plan.md
- ./curator/diagrams/directory-blueprint.md
---

# YiKnowledge —— 从需求到生产的知识流水线

YiKnowledge 是一个围绕**软件交付流水线**组织的个人知识库。七个角色目录贯穿从需求到生产的完整旅程 —— 每个角色拥有一个阶段，每个阶段结晶出一类知识。

> 不仅仅是"按角色组织"—— 而是按**软件交付的因果链**组织。从 `executiver` 的*为什么做*，到 `producter` 的*做什么*，到 `leader` 的*走哪条路*，到 `engineer` 的*怎么做*，再到 `srer` 的*怎么跑*。知识在每个阶段只存在于唯一位置；跨角色发现通过 frontmatter `roles:` 和领域索引实现，绝不通过复制内容。

## 流水线概览

```
业务战略层（贯穿整个流水线）
─────────────────────────────────────────────────────────────────────────────
  executiver/strategy/   executiver/industry/   executiver/roadmap/
  "为什么做这个业务"        "市场正在发生什么"          "组织目标是什么"

软件交付流水线 —— 5 个阶段，输入 → 输出芯片流转
─────────────────────────────────────────────────────────────────────────────
  需求             决策              设计+构建          质量+发布           运营+学习
  ────────────     ─────────        ────────────      ───────────────    ─────────────
  producter/       leader/           engineer/         srer/              srer/
  │                │                 │                 │                  │
  INPUT:           INPUT:            INPUT:            INPUT:             INPUT:
  业务              PRD               ADR               可运行的           运行中的
  战略              需求               PRD               软件              服务
  │                │                 │                 │                  │
  OUTPUT:          OUTPUT:           OUTPUT:           OUTPUT:            OUTPUT:
  PRD              ADR               架构模式           发布                SLO 合规
  用户故事          技术选型           开发实践           流程               事后复盘
  优先级            容量规划           质量与             事件响应            经验教训
                    │                 安全              可观测性
                    │                 数据与可靠性
                    │                 经验教训
                    │                 │                 │                  │
  "做什么"          "走哪条路"         "怎么做"           "怎么交付"          "怎么运维
                                                                            与学习"

AI 赋能层（贯穿整个流水线）
─────────────────────────────────────────────────────────────────────────────
  aier/基础/   aier/方法/   aier/平台/   aier/机器学习/
  "AI 如何加速每个阶段"

知识治理层（元层）
─────────────────────────────────────────────────────────────────────────────
  curator/治理/   curator/diagrams/   curator/archive/   curator/templates/
  "知识库本身如何维护和演进"
```

## 流水线阶段

### 阶段 1：需求 —— 定义要构建什么

**负责人：[producter/](./producter/README.md)** | 流水线阶段 1/5

**输入芯片**（来自上游）：
- **业务战略** —— 来自 [executiver/](./executiver/README.md) 的市场情报、竞争格局、组织级目标

**输出芯片**（交付物）：
- **PRD** —— 产品需求文档：构建什么、为谁构建、如何衡量成功
- **用户故事** —— 用户故事和 JTBD 叙事：从用户视角看待功能价值
- **优先级** —— 优先级框架（RICE/ICE）和北极星指标定义

在编写任何代码之前，先明确要解决什么问题、为谁解决、以及如何衡量成功。

| 当你需要... | 芯片 | 前往 |
|---|---|---|
| 编写 PRD | `prds` | [producter/discovery/prd/](./producter/discovery/prd/) |
| 定义用户故事 / JTBD | `user-stories` | [producter/frameworks/jobs-to-be-done.md](./producter/frameworks/jobs-to-be-done.md) |
| 排定功能优先级（RICE/ICE） | `priorities` | [producter/frameworks/rice-ice-prioritization.md](./producter/frameworks/rice-ice-prioritization.md) |
| 定义北极星指标 | `priorities` | [producter/discovery/metrics/north-star-metric.md](./producter/discovery/metrics/north-star-metric.md) |
| 进行用户研究 | `user-stories` | [producter/frameworks/do-user-research.md](./producter/frameworks/do-user-research.md) |
| 运行一个 Sprint | `priorities` | [producter/delivery/run-a-sprint.md](./producter/delivery/run-a-sprint.md) |

**上游输入**：[executiver/strategy/](./executiver/strategy/) 定义业务战略和竞争定位；[executiver/industry/](./executiver/industry/) 提供市场情报。这些是需求的*上下文*，而非需求本身。

**边界规则**：producter 定义*要构建什么功能*，而非*如何实现*（→ engineer/）或*使用什么技术*（→ leader/）。

### 阶段 2：决策 —— 选择技术方向

**负责人：[leader/](./leader/README.md)** | 流水线阶段 2/5

**输入芯片**（来自上游）：
- **PRD** —— 来自 [producter/](./producter/README.md) 的产品需求文档 —— 需要做出决策的功能定义
- **需求** —— 约束技术决策的功能性和非功能性需求

**输出芯片**（交付物）：
- **ADR** —— 架构决策记录：每个重要技术选择的上下文/决策/后果
- **技术选型** —— 技术栈评估、对比矩阵和选型理由
- **容量规划** —— 容量规划、FinOps 评审和基础设施规模决策

需求明确后，leader 做出技术决策 —— 什么架构、什么技术栈、多少容量、风险在哪里。

| 当你需要... | 芯片 | 前往 |
|---|---|---|
| 编写架构决策（ADR） | `adrs` | [leader/架构/design-architecture-decision.md](./leader/架构/design-architecture-decision.md) |
| 评估技术选型 | `tech-selections` | [leader/roadmap/do-a-tech-selection.md](./leader/roadmap/do-a-tech-selection.md) |
| 规划容量 / FinOps | `capacity-plans` | [leader/capacity/run-a-finops-review.md](./leader/capacity/run-a-finops-review.md) |
| 管理技术债务 | `tech-selections` | [leader/roadmap/manage-tech-debt.md](./leader/roadmap/manage-tech-debt.md) |
| 评估上线风险 | `adrs` | [leader/risk/](./leader/risk/) |
| 浏览已有 ADR | `adrs` | [leader/decisions/](./leader/decisions/) —— 按项目子目录组织 |

**边界规则**：leader 做出*带权衡的决策*，而非*实现模式*（→ engineer/build/）或*运维流程*（→ srer/）。关键区分：**决策 = 为什么选 A 而非 B**（leader/），**模式 = 如何实现 A**（engineer/）。

### 阶段 3：设计 + 构建 —— 将决策转化为代码

**负责人：[engineer/](./engineer/README.md)** | 流水线阶段 3/5

**输入芯片**（来自上游）：
- **ADR** —— 来自 [leader/](./leader/README.md) 的架构决策记录 —— 需要实现的技术方向
- **PRD** —— 来自 [producter/](./producter/README.md) 的产品需求文档 —— 需要构建的功能规格

**输出芯片**（交付物）：
- **架构模式** —— 实现级模式：CQRS、Saga、事件驱动、API Gateway、BFF
- **开发实践** —— 开发实践、工具链、DX 改进和依赖管理
- **质量与安全** —— 代码质量标准、安全加固、测试策略和供应链审计
- **数据与可靠性** —— 数据模式（迁移、缓存、流水线）和可靠性模式（重试、背压、幂等）
- **经验教训** —— 成功、失败、陷阱和 Bug：来自真实实现经验的现场笔记

流水线中最长的阶段，横跨 BUILD → SHIP。按问题域组织的八个子目录：

```
BUILD                           SHIP
├─ architecture/（39 个文件）      ├─ quality-security/（27 个文件）
│  系统设计、API 设计、              │  测试、安全加固、
│  事件驱动、设计                     │  供应链、代码审查、
│  模式、BFF、CQRS、Saga            │  混沌工程、威胁建模、
│                                  │  零信任
├─ development/（28 个文件）        │
│  开发工具、DX、依赖                 ├─ data/（13 个文件）
│  管理、项目                         │  数据库、迁移、缓存、
│  脚手架、编辑器配置                 │  数据流水线、Outbox、
│                                  │  读写分离、连接池
│                                  │
                                    └─ reliability/（13 个文件）
                                       弹性、可观测性、
                                       限流、扩缩容、
                                       重试/退避、超时、幂等
```

| 当你需要... | 芯片 | 前往 |
|---|---|---|
| 设计 API | `architecture-patterns` | [engineer/build/implement-an-api.md](./engineer/build/implement-an-api.md) |
| 设计数据模型 | `data-reliability` | [engineer/ship/](./engineer/ship/) |
| 加固供应链 | `quality-security` | [engineer/ship/harden-supply-chain.md](./engineer/ship/harden-supply-chain.md) |
| 搭建测试基础设施 | `dev-practices` | [engineer/build/set-up-testing-infrastructure.md](./engineer/build/set-up-testing-infrastructure.md) |
| 进行代码审查 | `quality-security` | [engineer/ship/](./engineer/ship/) |
| 回顾过往经验 | `lessons` | [engineer/learn/lessons/](./engineer/learn/lessons/) |
| 跨项目共享客户端 | `dev-practices` | [engineer/build/share-client-across-projects.md](./engineer/build/share-client-across-projects.md) |

**边界规则**：engineer 是*实现层* —— 不能替代 leader 的决策。如果实现过程中出现架构级问题 → 回到 leader/ 编写 ADR；不要在 engineer/ 内部"顺便做决定"。

### 阶段 4：质量 + 发布 —— 安全交付

**负责人：[srer/release/](./srer/release/) + [engineer/ship/](./engineer/ship/)** | 流水线阶段 4/5

**输入芯片**（来自上游）：
- **可运行的软件** —— 来自 [engineer/](./engineer/README.md) 的实现产物 —— 已通过设计和构建质量关卡的代码

**输出芯片**（交付物）：
- **发布流程** —— 发布、回滚、金丝雀和热修复流程：代码如何安全地到达生产环境
- **事件响应** —— 事件响应流程、值班交接和免责事后复盘模板
- **可观测性** —— 监控、告警、仪表盘、SLO/SLI 定义和可观测性三元组

代码写完了，但交付不是终点。本阶段确保代码通过质量关卡、安全审计、发布流程和回滚演练。

| 当你需要... | 芯片 | 前往 |
|---|---|---|
| 执行发布 | `release-procedures` | [srer/release/release.md](./srer/release/release.md) |
| 执行回滚 | `release-procedures` | [srer/release/rollback-drill.md](./srer/release/rollback-drill.md) |
| 运行金丝雀发布 | `release-procedures` | [srer/release/canary-release.md](./srer/release/canary-release.md) |
| 响应事件 | `incident-response` | [srer/incident-response/respond-to-an-incident.md](./srer/incident-response/respond-to-an-incident.md) |
| 搭建可观测性 | `observability` | [srer/observability/set-up-observability.md](./srer/observability/set-up-observability.md) |
| 进行安全审计 | `quality-security` | [engineer/ship/](./engineer/ship/) |
| 运行性能/负载测试 | `quality-security` | [engineer/ship/](./engineer/ship/) |

**边界规则**：srer/release/ 拥有*发布流程和协调*；engineer/ship/ 拥有*发布所用的技术模式*（金丝雀实现、功能开关）。流程 vs. 实现。

### 阶段 5：运营 + 学习 —— 保持运行并从中学习

**负责人：[srer/](./srer/README.md) + [engineer/learn/lessons/](./engineer/learn/lessons/)** | 流水线阶段 5/5

**输入芯片**（来自上游）：
- **运行中的服务** —— 在生产环境中运行的服务：可观测性监控的、事件影响的真实系统

**输出芯片**（交付物）：
- **SLO 合规** —— SLO 合规追踪、错误预算管理和可用性报告
- **事后复盘** —— 免责事后复盘，包含根因分析、行动项和时间线重建
- **经验教训** —— 运维经验：值得复制的成功、需要学习的失败和应该避免的陷阱

上线之后，srer 处理可观测性和事件响应；engineer 从成功和失败中捕获经验教训。

```
RUN                             LEARN
├─ srer/observability/（13）      ├─ engineer/learn/lessons/（52）
│  监控、告警、                      │  wins/（成功模式）
│  仪表盘、SLO、                     │  failures/（失败复盘）
│  可观测性三元组                    │  gotchas/（陷阱）
│                                  │  bugs/（缺陷分析）
├─ srer/incident-response/（17）    │
│  事件响应流程、                    ├─ engineer/run/（66）
│  值班交接、免责                     │  团队协作、知识
│  事后复盘、行动后                   │  分享、回顾、
│                                  │  入职、迭代 PM 手册
├─ srer/release/（6）
│  发布、回滚、热修复
```

| 当你需要... | 芯片 | 前往 |
|---|---|---|
| 响应生产事件 | `incident-response` | [srer/incident-response/respond-to-an-incident.md](./srer/incident-response/respond-to-an-incident.md) |
| 搭建可观测性 | `observability` | [srer/observability/set-up-observability.md](./srer/observability/set-up-observability.md) |
| 编写事后复盘 | `postmortems` | [leader/risk/write-a-postmortem.md](./leader/risk/write-a-postmortem.md) |
| 追踪 SLO/SLI 合规 | `slo-compliance` | [srer/observability/](./srer/observability/) |
| 查看已知陷阱 | `lessons-learned` | [engineer/run/check-engineering-gotchas.md](./engineer/run/check-engineering-gotchas.md) |
| 回顾过往经验 | `lessons-learned` | [engineer/learn/lessons/](./engineer/learn/lessons/) |
| 为新成员入职 | `lessons-learned` | [engineer/run/onboarding/](./engineer/run/onboarding/) |

**边界规则**：事件*发生前* → leader/risk/（风险评估）；事件*发生时* → srer/incident-response/（响应流程）；事件*发生后* → leader/risk/（复盘方法论），srer/incident-response/（具体复盘记录）。

## 贯穿整个流水线的三个层

### 业务战略层 —— 为什么做

**负责人：[executiver/](./executiver/README.md)** —— 为每个流水线阶段提供业务上下文。

| 子目录 | 回答 | 被谁消费 |
|---|---|---|
| [strategy/](./executiver/strategy/) | 企业战略、组织设计、SWOT | producter（需求） |
| [industry/](./executiver/industry/) | 市场趋势、竞品分析、报告 | producter、leader（产品/技术决策） |
| [roadmap/](./executiver/roadmap/) | 组织级目标和里程碑 | leader（技术路线对齐） |
| [reading-list/](./executiver/reading-list/) | 高管学习资源 | 所有角色 |

### AI 赋能层 —— AI 如何加速每个阶段

**负责人：[aier/](./aier/README.md)** —— AI 不是独立的流水线阶段；它作为加速器渗透到每个阶段。

| 子目录 | 回答 | 嵌入阶段 |
|---|---|---|
| [基础/](./aier/基础/) | AI 基础与理论 | 设计（理解 AI 能力边界） |
| [方法/](./aier/方法/) | RAG 模式、LLM 评估、Agent 架构 | 构建（AI 功能实现） |
| [平台/](./aier/平台/) | 向量数据库选型、Embedding 模型选型 | 设计 + 构建（AI 基础设施） |
| [机器学习/](./aier/机器学习/) | 传统 ML 模式 | 构建（非 LLM 的 ML 需求） |

**边界规则**：通用数据库、缓存、数据流水线 → engineer/ship/。

### 知识治理层 —— 谁来维护知识库

**负责人：[curator/](./curator/README.md)** —— 元层。不产生领域知识；维护知识库的结构和健康。

| 子目录 | 职责 |
|---|---|
| [governance/](./curator/治理/) | 知识生命周期、分类标准、就绪检查清单 |
| [diagrams/](./curator/diagrams/) | 知识地图、用户旅程、目录蓝图 |
| [archive/](./curator/archive/) | 已弃用内容索引 |
| [templates/](./curator/templates/) | 知识叶子、ADR、BRD 等模板 |

## 角色责任链

流水线中的角色并非平级 —— 它们有明确的上游/下游关系：

```
executiver ──→ producter ──→ leader ──→ engineer ──→ srer
  （为什么）      （做什么）      （走哪条路）    （怎么做）      （怎么跑）

  业务            产品            技术            实现            运维
  战略            需求            决策            模式            流程
```

- 每个角色只生产其*下游角色*所需的知识
- 上游变更应触发对相应下游内容的审查
- 不要在 engineer/ 内部"随意"做出 leader 级别的决策，也不要在 producter/ 内部敲定技术栈

## 角色边界快速参考

当内容可能属于多个角色时，使用以下决策树（与流水线页面的决策树一致）：

```
内容是否关于...
├─ 业务战略、市场、竞品？ ──→ executiver/
├─ 产品需求、用户故事、优先级？ ──→ producter/
├─ 技术决策、架构选择、ADR？ ──→ leader/
├─ 实现模式、开发工具、代码？ ──→ engineer/
├─ 发布流程、监控、事件响应？ ──→ srer/
├─ AI/ML 特定理论和实践？ ──→ aier/
└─ 知识库自身的结构和规则？ ──→ curator/
```

**高频边界冲突**：

| 冲突 | 归属 | 原因 |
|---|---|---|
| 架构决策 vs. 架构模式 | leader/ | 决策 = 为什么选 A 而非 B，包含权衡和后果 |
| 安全加固 vs. 安全策略 | engineer/ | 加固 = 如何实现（代码层面）；策略 = 风险评估（leader/risk/） |
| 事件响应 vs. 风险预防 | srer/ → 发生时，leader/ → 发生前 | 时间线区分：发生前 / 发生时 / 发生后 |
| 产品路线图 vs. 技术路线图 | producter/ → 功能，leader/ → 技术 | 什么功能 vs. 什么技术 |
| 数据工程 vs. AI 数据 | engineer/ → 通用，aier/ → AI 特定 | 数据库、缓存 vs. 数据集、Embedding |

## 芯片级交叉引用（pipeline__stage-flow-chip）

每个流水线阶段都有**输入芯片**（从上游消费）和**输出芯片**（为下游生产）。芯片构成了阶段之间的契约：

| 阶段 | 输入芯片 | 输出芯片 | 角色 |
|---|---|---|---|
| 1. 需求 | 业务战略 | PRD、用户故事、优先级 | [producter/](./producter/README.md) |
| 2. 决策 | PRD、需求 | ADR、技术选型、容量规划 | [leader/](./leader/README.md) |
| 3. 设计 + 构建 | ADR、PRD | 架构模式、开发实践、质量与安全、数据与可靠性、经验教训 | [engineer/](./engineer/README.md) |
| 4. 质量 + 发布 | 可运行的软件 | 发布流程、事件响应、可观测性 | [srer/](./srer/README.md) |
| 5. 运营 + 学习 | 运行中的服务 | SLO 合规、事后复盘、经验教训 | [srer/](./srer/README.md) + [engineer/learn/lessons/](./engineer/learn/lessons/) |

> 每个芯片在流水线 UI（`/pipeline/:stageId/:itemId`）中对应基于关键词的文件过滤。点击芯片会按芯片的关键词过滤该阶段的知识文件。

## 设计原则

1. **角色优先，边界清晰** —— 每一条知识只属于一个角色目录。多角色覆盖使用 frontmatter `roles:`，绝不复制内容。
2. **描述性连字符文件名** —— 动词短语式 slug，仅使用连字符。禁止使用下划线和数字。
3. **外部知识双副本** —— `*-original.md`（源文件）+ `*-summary.md`（综合），绝不混合。
4. **YAML frontmatter 必填** —— `title` / `tags` / `category` / `created` / `updated` / `source` / `type` / `roles` / `benefit` / `acceptance_criteria` 是召回信号。
5. **统一正文结构** —— 摘要 / 核心观点 / 关键信息 / 行动建议 / 反模式 / 相关链接。
6. **时效性标注** —— 外部内容需要 `last_verified` + `review_cycle`；超过 6 个月未验证则标记为 `status: deprecated`。
7. **最多 3 级目录** —— `role/problem-domain/file.md`；不允许嵌套子子目录。

## 3 个跨领域索引

除了 7 个角色目录，还有 3 个领域索引按主题跨角色聚合内容：

| 领域索引 | 聚合内容 | 回答 |
|---|---|---|
| [SECURITY.md](./engineer/SECURITY.md) | 供应链、应用安全、风险、事件响应、合规 | 所有安全相关内容在哪里？ |
| [COLLABORATION.md](./curator/COLLABORATION.md) | 团队流程、会议、知识共享、入职、PM | 所有协作相关内容在哪里？ |
| [ENGINEERING.md](./engineer/ENGINEERING.md) | 架构、质量、数据、工具、经验教训 | 所有工程相关内容在哪里？ |

## 4 张架构图

在扩展知识库之前，先绘制这 4 张图：

| 图 | 位置 | 回答 |
|---|---|---|
| 知识地图 | [curator/diagrams/knowledge-map.md](./curator/diagrams/knowledge-map.md) | 存在哪些知识？显性 vs. 隐性？持有者和消费者？ |
| 用户旅程图 | [curator/diagrams/user-journey.md](./curator/diagrams/user-journey.md) | 知识在哪里？如何流动？断点在哪里？ |
| 目录蓝图 | [curator/diagrams/directory-blueprint.md](./curator/diagrams/directory-blueprint.md) | 用户如何一目了然地找到内容？角色 × 问题域，最多 3 级 |
| 治理流程 | [curator/治理/governance.md](./curator/治理/governance.md) | 谁维护？多久一次？4 个角色，3 种节奏 |

在扩展之前运行[就绪检查清单](./curator/治理/readiness-checklist.md)的 10 个问题关卡。

## 导航策略

**按流水线阶段**（推荐）—— 从你所在的阶段开始，前往对应的角色目录。如果不确定是哪个阶段，使用上面的角色决策树。

**按领域索引** —— 跨阶段主题（安全、AI、协作、工程）从 4 个领域索引之一开始。

**按 Demo** —— 从 [projects/](./projects/) → `<project>/demos/` 中的完整示例项目开始，当你需要一个可实例化的参考（可在 YiVad 项目管理中实例化）。

**按项目** —— 从 [projects/](./projects/)（[README](./projects/README.md) | [INDEX](./projects/INDEX.md)）开始，查看所有 4 个项目的特定 Bug、问题、文档和 Demo。

**按文件名 grep** —— `rg "^tags:.*keyword" YiKnowledge -l` 进行快速过滤。

**按 frontmatter 扫描** —— `head -15 file.md` 读取 YAML 元数据，在阅读完整文件之前判断相关性。

## AI 时代的定位

YiKnowledge 同时服务于人类和 AI（YiAi BRD Agent 的 RAG 数据源）：

- **人类视角** —— 7 个角色目录 × 问题域子目录，2 跳内触达任何内容。流水线叙事让新人快速建立心智模型。
- **AI 视角** —— Frontmatter 中的 `roles` / `benefit` / `acceptance_criteria` / `lifecycle` / `related` / `tags` / `category` 是 RAG 召回信号。结构化的知识远比零散的文档更易于 AI 消费。
- **知识地图永不过时** —— AI 消费结构化知识；垃圾进，垃圾出。维护知识库就是维护 AI 的认知边界。
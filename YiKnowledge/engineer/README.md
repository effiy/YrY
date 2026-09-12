---
title: Engineer role
tags: [engineer, role, index]
category: engineer
created: 2026-08-03
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer]
benefit: "Engineers find content by problem domain within 2 hops"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "cross-references to related leaves and parent INDEX are present"
related:
  - ./INDEX.md
  - ./ENGINEERING.md
  - ./SECURITY.md
  - ../README.md
  - ../INDEX.md
---

# Engineer — 工程角色主页

> **流水线阶段 3：设计与构建** — Engineer 角色负责**实现**。不做架构决策（由 [leader/](../leader/) 负责）、不定义产品需求（由 [producter/](../producter/) 负责）、不运维生产环境（由 [srer/](../srer/) 负责）。Engineer 的使命是将决策和需求转化为可运行、可测试、可维护的代码。

## 问题域

YrY 的 Engineer 知识按软件交付生命周期组织为四个阶段，每个阶段解决一类核心问题：

| 阶段 | 目录 | 解决的核心问题 |
|---|---|---|
| BUILD | [build/](./build/) | 如何设计和搭建此系统？——架构模式、API 设计、工具链选型、开发环境配置 |
| SHIP | [ship/](./ship/) | 如何保证交付质量和韧性？——测试策略、安全加固、数据迁移、容量规划、退避重试 |
| RUN | [run/](./run/) | 如何高效协作和上手项目？——入职指南、竞品调研、团队工作流 |
| LEARN | [learn/](./learn/) | 如何避免重复踩坑？——成功案例、失败复盘、陷阱记录、项目特定文档 |

### 为什么采用 BUILD/SHIP/RUN/LEARN 结构

这个四阶段模型来源于软件交付的经典生命周期，每条知识可以清晰地映射到工程师日常工作中的具体场景：

- **BUILD**：当你准备开始编码时查阅——如何搭建项目、如何设计 API、如何遵循 RPC 契约
- **SHIP**：当功能开发完成后查阅——如何保证代码质量、如何安全地变更数据、如何处理失败
- **RUN**：当需要协作或新人加入时查阅——如何快速上手、如何了解竞品
- **LEARN**：当你遇到问题或完成一个迭代后查阅——前人踩过什么坑、有什么最佳实践可以复用

## 范围

### 范围内（Engineer 角色持有）

- 系统设计与开发模式、API 设计规范、开发工具与 DX 配置 → [build/](./build/)
- 代码质量治理、安全加固、数据迁移、韧性模式（退避重试、熔断降级）→ [ship/](./ship/)
- 竞品调研、团队工作流、新人入职指南 → [run/](./run/)
- 成功案例与可复用模式、失败复盘报告、工程陷阱记录、项目特定文档 → [learn/](./learn/)
- YrY 项目级文档（YiAi、YiVad、YiPet、YiKnowledge）→ [projects/](./projects/)

### 范围外（委托给其他角色）

| 知识类型 | 归属角色 | 典型路径 |
|---|---|---|
| 带权衡分析的架构决策（ADR） | leader | [../leader/decisions/](../leader/decisions/) |
| 技术选型评估与成熟度模型 | leader | [../leader/架构/](../leader/架构/) |
| 产品需求与用户故事 | producter | [../producter/discovery/](../producter/discovery/) |
| 事件响应流程与复盘 | srer | [../srer/incident-response/](../srer/incident-response/) |
| AI 理论与方法论基础 | aier | [../aier/foundations/](../aier/foundations/) |
| 知识库治理与结构维护 | curator | [../curator/governance/](../curator/governance/) |

### 高频边界冲突解决

| 问题 | 归属 | 判断依据 |
|---|---|---|
| 架构决策 vs 架构模式 | leader/ | 决策 = 在具体约束下选 A 不选 B；模式 = 通用的可复用设计方案 |
| 安全加固实现 vs 安全策略制定 | engineer/ | 加固 = 代码层面的具体实现（如参数校验、依赖审计）；策略 = 组织级的安全方针 |
| 事件发生时的应急响应 vs 事前风险预防 | srer/ | 事件响应 = 故障发生后的处理流程；风险预防 = 故障发生前的架构和流程设计 |
| Bug 修复 vs Bug 报告规范 | engineer/ | 修复记录 = learn/lessons/；报告规范 = projects/ |

## 核心观点

- **问题域优先**：内容按实际遇到的问题组织（Build 阶段 → Ship 阶段 → Run 阶段 → Learn 阶段），而非按文档类型或作者。当你想"我怎么设计这个 API？"时，去 build/；当你想"上次那个 SSE 流中断的 bug 怎么修？"时，去 learn/lessons/gotchas/。
- **实现而非决策**：engineer/ 记录的是"怎么构建"——具体的代码模式、配置方式、工具使用方法。leader/ 记录的才是"为什么选择这个方案"——包含权衡分析、替代方案评估、决策上下文。
- **经验教训是第一类产物**：每次成功、每次失败、每次踩坑都值得记录。Lean 阶段的 wins/、failures/、gotchas/ 三个子目录共同构成 YrY 工程团队的集体记忆。不记录的经验等于浪费的经验。
- **项目知识独立维护**：每个 YrY 子项目（YiAi、YiVad、YiPet、YiKnowledge）在 projects/ 和 learn/projects/ 下有独立的文档体系，包含架构设计、开发规范、功能模块清单、用户故事等。

## 跨角色引用

- [../leader/](../leader/) — 架构决策记录（ADR）、容量规划、技术风险、路线图
- [../aier/](../aier/) — AI 基础理论、RAG/Agent 方法论、LLM 平台
- [../producter/](../producter/) — 产品管理框架、需求发现、交付节奏
- [../srer/](../srer/) — 事件响应流程、可观测性（监控/告警/SLO）、发布管理
- [../projects/](../projects/) — 项目运营产物（Bug 跟踪、Issue 管理、Demo）
- [./ENGINEERING.md](./ENGINEERING.md) — 跨角色工程领域聚合索引（架构/质量/数据/部署/经验教训）
- [./SECURITY.md](./SECURITY.md) — 跨角色安全领域聚合索引（供应链/应用安全/风险/合规）
- [./learn/INDEX.md](./learn/INDEX.md) — Learn 阶段完整索引（经验教训 + 项目特定文档）

## 快速导航

### 按角色快速跳转

- 我是**新加入的工程师** → [run/onboarding/](./run/onboarding/) 按你的项目选择入职指南
- 我要**添加新的 API 调用** → [build/](./build/) 查阅 RPC 协议和跨项目调用指南
- 我遇到了**诡异的 bug** → [learn/lessons/gotchas/](./learn/lessons/gotchas/) 先看看有没有已知陷阱
- 我要**发布新版本** → [ship/](./ship/) 查阅测试基础设施、安全加固和容量规划
- 我想了解**某个项目的架构** → [learn/projects/](./learn/projects/) 选择目标项目查看架构设计和开发规范

### 按 YrY 项目快速跳转

| 项目 | 角色 | 快速入口 |
|---|---|---|
| YiAi（FastAPI 后端） | engineer | [projects/01-项目-YiAi项目.md](./projects/01-项目-YiAi项目.md) |
| YiKnowledge（知识库） | engineer + curator | [projects/02-项目-YiKnowledge项目.md](./projects/02-项目-YiKnowledge项目.md) |
| YiPet（Chrome 扩展） | engineer | [projects/03-项目-YiPet项目.md](./projects/03-项目-YiPet项目.md) |
| YiVad（Vue 管理后台） | engineer | [projects/04-项目-YiVad项目.md](./projects/04-项目-YiVad项目.md) |
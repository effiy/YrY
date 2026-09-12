---
title: Learn — Lessons & Projects
tags: [leaf, learn, lessons, projects, wins, failures, gotchas]
category: engineer/learn
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers learn from past experience and access project-specific documentation"
acceptance_criteria:
  - "Lessons (wins, failures, gotchas) are accessible"
  - "Project-specific docs are organized by project"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../build/
  - ../ship/
  - ../run/
  - ./INDEX.md
---

# Learn — 经验教训与项目文档

> **作为** Engineer，**我希望**从过去的经验中学习并访问项目特定的技术文档，**以便**避免重复踩坑、复用成功模式、理解每个子项目的架构和规范。

LEARN 是 Engineer 流水线的第四个阶段——也是唯一一个"向后看"的阶段。Build/Ship/Run 三个阶段关注的是"怎么做"，而 Learn 关注的是"上次发生了什么、学到了什么"。这个阶段的核心理念是：**不记录的经验等于浪费的经验**。

## LEARN 阶段的四层结构

```
learn/
├── lessons/          ← 经验教训（跨项目）
│   ├── wins/         ← 成功案例与可复用模式
│   ├── failures/     ← 失败复盘与事故分析
│   └── gotchas/      ← 工程陷阱与注意事项
└── projects/         ← 项目特定文档
    ├── yiai/         ← YiAi 后端（架构/规范/模块/故事）
    ├── yipet/        ← YiPet 扩展（架构/规范/模块/故事）
    └── yivad/        ← YiVad 前端（架构/规范/模块/故事/流水线闭环）
```

### 为什么需要经验教训

YrY 是一个快速迭代的单体仓库，三个前端项目共享同一个后端。在这个环境中：

- **重复踩坑是最大的浪费**：RPC 参数名不匹配（`filter` vs `query`）、SSE 流中断仍触发副作用、macOS FSEvents 静默丢弃事件——每个陷阱都可能在新功能开发中再次出现。记录下来可以节省每个工程师数小时的调试时间。
- **成功模式值得复用**：YiPet 跨项目 Hub 模式（浏览器扩展作为集成中心）已经在 Bug 报告、知识库桥接等场景中证明了价值。记录下成功的设计决策和架构选择，可以在未来类似场景中直接参考。
- **失败是最好的老师**：YiVad AICR 端口幻觉事件（AI 助手声称完成了不存在的代码移植）教会了我们"信任但验证"的原则。这类教训如果不记录，团队会在不同的 AI 辅助场景中反复上当。

## 子目录概览

| 目录 | 内容 | 关键文件 |
|---|---|---|
| [lessons/](./lessons/) | 来自 YrY 真实项目的成功案例、失败复盘、陷阱记录 | 1 个成功 + 1 个失败 + 4 个陷阱，共 6 篇 |
| [projects/](./projects/) | 项目特定的业务和工程文档：架构设计、开发规范、功能模块清单 | 3 个项目，每个 3-5 篇核心文档 + 用户故事 |

## 经验教训一览

| 类别 | 目录 | 描述 | 代表性经验 |
|---|---|---|---|
| 成功案例 | [lessons/wins/](./lessons/wins/) | 成功的架构决策和可复用的设计模式 | YiPet 跨项目 Hub：浏览器扩展作为多项目集成中心 |
| 失败复盘 | [lessons/failures/](./lessons/failures/) | 生产级失误和事后分析 | YiVad AICR 端口幻觉：AI 生成虚假交付报告未被验证 |
| 陷阱记录 | [lessons/gotchas/](./lessons/gotchas/) | 工程实践中的坑点和注意事项 | RPC 参数名不匹配、SSE onDone 守卫、macOS FSEvents 静默丢弃、YiPet jsxDEV 生产模式 |

## 项目一览

| 项目 | 目录 | 技术栈 | 关键文档 |
|---|---|---|---|
| YiAi | [projects/yiai/](./projects/yiai/) | FastAPI + Python 3.10+，端口 10086 | 架构设计、开发规范、功能模块清单、路由分析 |
| YiPet | [projects/yipet/](./projects/yipet/) | Chrome MV3 + Vue 3.5 + RSBuild 1 | 架构设计（双世界边界）、开发规范（关键陷阱）、功能模块清单 |
| YiVad | [projects/yivad/](./projects/yivad/) | Vue 3.5 + TypeScript 6 + RSBuild 1，端口 8848 | 架构设计、开发规范、功能模块清单、流水线闭环 |

## 如何贡献经验教训

当你在 YrY 项目中遇到以下情况时，应该向 Learn 阶段添加记录：

### 添加成功案例（wins/）

触发条件：完成了一个架构设计或实现了某个功能，它工作得很好，你觉得这个模式值得在未来类似场景中复用。

记录要点：
- 描述构建了什么、为什么成功
- 记录关键的架构决策和设计选择
- 提炼出可复用的模式（抽象到足够通用的层次）
- 如果能量化效果（如"0 架构变更"、"3 个新 API 服务"），附上度量

### 添加失败复盘（failures/）

触发条件：发生了本可避免的错误，或者某个决策导致了生产问题。使用无责复盘（blameless postmortem）格式。

记录要点：
- 发生了什么（事实陈述，避免主观判断）
- 根因分析（为什么当时没有发现？为什么现有流程没有阻止？）
- 修复措施（已经做了什么）
- 预防措施（流程/工具/检查的变更，确保不再发生）

### 添加陷阱记录（gotchas/）

触发条件：遇到了一个非直觉的行为或配置问题，花了很多时间调试。在解决问题后 24 小时内添加。

记录要点：
- 症状描述（用户/开发者看到什么异常）
- 根因分析（为什么出现这个问题）
- 修复方法（具体的代码或配置变更）
- 检测方法（如何快速识别这个陷阱）
- 适用范围（影响哪些项目/模块/场景）

## 交叉引用

- [../build/](../build/) — 架构与设计模式（Build 阶段）
- [../ship/](../ship/) — 质量保障、安全加固、数据可靠性（Ship 阶段）
- [../run/](../run/) — 团队工作流、新人入职与协作（Run 阶段）
- [../../leader/risk/write-a-postmortem.md](../../leader/risk/write-a-postmortem.md) — 事故复盘方法论
- [../../projects/](../../projects/) — 项目运营产物（Bug 跟踪、Issue、Demo）
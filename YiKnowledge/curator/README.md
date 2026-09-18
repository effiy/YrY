---
title: Knowledge Curator — 生命周期视图层
aliases: [lifecycle-view, para-lifecycle]
tags: [lifecycle, moc, para, 4-diagrams]
category: curator
created: 2026-08-03
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [curator]
benefit: "Knowledge curators maintain KB structure, governance, and quality — they do not create domain content"
acceptance_criteria:
  - "角色范围和边界决策规则清晰"
  - "PARA/lifecycle 映射准确"
  - "反模式列出常见误用"
related:
  - ./INDEX.md
  - ./COLLABORATION.md
  - ./governance/README.md
  - ./diagrams/README.md
  - ./templates/README.md
  - ./archive/README.md
  - ../README.md
  - ../MEMORY.md
---

# Knowledge Curator — 生命周期视图层

> **Pipeline 层：Knowledge Governance（横切关注）** — 维护所有 pipeline 阶段依赖的 KB 结构。
>
> Curator 是一个 **META 角色**。它维护 KB 本身的结构——不创建领域内容。领域内容属于 7 个角色目录。

## 快速导航

| 资源 | 描述 |
|---|---|
| [INDEX.md](./INDEX.md) | 子目录映射、文件清单、新人路径、审查流程 |
| [COLLABORATION.md](./COLLABORATION.md) | 跨角色协作索引（入职、会议、代码审查、迭代、复盘） |
| [governance/](./governance/) | 治理规范、收件箱/分类队列、就绪检查清单、操作速查卡 |
| [diagrams/](./diagrams/) | 4 张规范图：知识地图、用户旅程、目录蓝图、看板索引 |
| [templates/](./templates/) | 10 个文档模板：ADR、PRD、技术设计、回顾等 |
| [archive/](./archive/) | 废弃文件索引与归档流程 |

## 范围

### 范围内（curator 拥有）
- **KB 治理**：生命周期管理、收件箱/分类工作流、审查节奏
- **内容质量**：frontmatter 校验、新鲜度检查、废弃策略
- **4 张图**：[知识地图](./diagrams/03-图表-知识地图.md)、[用户旅程](./diagrams/04-图表-用户旅程.md)、[目录蓝图](./diagrams/02-图表-目录蓝图.md)、[治理规范](./governance/02-治理-治理规范.md)
- **模板**：[知识叶子](./templates/02-模板-知识叶子模板.md)、[ADR](./templates/01-模板-ADR模板.md)、[PRD](./templates/05-模板-PRD模板.md)、[技术设计](./templates/07-模板-技术设计模板.md) 等
- **横切领域索引**：[SECURITY](../engineer/SECURITY.md)、[COLLABORATION](./COLLABORATION.md)、[ENGINEERING](../engineer/ENGINEERING.md)
- **日常操作**：参见 [操作速查卡](./governance/08-治理-操作速查卡.md)

### 范围外（curator 不创建）
- 任何领域内容——架构、开发、AI、PM、SRE、战略
- 如果内容回答的是"我如何做 X？"→ 属于角色目录，而非 curator/

## 边界情况决策规则

| 当内容涉及... | 路由到 | 原因 |
|---|---|---|
| 如何写好知识叶子 | [curator/templates/](./templates/) | KB 元内容 |
| 如何设计 API | [engineer/build/](../engineer/build/) | 领域内容 |
| KB 审查流程 | [curator/governance/](./governance/) | KB 运营 |
| 代码审查流程 | [engineer/ship/](../engineer/ship/) | 领域内容 |
| Frontmatter 规范 | [curator/governance/](./governance/) | KB 标准 |
| API 规范格式 | [engineer/build/](../engineer/build/) | 领域内容 |
| KB 文件废弃策略 | [curator/governance/](./governance/) | KB 生命周期 |
| API 废弃策略 | [engineer/build/](../engineer/build/) | 领域内容 |

### Curator 作为 KB 的"engineer + sre + leader"

Curator 为 KB 做的事，就像其他角色为产品做的事。但 curator 仅将这些应用于 **KB 本身**，而非产品。

| 类比角色 | curator 做什么 |
|----------|---------------|
| engineer/build/ | 目录蓝图、命名规范 |
| engineer/ship/ | frontmatter 校验、[就绪检查清单](./governance/04-治理-就绪检查清单.md) |
| srer/ | 收件箱/分类工作流、审查节奏 |
| leader/ | 治理规则、废弃策略 |

## Pipeline 定位

```
┌── curator/（Knowledge Governance——横切）──┐
│  输出：kb-lifecycle、kb-templates、kb-diagrams  │
└──────────────────────────────────────────────┘
    │ 服务于所有 pipeline 阶段
    ▼
producter/ ──→ leader/ ──→ engineer/ ──→ srer/
```

Curator 位于 pipeline **之上**，为每个阶段提供模板、治理和结构。它不参与阶段流程本身——它使流程成为可能。

## 核心观点

- **视图层独立于语义分类** — 7 个角色目录保持不变；curator 仅增加治理视角
- **lifecycle 字段是流转的唯一信号** — AI 和人类都依赖它判断文件处于哪个阶段
- **知识地图永不过时** — AI 消费结构化知识；显性+隐性双库存是 AI 时代唯一的护城河
- **同时服务于人机双读** — frontmatter 的 `lifecycle`/`related`/`tags`/`category` 是 RAG 召回的关键信号

## 新 curator 快速入门

1. 读 [治理规范](./governance/02-治理-治理规范.md) — 4 角色、3 节奏模型
2. 浏览 [4 张图](./diagrams/) — 建立 KB 拓扑的思维模型
3. 跑一次 [就绪检查清单](./governance/04-治理-就绪检查清单.md) — 10 题发布门禁
4. 日常使用 [操作速查卡](./governance/08-治理-操作速查卡.md) — 可复制的命令和流程

## PARA / lifecycle 映射

| PARA 概念 | YiKnowledge 映射 |
|---|---|
| Projects | [engineer/learn/projects/](../engineer/learn/projects/) |
| Areas | 7 个角色目录 |
| Resources | [skills/](../skills/)、[curator/templates/](./templates/) |
| Archives | [curator/archive/](./archive/) |

### lifecycle 流转

```
inbox → triage → active → reference → archive
```

| 状态 | 含义 | 管理位置 |
|---|---|---|
| `inbox` | 未分类的新内容 | [收件箱](./governance/03-治理-收件箱.md) |
| `triage` | 已分类但未精炼 | [分类处理](./governance/07-治理-分类处理.md) |
| `active` | 已精炼，活跃维护 | 角色目录 |
| `reference` | 稳定的参考材料 | [templates/](./templates/) |
| `archive` | 已废弃或被取代 | [归档说明](./archive/01-归档-归档说明.md) |

## 4 张图

| 图 | 回答的问题 |
|------|-----------|
| [知识地图](./diagrams/03-图表-知识地图.md) | 存在哪些知识？显性 vs 隐性？ |
| [用户旅程](./diagrams/04-图表-用户旅程.md) | 知识如何流转？断点在哪？ |
| [目录蓝图](./diagrams/02-图表-目录蓝图.md) | 用户如何 2 跳内找到内容？ |
| [治理规范](./governance/02-治理-治理规范.md) | 谁维护？多久一次？ |

## 反模式 / 常见误用

- **将 curator/ 当作主题分类** — 与 7 个角色目录重叠。修复：使用[决策规则](#边界情况决策规则)表。
- **在 curator/ 中创建领域内容** — 对目标角色不可见。修复：放在正确的角色目录中。
- **新文件缺少 lifecycle 字段** — AI 召回信号弱。修复：发布前运行[就绪检查清单](./governance/04-治理-就绪检查清单.md)。
- **跳过 inbox → triage → active 流程** — 未分类内容堆积。修复：每周处理[收件箱](./governance/03-治理-收件箱.md)。
- **画了 4 张图但从不审查** — 知识地图过时。修复：遵循[操作速查卡](./governance/08-治理-操作速查卡.md)的季度节奏。

## 相关

- **子目录 README**：[governance/](./governance/README.md) · [diagrams/](./diagrams/README.md) · [templates/](./templates/README.md) · [archive/](./archive/README.md)
- **Curator 索引**：[INDEX.md](./INDEX.md) · [COLLABORATION.md](./COLLABORATION.md)
- **上游**：[../README.md](../README.md) · [../MEMORY.md](../MEMORY.md) · [../INDEX.md](../INDEX.md)
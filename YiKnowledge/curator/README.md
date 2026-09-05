---
title: Knowledge Curator — Lifecycle view layer
aliases: [lifecycle-view, para-lifecycle]
tags: [lifecycle, moc, para, 4-diagrams]
category: curator
created: 2026-08-03
updated: 2026-08-12
last_verified: 2026-08-12
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [curator]
benefit: "Knowledge curators maintain KB structure, governance, and quality — they do not create domain content"
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - usage guidance explains when to use this template and common mistakes
related:
  - [INDEX.md](./INDEX.md)
  - [COLLABORATION.md](./COLLABORATION.md)
  - [diagrams/](./diagrams/)
  - [governance/](./治理/)
  - [templates/](./templates/)
  - [archive/](./archive/)
  - [../README.md](../README.md)
  - [../MEMORY.md](../MEMORY.md)
---

# Knowledge Curator — 生命周期视图层

> **Pipeline 层：Knowledge Governance（横切关注）** — 维护所有 pipeline 阶段依赖的 KB 结构。横跨整个 pipeline。
>
> **作为**知识 curator，**我希望**以清晰的治理方式维护知识库，**以便**内容可被发现且维护良好。
>
> Curator 是一个**META 角色**。它维护 KB 本身的结构——不创建领域内容。领域内容属于角色目录（[engineer/](../engineer/)、[leader/](../leader/)、[producter/](../producter/)、[aier/](../aier/)、[srer/](../srer/)、[executiver/](../executiver/)）。

## 快速导航

| 资源 | 描述 |
|---|---|
| [INDEX.md](./INDEX.md) | Curator 角色索引——子目录映射、文件计数、治理生命周期 |
| [COLLABORATION.md](./COLLABORATION.md) | 跨角色协作领域索引（团队流程、会议、onboarding、PM） |
| [governance/](./治理/) ([README](./治理/README.md)) | KB 生命周期、inbox/triage、准备清单、隐性知识 backlog——9 个文件 |
| [diagrams/](./diagrams/) ([README](./diagrams/README.md)) | 4 张规范图：knowledge-map、user-journey、directory-blueprint、dashboard-index——4 个文件 |
| [templates/](./templates/) ([README](./templates/README.md)) | 可复用模板：知识叶子、ADR、PRD、BRD、技术设计、会议等——15 个文件 |
| [archive/](./archive/) ([README](./archive/README.md)) | 已废弃文件索引及归档流程——2 个文件 |

## 范围

### 范围内（curator 拥有）
- **KB 治理**：生命周期管理、inbox/triage 工作流
- **内容质量**：frontmatter 校验、新鲜度检查、废弃
- **4 张图**：[knowledge map](./diagrams/knowledge-map.md)、[user-journey](./diagrams/user-journey.md)、[directory blueprint](./diagrams/directory-blueprint.md)、[governance flow](./治理/governance.md)
- **模板**：[knowledge leaf](./templates/knowledge-leaf.md)、[ADR](./templates/adr-template.md)、[PRD](./templates/prd.md)、[tech design](./templates/tech-design.md)、[BRD](./templates/brd.md) 等
- **Archive 管理**：通过 [archive.md](./archive/archive.md) 跟踪和清理已废弃文件
- **横切领域索引**：[SECURITY](../engineer/SECURITY.md)、[COLLABORATION](./COLLABORATION.md)、[ENGINEERING](../engineer/ENGINEERING.md)
- **运营节奏**：周/月/季度/年度审查（参见 [governance.md](./治理/governance.md)）

### 范围外（curator 不创建）
- 任何领域内容——架构、开发、AI、PM、SRE、战略等
- 如果内容回答的是"我如何做 X？"→ 属于角色目录，而非 curator/
- Curator 仅创建关于 KB 本身的内容（治理、图表、模板）

## 边界情况决策规则

| 当内容涉及... | 路由到 | 原因 |
|---|---|---|
| 如何写好知识叶子 | [curator/templates/](./templates/) | KB 元内容 |
| 如何设计 API | [engineer/build/](../engineer/build/) | 领域内容 |
| KB 审查流程 | [curator/治理/](./治理/) | KB 运营 |
| 代码审查流程 | [engineer/ship/](../engineer/ship/) | 领域内容 |
| Frontmatter 规范 | [curator/治理/](./治理/) | KB 标准 |
| API 规范格式 | [engineer/build/](../engineer/build/) | 领域内容 |
| KB 目录结构 | [curator/diagrams/](./diagrams/) | KB 架构 |
| 系统架构 | [engineer/build/](../engineer/build/) | 领域内容 |
| KB 文件废弃策略 | [curator/治理/](./治理/) | KB 生命周期 |
| API 废弃策略 | [engineer/build/](../engineer/build/) | 领域内容 |

### Curator 作为 KB 的"engineer + sre + leader"

Curator 为 KB 做的事，就像其他角色为产品做的事：
- **结构**（类似 [engineer/build/](../engineer/build/)）——目录蓝图、命名规范
- **质量**（类似 [engineer/ship/](../engineer/ship/)）——frontmatter 校验、[准备清单](./治理/readiness-checklist.md)
- **运营**（类似 [srer/](../srer/)）——inbox/triage 工作流、审查节奏
- **决策**（类似 [leader/](../leader/)）——治理规则、废弃策略

但 curator 仅将这些应用于 KB 本身，而非产品。

## Pipeline 流程

```
┌── curator/（Knowledge Governance——横切）──┐
│  输出：kb-lifecycle、kb-templates、kb-diagrams  │
└──────────────────────────────────────────────┘
    │ 服务于所有 pipeline 阶段
    ▼
producter/ ──→ leader/ ──→ engineer/ ──→ srer/
    ↑            ↑            ↑            ↑
    │ templates  │ ADR tmpl   │ leaf tmpl  │ postmortem
    └────────────┴────────────┴────────────┘
```

Curator 位于 pipeline **之上**，为每个阶段提供模板、治理和结构。它不参与阶段流程本身——它使流程成为可能。

## 总结

- 此目录不参与主题分类；仅承载生命周期 / 4 张图 / 运营机制视图，叠加在语义分类之上
- PARA 映射：Projects=`engineer/learn/projects/`、Areas=7 个角色目录、Archives=`archive/`
- lifecycle 字段流转：`inbox → triage → active → reference → archive`
- 4 张图各自独立文件：[knowledge-map](./diagrams/knowledge-map.md) / [user-journey](./diagrams/user-journey.md) / [directory-blueprint](./diagrams/directory-blueprint.md) / [governance](./治理/governance.md)
- 同时服务于人类和 YiAi BRD Agent：frontmatter 的 `lifecycle`/`related`/`tacit`/`tags`/`category` 是跨目录 RAG 召回的关键信号

## 核心观点

- **视图层独立于语义分类**——7 个角色目录保持不变；此目录仅增加视角，避免重写已有内容
- **lifecycle 字段是流转的唯一信号**——AI 和人类都依赖它来判断文件处于哪个阶段，决定是否召回/精炼/归档
- **知识地图永不过时**——AI 消费结构化知识，垃圾进垃圾出；显性+隐性双库存是 AI 时代唯一的护城河

## 新 curator 快速入门

1. 阅读 [governance flow](./治理/governance.md)——理解 4 角色、3 节奏模型
2. 审查 [4 张图](./diagrams/)——建立 KB 拓扑的思维模型
3. 运行 [准备清单](./治理/readiness-checklist.md)——任何 KB 变更前的 10 题门禁
4. 检查 [inbox.md](./治理/inbox.md) 和 [triage.md](./治理/triage.md)——处理 incoming 内容
5. 创建新文件时使用 [templates/](./templates/)——从 [knowledge-leaf.md](./templates/knowledge-leaf.md) 开始

## 关键信息

### PARA / lifecycle 映射

| PARA 概念 | YiKnowledge 映射 | 备注 |
|---|---|---|
| Projects | [engineer/learn/projects/](../engineer/learn/projects/) | 有明确目标和截止日期的活跃项目 |
| Areas | 7 个角色目录 | 持续维护的职责领域 |
| Resources | [aier/skills/](../aier/skills/)、[curator/templates/](./templates/) | 可复用资源（skills、prompts、templates） |
| Archives | [curator/archive/](./archive/) | 已完成或不再活跃的内容 |

### lifecycle 字段流转

```
inbox → triage → active → reference → archive
```

| 状态 | 含义 | 典型文件 | 管理位置 |
|---|---|---|---|
| `inbox` | 刚捕获的原始来源，未分类未精炼 | 原始捕获、链接、笔记 | [inbox.md](./治理/inbox.md) |
| `triage` | 已分类到正确叶子，待总结 | 已分类但未总结 | [triage.md](./治理/triage.md) |
| `active` | 已总结并引用 | 大多数 `*-summary.md` | 角色目录 |
| `reference` | 稳定的方法/模板，很少变更 | `*-template.md`、方法论文件 | [templates/](./templates/) |
| `archive` | 已废弃或被取代 | 旧版本、过时内容 | [archive.md](./archive/archive.md) |

### 4 张图实践

| 图 | 文件 | 回答的问题 | 子 README |
|---|---|---|---|
| 知识地图 | [knowledge-map.md](./diagrams/knowledge-map.md) | 存在哪些知识？显性 vs 隐性？ | [diagrams/](./diagrams/) |
| 用户旅程图 | [user-journey.md](./diagrams/user-journey.md) | 知识在哪里？断点在哪里？ | [diagrams/](./diagrams/) |
| 目录蓝图 | [directory-blueprint.md](./diagrams/directory-blueprint.md) | 用户如何一目了然地找到东西？ | [diagrams/](./diagrams/) |
| 治理流程 | [governance.md](./治理/governance.md) | 谁维护？多久一次？4 角色、3 节奏 | [governance/](./治理/) |

### 总入口和场景入口

| 入口 | 用途 |
|---|---|
| [inbox.md](./治理/inbox.md) | 总入口——原始捕获的知识中转站 |
| [triage.md](./治理/triage.md) | 待精炼队列——已分类但尚未总结 |
| [archive.md](./archive/archive.md) | 归档索引——已废弃文件登记表 |

## 运营节奏

| 节奏 | 操作 | 治理依据 |
|---|---|---|
| **每周** | 处理 inbox → triage，分类新内容 | [governance.md](./治理/governance.md) |
| **每月** | 审查 [review-log.md](./治理/review-log.md)，检查新鲜度标签 | [governance.md](./治理/governance.md) |
| **每季度** | 扫描 4 张图是否过时，审查 [tacit-knowledge-backlog.md](./治理/tacit-knowledge-backlog.md) | [governance.md](./治理/governance.md) |
| **每年** | 扫描 [archive.md](./archive/archive.md) 进行物理清理，全面 KB 审计 | [governance.md](./治理/governance.md) |

## 横切领域索引

Curator 维护 3 个领域索引，聚合所有角色目录中的内容：

| 领域索引 | 聚合内容 | 回答 |
|---|---|---|
| [SECURITY.md](../engineer/SECURITY.md) | 供应链、应用安全、风险、事件响应、合规 | 所有安全内容在哪里？ |
| [COLLABORATION.md](./COLLABORATION.md) | 团队流程、会议、知识分享、onboarding、PM | 所有协作内容在哪里？ |
| [ENGINEERING.md](../engineer/ENGINEERING.md) | 架构、质量、数据、工具、经验教训 | 所有工程内容在哪里？ |

## 关键跨阶段链接

### 模板 → 角色目录

| 模板 | 消费者 |
|---|---|
| [knowledge-leaf.md](./templates/knowledge-leaf.md) | [write-a-prd.md](../producter/discovery/write-a-prd.md)、[design-architecture-decision.md](../leader/架构/design-architecture-decision.md)、[implement-an-api.md](../engineer/build/implement-an-api.md) |
| [adr-template.md](./templates/adr-template.md) | [design-architecture-decision.md](../leader/架构/design-architecture-decision.md) |
| [prd.md](./templates/prd.md) | [producter/discovery/prd/](../producter/discovery/prd/) |
| [brd.md](./templates/brd.md) | [executiver/strategy/](../executiver/strategy/) |
| [tech-design.md](./templates/tech-design.md) | [engineer/build/](../engineer/build/) |

### 治理 → 角色目录

| 治理文件 | 驱动 |
|---|---|
| [evolve-the-knowledge-base.md](./治理/evolve-the-knowledge-base.md) | [knowledge-contributor-charter.md](../engineer/run/knowledge-contributor-charter.md) |
| [readiness-checklist.md](./治理/readiness-checklist.md) | 所有新 KB 内容的上线前门禁 |
| [review-log.md](./治理/review-log.md) | 内容审查跟踪 |
| [tacit-knowledge-backlog.md](./治理/tacit-knowledge-backlog.md) | 隐性知识捕获 |

### SOP 参考

- 知识审查 SOP：[../engineer/run/knowledge-review.md](../engineer/run/knowledge-review.md)
- 废弃策略：[../engineer/run/knowledge-deprecation-policy.md](../engineer/run/knowledge-deprecation-policy.md)

## 行动建议

1. 新内容首先进入 [inbox.md](./治理/inbox.md)，frontmatter `lifecycle: inbox`
2. 每周审查时，分类到正确叶子并将 `lifecycle` 改为 `triage`，注册到 [triage.md](./治理/triage.md)
3. 完成总结后，将 `lifecycle` 改为 `active`；原始来源变为 `lifecycle: reference`
4. 季度审查：扫描 4 张图和 [tacit-knowledge-backlog.md](./治理/tacit-knowledge-backlog.md)；年度审查：扫描 [archive.md](./archive/archive.md) 进行物理清理

## 反模式 / 常见误用

- **将此目录当作主题分类**——后果：与 7 个角色目录重叠，污染目录结构。修复：使用上方的[决策规则](#边界情况决策规则)表。
- **新文件缺少 lifecycle 字段**——后果：AI 召回信号弱，运营无法批量过滤未精炼内容。修复：发布前运行[准备清单](./治理/readiness-checklist.md)。
- **画了 4 张图但从不审查**——后果：知识地图过时，断点累积成知识丢失。修复：遵循[运营节奏](#运营节奏)时间表。
- **在 curator/ 中创建领域内容**——后果：内容对其目标角色受众不可见。修复：始终将领域内容放在正确的角色目录中；使用[角色边界决策树](../README.md#role-boundary-quick-reference)。
- **跳过 inbox → triage → active 流程**——后果：未分类内容堆积，可发现性降低。修复：每周处理 [inbox.md](./治理/inbox.md)。

## 相关

- **Curator 子 README**：[governance/](./治理/README.md) · [diagrams/](./diagrams/README.md) · [templates/](./templates/README.md) · [archive/](./archive/README.md)
- **Curator 索引**：[INDEX.md](./INDEX.md) · [COLLABORATION.md](./COLLABORATION.md)
- **上游**：[../README.md](../README.md)（顶层 pipeline 概览）· [../MEMORY.md](../MEMORY.md)（KB 规则手册）· [../INDEX.md](../INDEX.md)（全库索引）
- **4 张图**：[knowledge-map.md](./diagrams/knowledge-map.md) · [user-journey.md](./diagrams/user-journey.md) · [directory-blueprint.md](./diagrams/directory-blueprint.md) · [governance.md](./治理/governance.md)
---
title: YiKnowledge 项目规范索引
tags: [yiknowledge, specs, architecture, patterns, workflows, knowledge-base]
category: projects/yiknowledge/specs
created: 2026-09-02
updated: 2026-09-02
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator, 工程师]
benefit: "YiKnowledge 知识库的架构规范、文件模式、治理工作流一站式导航"
acceptance_criteria:
  - "所有架构规范子目录有链接"
  - "所有知识模式有链接"
  - "所有工作流有链接"
  - "与 MEMORY.md 和 curator/governance/ 交叉引用"
related:
  - ../../MEMORY.md
  - ../../README.md
  - ../../INDEX.md
  - ../../curator/governance/readiness-checklist.md
---

# YiKnowledge 项目规范索引

> YiKnowledge（Markdown 知识库）的架构规范、文件模式、治理工作流集中索引。8 个角色目录，4 个流水线阶段，RAG 数据源。

## 规范目录

### 架构规范

| 规范 | 文件 | 描述 |
|---|---|---|
| 项目架构摘要 | [项目架构摘要.md](./项目架构摘要.md) | 8 角色目录、4 流水线阶段、frontmatter 要求、命名规范、治理生命周期 |
| 文件约定 | [架构/文件规范/规范.md](./架构/文件规范/规范.md) | kebab-case 命名、3 级目录限制、frontmatter schema |
| 治理规范 | [架构/治理/规范.md](./架构/治理/规范.md) | 生命周期阶段、评审周期、就绪检查清单、curator 角色 |

### 知识模式

| 模式 | 文件 | 描述 |
|---|---|---|
| 知识条目模式 | [模式/知识条目/规范.md](./模式/知识条目/规范.md) | 如何编写知识文件、frontmatter 模板、内容结构 |

### 工作流

| 工作流 | 文件 | 描述 |
|---|---|---|
| 知识生命周期 | [workflows/知识生命周期.md](../workflows/知识生命周期.md) | 创建 → 评审 → 发布 → 更新 → 归档 |
| RAG 索引 | [workflows/rag-索引.md](../workflows/rag-索引.md) | YiAi 知识监听器 → MongoDB → 向量索引 |

## 项目概述

| 属性 | 值 |
|---|---|
| 项目名称 | YiKnowledge |
| 类型 | Markdown 知识库 |
| 角色目录 | 8 个：engineer, leader, producter, aier, srer, executiver, curator, projects |
| 流水线阶段 | 4 个：inbox → triage → active → archive |
| 文件命名 | kebab-case，无下划线，无数字 |
| 目录层级 | 最多 3 级 |
| 定位 | 人类文档 + AI RAG 数据源 |

## 交叉引用

- [MEMORY.md](../../MEMORY.md) — 知识库规则手册和命名约定
- [README.md](../../README.md) — 知识库顶层概览
- [INDEX.md](../../INDEX.md) — 知识库完整索引
- [就绪检查清单](../../curator/governance/readiness-checklist.md) — 内容发布前 10 项自检
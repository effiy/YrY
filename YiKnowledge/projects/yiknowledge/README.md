---
title: YiKnowledge 知识库索引
tags: [yiknowledge, index, architecture, roles, governance, rag]
category: projects/yiknowledge
created: 2026-08-25
updated: 2026-09-20
source: YiKnowledge
type: index
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, leader, curator]
benefit: "YiKnowledge 知识库的项目知识体系——角色边界、治理规范、RAG 集成、工作流"
---

# YiKnowledge 项目知识库

> Markdown 知识库的完整知识体系 — 架构设计、角色边界、治理规范、AI 集成。同时服务于人类（文档）和 AI（YiAi RAG 数据源）。

## 目录结构

```
YiKnowledge/projects/yiknowledge/
├── README.md                  # 本文件 — 总索引
├── workflows/                 # 架构规范 + 开发规范 + 操作指南 + 流程规范（20 篇）
│   ├── 架构设计/              # 6 篇 — 架构概览、项目架构摘要、目录结构、角色边界、RAG 集成、规范索引
│   ├── 开发规范/              # 6 篇 — OpenSpec 工作流、文件约定、Frontmatter 模式、治理规范、知识条目模式、知识条目创建
│   ├── 操作指南/              # 4 篇 — 快速开始、知识生命周期、知识管理规范、RAG 索引工作流
│   └── 流程规范/              # 4 篇 — 分支管理、变更落地、变更状态管理、PRD 到 Proposal
├── prds/                      # 产品需求（按月归档）
│   └── {month}/               # 2026-07/08/09
├── devs/                      # 开发方案
├── tests/                     # 测试用例
└── bugs/                      # 缺陷（按分类归档）
    ├── README.md              # 缺陷索引 + 分类目录 + 常见模式 + 排查流程
    ├── frontmatter/           # Frontmatter 类
    ├── naming/                # 命名类
    └── sync/                  # 同步类
```

## 快速导航

### 新人入门

1. [快速开始](./workflows/操作指南/001-指南-快速开始.md) — 如何查阅和添加知识
2. [架构概览](./workflows/架构设计/001-架构设计-架构概览.md) — 软件交付流水线、角色体系
3. [角色边界](./workflows/架构设计/004-架构设计-角色边界.md) — 7 个角色职责、决策树
4. [知识管理规范](./workflows/操作指南/003-指南-知识管理规范.md) — 文件命名、Frontmatter、生命周期

### 日常使用

| 场景 | 参考文档 |
|------|----------|
| 添加新知识 | [快速开始](./workflows/操作指南/001-指南-快速开始.md) + [知识条目模式](./workflows/开发规范/005-开发规范-知识条目模式.md) |
| 确定内容归属 | [角色边界 #决策树](./workflows/架构设计/004-架构设计-角色边界.md) |
| 编写 Frontmatter | [Frontmatter 模式](./workflows/开发规范/003-开发规范-Frontmatter模式.md) |
| 运行就绪检查 | [知识管理规范 #就绪检查](./workflows/操作指南/003-指南-知识管理规范.md) |
| 查找过期内容 | [知识管理规范 #生命周期](./workflows/操作指南/003-指南-知识管理规范.md) |
| 理解 RAG 集成 | [RAG 检索引擎集成](./workflows/架构设计/005-架构设计-RAG检索引擎集成.md) |
| 管理知识生命周期 | [知识生命周期](./workflows/操作指南/002-指南-知识生命周期.md) |
| 构建 RAG 索引 | [RAG 索引工作流](./workflows/操作指南/004-指南-RAG索引工作流.md) |

### 内容审查

| 检查项 | 参考 |
|--------|------|
| 文件名是否 kebab-case | [知识管理规范 #文件命名](./workflows/操作指南/003-指南-知识管理规范.md) |
| Frontmatter 是否包含 8 个必需字段 | [Frontmatter 模式](./workflows/开发规范/003-开发规范-Frontmatter模式.md) |
| 目录层级是否 ≤ 3 | [架构概览 #设计原则](./workflows/架构设计/001-架构设计-架构概览.md) |
| 是否属于正确的角色目录 | [角色边界 #决策树](./workflows/架构设计/004-架构设计-角色边界.md) |
| 内容结构是否遵循三段式 | [知识条目模式](./workflows/开发规范/005-开发规范-知识条目模式.md) |

### 流程操作

| 操作 | 参考 |
|------|------|
| 创建新分支 | [分支管理](./workflows/流程规范/001-流程-分支管理规范.md) |
| 需求转提案 | [PRD → Proposal](./workflows/流程规范/004-流程-PRD到Proposal流程.md) |
| OpenSpec 变更 | [OpenSpec 规范](./workflows/开发规范/001-规范-OpenSpec工作流规范.md) |
| 变更状态推进 | [状态管理](./workflows/流程规范/003-流程-变更状态管理规范.md) |
| 代码收口落地 | [落地流程](./workflows/流程规范/002-流程-变更落地工作流.md) |
| 管理知识生命周期 | [知识生命周期](./workflows/操作指南/002-指南-知识生命周期.md) |

## 关键约束速查

### 必须遵守
- 文件命名使用 **kebab-case**，禁止下划线和数字
- 目录层级**最多 3 层**：`role/problem-domain/file.md`
- YAML **frontmatter 必填**（title, tags, category, created, updated, source, type, status — 8 个字段）
- 正文遵循统一结构：Summary → Core viewpoints → Key information
- 每条知识属于**唯一角色目录**，多角色覆盖用 frontmatter `roles:` 字段
- 代码示例不超过 5 行，标注语言类型

### 禁止
- 不在文件名中使用下划线或数字
- 不超过 3 级目录层级
- 不包含大段代码（纯文档/知识）
- 不跳过就绪检查清单
- 不在 frontmatter 中使用中文 key
- 不创建 `misc/`、`other/` 等模糊分类目录
- 不将同一文件放在多个角色目录中

## 技术栈速查

| 技术 | 用途 |
|------|------|
| Markdown + YAML frontmatter | 知识存储格式 |
| kebab-case 文件命名 | 文件命名规范 |
| 7 角色目录 + 5 流水线阶段 | 知识组织结构 |
| apscheduler (YiAi) | 每 60s 轮询扫描知识库变更 |
| MongoDB (YiAi) | 知识文件元数据存储 |
| llama_index (YiAi) | 混合检索（向量 + BM25） |
| Ollama (YiAi) | LLM 推理 + Embedding 生成 |

## 相关资源

- [YiKnowledge/README.md](../../README.md) — 知识库概述 + 流水线架构
- [YiKnowledge/INDEX.md](../../INDEX.md) — 全库导航索引
- [YiKnowledge/MEMORY.md](../../MEMORY.md) — 知识库规则手册
- [YiKnowledge/CLAUDE.md](../../CLAUDE.md) — 知识库 CLAUDE.md（角色边界、文件约定、治理规则）
- [YiKnowledge/curator/governance/](../../curator/governance/) — 知识治理文档
- [YiKnowledge/curator/templates/](../../curator/templates/) — 文档模板
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — YiAi 后端 CLAUDE.md
- [YrY/CLAUDE.md](../../../CLAUDE.md) — 单体仓库级 CLAUDE.md
---
title: YiKnowledge 知识库索引
tags: [yiknowledge, index, architecture, roles, governance, rag]
category: projects/yiknowledge
created: 2026-08-25
updated: 2026-09-10
source: YiKnowledge
type: index
status: active
---

# YiKnowledge 项目知识库

> Markdown 知识库的完整知识体系 — 架构设计、角色边界、治理规范、AI 集成。同时服务于人类（文档）和 AI（YiAi RAG 数据源）。

## 目录结构

```
YiKnowledge/projects/yiknowledge/
├── README.md                  # 本文件 — 总索引
├── specs/                     # 架构规范 + 知识模式 + AI 代码生成规范（11 篇）
│   ├── overview.md            # 架构概览（流水线、角色、RAG 集成、设计原则）
│   ├── directory-structure.md # 完整目录结构（8 个角色 + 治理层、文件生命周期）
│   ├── role-boundaries.md     # 角色边界（决策树、Chip 契约、高频冲突、多角色覆盖）
│   ├── rag-integration.md     # AI 检索引擎集成（Watcher → MongoDB → RAG 混合检索）
│   ├── knowledge-entry.md     # 知识条目模式（三段式结构、反模式、代码示例）
│   ├── knowledge-entry-creation.md # 知识条目创建流程（验证脚本、批量操作、生命周期）
│   ├── frontmatter.md         # YAML Frontmatter 规范（8 个必需字段、类型约束）
│   ├── architecture.md        # 架构规范
│   ├── file-standards.md      # 文件规范
│   ├── governance.md          # 治理规范
│   └── index.md               # 规范索引
├── workflows/                 # 使用指南 + 工作流（9 篇）
│   ├── quickstart.md          # 快速开始（查阅、添加、AI 集成、搜索策略）
│   ├── knowledge-standards.md # 知识管理规范（文件命名、Frontmatter、生命周期、角色边界）
│   ├── branching.md           # 分支管理策略（环境映射、发布流程、hotfix）
│   ├── knowledge-lifecycle.md # 知识生命周期管理（draft → review → stable → deprecated → archived）
│   ├── rag-index.md           # RAG 索引构建流程（Watcher 扫描 → MongoDB → 向量索引）
│   ├── prd-to-proposal.md     # PRD → Proposal 结构化提炼
│   ├── standards.md           # OpenSpec 工作流规范（子代理、质量门禁、项目约束）
│   ├── state.md               # 变更状态管理（生命周期、检查清单、异常处理）
│   └── land.md                # 变更落地流程（回写、验证、确认、提交）
├── requirements/              # 需求（按月归档）
│   ├── 2026-07/               # 7 月需求（知识库体系规划、Frontmatter 规范、质量评估）
│   └── 2026-08/               # 8 月需求（目录结构、元数据规范、治理流水线、RAG 集成等）
└── bugs/                      # 缺陷（按分类归档）
    ├── README.md              # 缺陷索引 + 分类目录 + 常见模式 + 排查流程
    ├── template/              # 缺陷模板
    ├── frontmatter/           # Frontmatter 类
    ├── naming/                # 命名类
    └── sync/                  # 同步类
```

## 快速导航

### 新人入门

1. [快速开始](./workflows/操作指南/01-快速开始.md) — 如何查阅和添加知识
2. [架构概览](./specs/架构设计/01-架构概览.md) — 软件交付流水线、角色体系
3. [角色边界](./specs/架构设计/04-角色边界.md) — 8 个角色职责、决策树
4. [知识管理规范](./workflows/操作指南/03-知识管理规范.md) — 文件命名、Frontmatter、生命周期

### 日常使用

| 场景 | 参考文档 |
|------|----------|
| 添加新知识 | [快速开始 #添加知识](./workflows/操作指南/01-快速开始.md) + [知识条目模式](./specs/开发规范/04-知识条目模式.md) |
| 确定内容归属 | [角色边界 #决策树](./specs/架构设计/04-角色边界.md) |
| 编写 Frontmatter | [Frontmatter 规范](./specs/开发规范/02-Frontmatter模式.md) |
| 运行就绪检查 | [知识管理规范 #就绪检查](./workflows/操作指南/03-知识管理规范.md) |
| 查找过期内容 | [知识管理规范 #生命周期](./workflows/操作指南/03-知识管理规范.md) |
| 理解 RAG 集成 | [RAG 集成](./specs/架构设计/05-RAG检索引擎集成.md) |
| 管理知识生命周期 | [知识生命周期](./workflows/操作指南/02-知识生命周期.md) |
| 构建 RAG 索引 | [RAG 索引](./workflows/操作指南/04-RAG索引工作流.md) |
| 处理多角色内容 | [角色边界 #多角色覆盖](./specs/架构设计/04-角色边界.md) |

### 内容审查

| 检查项 | 参考 |
|--------|------|
| 文件名是否 kebab-case | [知识管理规范 #文件命名](./workflows/操作指南/03-知识管理规范.md) |
| Frontmatter 是否包含 8 个必需字段 | [Frontmatter 规范](./specs/开发规范/02-Frontmatter模式.md) |
| 目录层级是否 ≤ 3 | [架构概览 #设计原则](./specs/架构设计/01-架构概览.md) |
| 是否属于正确的角色目录 | [角色边界 #决策树](./specs/架构设计/04-角色边界.md) |
| 多角色文件是否声明 roles 字段 | [角色边界 #多角色覆盖](./specs/架构设计/04-角色边界.md) |
| 内容结构是否遵循三段式 | [知识条目模式](./specs/开发规范/04-知识条目模式.md) |
| 反模式示例是否包含错误/正确/原因 | [知识条目模式 #反模式](./specs/开发规范/04-知识条目模式.md) |
| 是否更新了角色 INDEX.md | [架构概览 #角色目录](./specs/架构设计/01-架构概览.md) |

### 流程操作

| 操作 | 参考 |
|------|------|
| 创建新分支 | [分支管理](./workflows/流程规范/01-分支管理规范.md) |
| 需求转提案 | [PRD → Proposal](./workflows/流程规范/04-PRD到Proposal流程.md) |
| OpenSpec 变更 | [OpenSpec 规范](./workflows/开发规范/01-OpenSpec工作流规范.md) |
| 变更状态推进 | [状态管理](./workflows/流程规范/03-变更状态管理规范.md) |
| 代码收口落地 | [落地流程](./workflows/流程规范/02-变更落地工作流.md) |
| 管理知识生命周期 | [知识生命周期](./workflows/操作指南/02-知识生命周期.md) |

## 关键约束速查

### 必须遵守
- 文件命名使用 **kebab-case**，禁止下划线和数字
- 目录层级**最多 3 层**：`role/problem-domain/file.md`
- YAML **frontmatter 必填**（title, tags, category, created, updated, source, type, status — 8 个字段）
- 正文遵循统一结构：Summary → Core viewpoints → Key information
- 每条知识属于**唯一角色目录**，多角色覆盖用 frontmatter `roles:` 字段
- 代码示例完整可运行，标注语言类型
- 反模式示例包含错误/正确/原因三列

### 禁止
- 不在文件名中使用下划线或数字
- 不超过 3 级目录层级
- 不包含代码（纯文档/知识）
- 不跳过就绪检查清单
- 不在 frontmatter 中使用中文 key（使用英文 key）
- 不创建 `misc/`、`other/` 等模糊分类目录
- 不将同一文件放在多个角色目录中

## 技术栈速查

| 技术 | 用途 |
|------|------|
| Markdown + YAML frontmatter | 知识存储格式 |
| kebab-case 文件命名 | 文件命名规范 |
| 8 角色目录 + 4 流水线阶段 | 知识组织结构 |
| apscheduler (YiAi) | 每 5s 轮询扫描知识库变更 |
| MongoDB (YiAi) | 知识文件元数据 + 向量存储 |
| llama_index (YiAi) | 混合检索（向量 + BM25） |
| Ollama (YiAi) | LLM 推理 + Embedding 生成 |
| Chip 契约 | 角色间知识传递标准 |

## 相关资源

- [YiKnowledge/README.md](../../README.md) — 知识库概述 + 流水线架构
- [YiKnowledge/INDEX.md](../../INDEX.md) — 全库导航索引
- [YiKnowledge/MEMORY.md](../../MEMORY.md) — 知识库规则手册
- [YiKnowledge/curator/governance/](../../curator/governance/) — 知识治理文档（生命周期、就绪检查、分类标准）
- [YiKnowledge/curator/templates/](../../curator/templates/) — 文档模板
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — YiAi 后端 CLAUDE.md
- [YrY/CLAUDE.md](../../../CLAUDE.md) — 单体仓库级 CLAUDE.md
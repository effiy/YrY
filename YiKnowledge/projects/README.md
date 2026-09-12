---
title: 项目知识中心
tags: [projects, navigation, hub, yivad, yiai, yipet, yiknowledge]
category: projects
created: 2026-08-26
updated: 2026-09-11
source: internal
type: overview
status: active
---

# 项目知识中心

> 4 个项目，1,200+ 知识文件。项目特定的规范文档、需求记录、缺陷报告和架构参考均存放于此。跨项目通用模式存放于 [engineer/](../engineer/) 角色目录。

## 项目总览

| 项目 | 定位 | 技术栈 | 规范 | 工作流 | 缺陷 | 需求 |
|---|---|---|---|---|---|---|
| [YiVad](./yivad/) | Vue 3.5 管理后台 | Vue 3.5 + Rsbuild + Pinia + Element Plus + ECharts | [18 篇](./yivad/specs/) | [11 篇](./yivad/workflows/) | [100 个缺陷](./yivad/bugs/) | [102 个 PRD](./yivad/prds/), [32 个 dev 模块](./yivad/devs/) |
| [YiAi](./yiai/) | FastAPI 后端 | FastAPI + MongoDB + Ollama + llama_index | [18 篇](./yiai/specs/) | [12 篇](./yiai/workflows/) | [100 个缺陷](./yiai/bugs/) | [258 个 PRD](./yiai/requirements/) |
| [YiPet](./yipet/) | Chrome MV3 扩展 | Vue 3.5 + Chrome MV3 + Rsbuild | [18 篇](./yipet/specs/) | [13 篇](./yipet/workflows/) | [68 个缺陷](./yipet/bugs/) | [248 个 PRD](./yipet/requirements/) |
| [YiKnowledge](./yiknowledge/) | 个人知识库 | Markdown + YAML Frontmatter | [11 篇](./yiknowledge/specs/) | [9 篇](./yiknowledge/workflows/) | [5 个缺陷](./yiknowledge/bugs/) | [199 个 PRD](./yiknowledge/requirements/) |

## 项目简介

| 项目 | 核心职责 | 关键模块 |
|---|---|---|
| **YiVad** | 管理后台 SPA —— ProTable 驱动、动态路由、按钮级权限控制，17 个功能页面 | 项目管理、Issue 追踪、模块管理、Bug 看板、Roadmap 路线图、AI 聊天、知识库、RAG 检索、RSS 内容、全局搜索 |
| **YiAi** | AI 后端 —— 所有前端项目的唯一数据源，RPC 信封路由、SSE 流式响应、RAG 引擎、Agent 循环、RSS 聚合、企业微信消息 | 聊天服务、数据服务、文件服务、知识库服务、RAG 服务、RSS 服务、Agent 服务、认证服务 |
| **YiPet** | 浏览器扩展 —— 向任意页面注入交互式宠物伴侣，多角色聊天、知识基底集成、跨项目桥接到 YiVad，4 层 API 架构 | Content Script（ISOLATED World）、Service Worker、聊天窗口、浮动宠物、Popup 弹窗 |
| **YiKnowledge** | 知识库 —— 8 个角色目录、5 个流水线阶段、知识治理生命周期、YiAi 的 RAG 数据源 | 知识治理、工程实践、技术决策、产品需求、AI 赋能、SR 运维、业务战略 |

## 近期动态（2026-09）

| 项目 | 状态 | 重点工作 |
|---|---|---|
| **YiVad** | 活跃开发 — 18 个 PRD 进行中 | 项目页面全量重构（God Component → composable + 组件拆分），17 个子页面架构优化 |
| **YiAi** | 稳定迭代 | RAG 增量刷新缺陷修复、GraphQL 联邦层设计 |
| **YiPet** | 稳定维护 | 安全合规加固、NativeMessaging 探索（已取消） |
| **YiKnowledge** | 活跃治理 | 跨项目 Issue 管理、知识生命周期治理、文件命名规范化（{序号}-{分类}-{描述}.md） |

## 文件统计详情

### YiVad (Vue 3.5 管理后台)

| 分类 | 文件数 | 内容 |
|---|---|---|
| [okrs/](./yivad/okrs/) | 3 | OKR 目标与关键结果：2026-Q3 (2 个目标) |
| [prds/](./yivad/prds/) | 102 | 产品需求 PRD：2026-08 (13)、2026-09 (89) |
| [devs/](./yivad/devs/) | 32 | 开发模块文档：2026-08 (6)、2026-09 (26) |
| [tests/](./yivad/tests/) | 5 | 测试策略与用例：2026-08 (1)、2026-09 (4) |
| [bugs/](./yivad/bugs/) | 100 | 缺陷报告：代码质量 (69)、数据 (10) |
| [specs/](./yivad/specs/) | 18 | 架构设计 (6) + 开发规范 (7) + 功能模式 (4)：架构概览、路由、权限、API、组件、TypeScript、国际化、表单、上传、状态管理 |
| [workflows/](./yivad/workflows/) | 11 | 流程规范 (5) + 操作指南 (2) + 开发规范 (4)：快速开始、编码规范、构建部署、依赖、分支、添加页面、PRD转Proposal、状态、落地 |
| [requires/](./yivad/requires/) | 1 | 需求文档：功能需求、技术需求 |

### YiAi (FastAPI 后端)

| 分类 | 文件数 | 内容 |
|---|---|---|
| [bugs/](./yiai/bugs/) | 100 | 缺陷报告：代码质量 (79)、rag (2)、sse (1)、中间件 (1)、企业微信 (1)、mcp (1)、执行 (1)、搜索 (1)、数据 (1)、配置 (1)、认证 (1)、知识库 (1)、llm (1)、状态 (1)、api (1) |
| [requirements/](./yiai/requirements/) | 258 | 功能/改进需求：2026-07 (7)、2026-08 (15)、2026-09 (233) |
| [specs/](./yiai/specs/) | 18 | 架构设计 (6) + 开发规范 (9) + 功能模式 (3)：RPC协议、领域服务、API参考、数据模型、认证、数据库、核心模块、Repository |
| [workflows/](./yiai/workflows/) | 12 | 流程规范 (6) + 操作指南 (3) + 开发规范 (3)：快速开始、编码规范、构建部署、依赖、分支、部署、添加领域模块、跨项目开发、PRD转Proposal、状态、落地 |

### YiPet (Chrome MV3 扩展)

| 分类 | 文件数 | 内容 |
|---|---|---|
| [bugs/](./yipet/bugs/) | 68 | 缺陷报告：代码质量 (56)、api (2)、构建 (1)、聊天 (1)、content (1)、安全 (1)、状态 (1)、service-worker (1) |
| [requirements/](./yipet/requirements/) | 248 | 功能/改进需求：2026-07 (6)、2026-08 (7)、2026-09 (231)。详见 [requirements/INDEX.md](./yipet/requirements/INDEX.md) |
| [specs/](./yipet/specs/) | 18 | 架构设计 (7) + 开发规范 (8) + 功能模式 (3)：扩展架构、API、API层、双世界、认证、组件、TypeScript、国际化、CDN注入、ChatStore、IPC桥接、状态管理、错误处理 |
| [workflows/](./yipet/workflows/) | 13 | 流程规范 (6) + 操作指南 (3) + 开发规范 (4)：快速开始、编码规范、构建部署、依赖、测试、分支、扩展发布、添加功能、PRD转Proposal、状态、落地 |

### YiKnowledge (知识库)

| 分类 | 文件数 | 内容 |
|---|---|---|
| [bugs/](./yiknowledge/bugs/) | 5 | 缺陷报告：frontmatter、命名、同步、模板 |
| [requirements/](./yiknowledge/requirements/) | 199 | 功能/改进需求：2026-07 (6)、2026-08 (7)、2026-09 (186) |
| [specs/](./yiknowledge/specs/) | 11 | 架构设计 (6) + 开发规范 (5)：架构概览、目录结构、角色边界、RAG集成、Frontmatter、知识条目、文件约定、治理 |
| [workflows/](./yiknowledge/workflows/) | 9 | 流程规范 (4) + 操作指南 (4) + 开发规范 (1)：快速开始、知识标准、知识生命周期、RAG索引、分支、PRD转Proposal、状态、落地 |

## 与 engineer/learn/projects/ 的关系

[engineer/learn/projects/](../engineer/learn/projects/) 存放的是**工程化**项目文档（架构设计、开发规范、功能模块、Story）。当前 `projects/` 目录存放的是**运维**项目产物（需求记录、参考文档、缺陷报告）。

| 内容类型 | 存放位置 |
|---|---|
| 架构设计文档、开发规范、Story | [engineer/learn/projects/](../engineer/learn/projects/)（按 yivad/yiai/yipet 子目录组织） |
| 缺陷报告、需求 PRD、参考文档、规范说明 | `projects/<项目名>/` |

## 每项目知识结构

每个项目目录统一包含知识产物。YiVad 已采用 **OKR → PRD → Dev → Test** 全链路追溯结构：

```
projects/<项目名>/
├── README.md           # 项目知识库索引（快速导航、约束速查、技术栈速查）
├── okrs/               # OKR 目标与关键结果（按季度归档）
│   └── {quarter}/
│       ├── README.md               # OKR → PRD 可追溯矩阵
│       └── goal-NNN-{描述}.md      # OKR 目标文件（含 related_prds）
├── prds/               # 产品需求 PRD（按月归档，含 source_okr 追溯）
│   └── {month}/
│       ├── 00-prd-{迭代总览}.md    # PRD 总览（含 related_modules, related_tests）
│       └── NN-prd-{描述}.md        # 子需求 PRD
├── devs/               # 开发模块文档（按月归档，含 prd_task_id 追溯）
│   └── {month}/
│       ├── README.md               # OKR→PRD→Module→Test 全链路追溯矩阵
│       └── NN-module-{描述}.md     # 开发模块文档
├── tests/              # 测试文档（按月归档，含 source_modules 追溯）
│   └── {month}/
│       ├── README.md               # PRD→Module→Test 可追溯矩阵
│       └── NN-test-{描述}.md       # 测试文档
├── bugs/               # 缺陷报告（按分类子目录归档，含 source_prd 追溯）
│   ├── README.md                   # 缺陷索引 + 追溯规范
│   └── {分类}/
├── specs/              # 架构规范 + 实现模式
├── workflows/          # 开发指南 + 工作流
└── requires/           # 需求文档（原始需求）
```

### 追溯链路

```
OKR (goal-NNN) ──related_prds──→ PRD (prd_task_id)
                                       │
                    ┌──────────────────┼──────────────────┐
                    ↓                     ↓                     ↓
              Dev Module            Bug (source_prd)     Test (source_prds)
              (prd_task_id)                              (source_modules)
                    │
                    └───→ Test (source_modules)
```

**规则：**
- 每个 **PRD** 的 `source_okr` 关联到 OKR 目标
- 每个 **Dev Module** 的 `prd_task_id` 关联到 PRD 需求编号
- 每个 **Bug** 的 `source_prd` 关联到来源 PRD
- 每个 **Test** 的 `source_modules` 关联到 Dev Module

## 文件命名规范

当前所有知识文件统一采用 `{序号}-{分类}-{描述}.md` 的命名格式：

| 目录 | 分类前缀 | 示例 |
|---|---|---|
| 架构设计/ | `架构` | `01-架构-架构概览.md` |
| 功能模式/ | `模式` | `01-模式-列表页模式.md` |
| 开发规范/ | `规范` | `01-规范-API规范.md` |
| 流程规范/ | `流程` | `01-流程-分支管理规范.md` |
| 操作指南/ | `指南` | `01-指南-快速开始.md` |
| requires/ | `需求` | `01-需求-ProTable组件提取.md` |

## 跨项目关联

- [../engineer/learn/projects/](../engineer/learn/projects/) — 工程类项目文档（架构、开发规范、技术方案）
- [../engineer/learn/projects/INDEX.md](../engineer/learn/projects/INDEX.md) — 工程类项目索引
- [../leader/decisions/](../leader/decisions/) — 架构决策记录（按项目分组）
- [../INDEX.md](../INDEX.md) — 知识库顶层索引
- [../../CLAUDE.md](../../CLAUDE.md) — 根单体仓库 CLAUDE.md（RPC 协议、跨项目关系）
- [../../YiAi/CLAUDE.md](../../YiAi/CLAUDE.md) — YiAi 项目约束与近期变更
- [../../YiVad/CLAUDE.md](../../YiVad/CLAUDE.md) — YiVad 项目约束与近期变更
- [../../YiPet/CLAUDE.md](../../YiPet/CLAUDE.md) — YiPet 项目约束与近期变更

## 导航入口

| 入口 | 适用场景 |
|---|---|
| [INDEX.md](./INDEX.md) | 查看所有项目的完整文件清单，按项目 × 分类的矩阵视图 |
| [yivad/README.md](./yivad/README.md) | 进入 YiVad 知识库：新人入门、日常开发、代码审查、约束速查 |
| [yiai/README.md](./yiai/README.md) | 进入 YiAi 知识库：新人入门、日常开发、代码审查、约束速查 |
| [yipet/README.md](./yipet/README.md) | 进入 YiPet 知识库：新人入门、日常开发、代码审查、约束速查 |
| [yiknowledge/README.md](./yiknowledge/README.md) | 进入 YiKnowledge 项目知识：知识治理、RAG 集成 |
| [../INDEX.md](../INDEX.md) | 返回知识库顶级导航索引，按角色目录和流水线阶段浏览 |
| [../engineer/learn/projects/](../engineer/learn/projects/) | 跨项目通用工程文档（架构、规范、Story） |
| [../../CLAUDE.md](../../CLAUDE.md) | 单体仓库级 CLAUDE.md（RPC 协议、跨项目关系） |
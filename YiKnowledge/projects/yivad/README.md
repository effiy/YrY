---
title: YiVad 知识库索引
tags: [yivad, index, specs, workflows, bugs, okrs, prds, devs, tests]
category: projects/yivad
created: 2026-09-02
updated: 2026-09-10
source: YiVad
type: index
status: active
---

# YiVad 项目知识库

> Vue 3.5 管理后台的完整知识体系 — 架构规范、页面模式、开发指南、工作流、需求、缺陷。

## 目录结构

```
YiKnowledge/projects/yivad/
├── README.md                  # 本文件 — 总索引
├── okrs/                      # OKR 目标与关键结果（OKR → PRD 追溯）
│   └── 2026-Q3/               # Q3 OKR
│       ├── README.md          # OKR → PRD 可追溯矩阵
│       ├── goal-001-架构重构.md
│       └── goal-002-文档分离.md
├── prds/                      # 产品需求 PRD（按月归档，PRD → Dev 追溯）
│   ├── 2026-08/               # 8 月需求（组件化、RBAC、暗色主题等）
│   └── 2026-09/               # 9 月需求（composable 分层、国际化、样式改造等）
├── devs/                      # 开发模块文档（按月归档，Dev → Test 追溯）
│   ├── 2026-08/               # 8 月开发模块
│   └── 2026-09/               # 9 月开发模块
│       └── README.md          # OKR→PRD→Module→Test 全链路追溯矩阵
├── tests/                     # 测试文档（按月归档，Test → Dev 追溯）
│   ├── 2026-08/
│   └── 2026-09/
│       └── README.md          # PRD→Module→Test 可追溯矩阵
├── workflows/                 # 开发规范 + 操作指南 + 流程规范（29 篇）
│   ├── 开发规范/               # 22 篇 — 项目规范、编码、架构、组件、API、TypeScript、权限、国际化、依赖、模式等
│   ├── 操作指南/               # 2 篇 — 快速开始、添加新页面
│   └── 流程规范/               # 5 篇 — 分支管理、变更落地、状态管理、PRD→Proposal、构建部署
└── bugs/                      # 缺陷（按分类归档）
    ├── README.md              # 缺陷索引 + 分类目录 + 常见模式 + 排查流程
    ├── 代码质量/              # 代码质量类
    ├── 数据/                  # 数据类
    └── 模板/                  # Bug 模板
```

## 快速导航

### 新人入门

1. [快速开始](./workflows/操作指南/01-指南-快速开始.md) — 环境搭建、安装启动
2. [架构概览](./workflows/开发规范/13-规范-架构概览.md) — 技术栈、分层架构、数据流
3. [目录结构](./workflows/开发规范/14-规范-目录结构.md) — 完整源码目录树
4. [编码规范](./workflows/开发规范/01-规范-项目规范.md) — 命名、提交、质量门禁

### 需求与追溯

| 入口 | 说明 |
|------|------|
| [OKR 目标](./okrs/2026-Q3/README.md) | OKR → PRD 可追溯矩阵 |
| [PRD 需求](./prds/2026-09/00-prd-九月迭代总览.md) | 九月迭代需求总览 |
| [Dev 开发模块](./devs/2026-09/README.md) | OKR→PRD→Module→Test 全链路追溯矩阵 |
| [Test 测试文档](./tests/2026-09/README.md) | PRD→Module→Test 可追溯矩阵 |
| [Bug 缺陷索引](./bugs/README.md) | 缺陷分类索引 + 追溯规范 |

### 日常开发

| 场景 | 参考文档 |
|------|----------|
| 开发列表页 | [列表页模式](./workflows/开发规范/19-规范-列表页模式.md) |
| 开发表单页 | [表单页模式](./workflows/开发规范/21-规范-表单页模式.md) |
| 添加搜索功能 | [搜索表单模式](./workflows/开发规范/20-规范-搜索表单模式.md) |
| 添加文件上传 | [上传模式](./workflows/开发规范/22-规范-文件上传模式.md) |
| 调用后端 API | [API 规范](./workflows/开发规范/05-规范-API规范.md) |
| 添加按钮权限 | [权限认证规范](./workflows/开发规范/09-规范-权限认证规范.md) |
| 使用 ProTable | [组件规范](./workflows/开发规范/10-规范-组件结构规范.md) |
| 添加国际化文本 | [国际化规范](./workflows/开发规范/08-规范-国际化规范.md) |
| 定义 TypeScript 类型 | [TypeScript 规范](./workflows/开发规范/07-规范-TypeScript类型规范.md) |
| 配置路由/菜单 | [路由菜单](./workflows/开发规范/16-规范-路由菜单.md) |

### 代码审查

| 检查项 | 参考 |
|--------|------|
| 是否使用 ProTable 而非 el-table | [组件规范](./workflows/开发规范/10-规范-组件结构规范.md) |
| 是否使用 v-auth 而非 v-if 权限判断 | [权限认证规范](./workflows/开发规范/09-规范-权限认证规范.md) |
| 是否使用 $t() 而非硬编码文本 | [国际化规范](./workflows/开发规范/08-规范-国际化规范.md) |
| 是否通过 RequestHttp 而非直接 axios | [API 规范](./workflows/开发规范/05-规范-API规范.md) |
| 参数名是否使用 filter 而非 query | [API 规范 #关键参数名约定](./workflows/开发规范/05-规范-API规范.md) |
| 是否使用 `<script setup lang="ts">` | [编码规范](./workflows/开发规范/01-规范-项目规范.md) |
| TypeScript 类型检查是否通过 | [编码规范](./workflows/开发规范/01-规范-项目规范.md) |

### 流程操作

| 操作 | 参考 |
|------|------|
| 创建新分支 | [分支管理](./workflows/流程规范/01-流程-分支管理规范.md) |
| 需求转提案 | [PRD → Proposal](./workflows/流程规范/04-流程-PRD到Proposal流程.md) |
| OpenSpec 变更 | [OpenSpec 规范](./workflows/开发规范/02-规范-OpenSpec工作流规范.md) |
| 变更状态推进 | [状态管理](./workflows/流程规范/03-流程-变更状态管理规范.md) |
| 代码收口落地 | [落地流程](./workflows/流程规范/02-流程-变更落地工作流.md) |
| 发布上线 | [构建部署](./workflows/流程规范/05-流程-构建部署.md) + [分支管理](./workflows/流程规范/01-流程-分支管理规范.md) |

## 关键约束速查

### 必须遵守
- 表格页面使用 **ProTable**，禁止直接使用 `el-table`
- 组件使用 **`<script setup lang="ts">`**，禁止 Options API
- 按钮权限使用 **`v-auth`** 指令，禁止内联 `v-if` 权限判断
- 所有用户可见文本使用 **国际化**（`$t()` 或 `t()`）
- API 调用通过 **RequestHttp** 封装，禁止直接使用 `axios` 或 `fetch`
- RPC 参数名使用 **`filter`**（非 `query`）、**`target_file`**（非 `path`）
- 提交信息遵循 **Conventional Commits** 规范

### 禁止
- 不在组件中直接导入 `axios` 或调用 `fetch`
- 不在 API 文件中编写业务逻辑
- 不在 Store 中直接操作 DOM
- 不使用 `any` 类型（除非有充分理由）
- 不为单次使用创建抽象层
- 不添加未要求的功能

## 技术栈速查

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | 前端框架（Composition API） |
| TypeScript | 5.x | 类型系统（strict mode） |
| Rsbuild | 1.x | 构建工具（Rspack 内核） |
| Pinia | 4.x | 状态管理（Setup Store） |
| Element Plus | 2.14 | UI 组件库 |
| ECharts | 6.x | 图表可视化 |
| Vue Router | 5.x | 路由（Hash History） |
| Axios | 1.18 | HTTP 客户端 |
| vue-i18n | 11.x | 国际化（zh-CN + en） |
| pnpm | >= 8 | 包管理器 |

## 相关资源

### 项目级文档
- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — YiVad 项目 CLAUDE.md（模块边界、近期变更、自约束）
- [YiVad/docs/specs/](../../../YiVad/docs/specs/) — YiVad 架构规范（AI 代码生成用）
- [YiVad/docs/workflows/](../../../YiVad/docs/workflows/) — YiVad 任务工作流
- [YrY/CLAUDE.md](../../../CLAUDE.md) — 单体仓库级 CLAUDE.md（RPC 协议、跨项目关系）

### 知识库层
- [YiKnowledge/INDEX.md](../../INDEX.md) — 知识库顶层导航索引
- [YiKnowledge/README.md](../../README.md) — 知识库流水线概览与角色决策树
- [YiKnowledge/MEMORY.md](../../MEMORY.md) — 知识库规则手册与命名约定
- [YiKnowledge/projects/INDEX.md](../INDEX.md) — 项目知识中心完整文件清单
- [YiKnowledge/projects/README.md](../README.md) — 项目知识中心总览与导航入口

### 相关角色目录
- [YiKnowledge/engineer/README.md](../../engineer/README.md) — 工程实现层（架构模式、开发实践、质量安全）
- [YiKnowledge/engineer/learn/lessons/](../../engineer/learn/lessons/) — 经验教训（成功/失败/陷阱/缺陷）
- [YiKnowledge/leader/decisions/](../../leader/decisions/) — 架构决策记录（按项目子目录组织）
- [YiKnowledge/leader/risk/](../../leader/risk/) — 风险评估与事后复盘

### 跨项目参考
- [YiAi 知识库](../yiai/README.md) — YiAi 后端知识库（API 契约、RPC 协议）
- [YiPet 知识库](../yipet/README.md) — YiPet 扩展知识库（跨世界通信、4-Tier API）
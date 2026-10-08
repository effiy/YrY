---
title: YiVad 知识库索引
tags: [yivad, index, specs, workflows, bugs, okrs, prds, devs, tests]
category: projects/yivad
created: 2026-09-02
updated: 2026-10-07
source: YiVad
type: index
status: stable
lifecycle: active
review_cycle: monthly
benefit: "YiVad 管理后台知识库的总索引，涵盖架构规范、开发指南、需求追溯和缺陷追踪"
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
│       ├── goal-goal-goal-001-架构重构.md
│       └── goal-goal-goal-002-文档分离.md
├── prds/                      # 产品需求 PRD（按月归档，PRD → Dev 追溯）
│   ├── 2026-08/               # 8 月需求（组件化、RBAC、暗色主题等）
│   └── 2026-09/               # 9 月需求（composable 分层、国际化、样式改造等）
├── devs/                      # 开发模块文档（按月归档，Dev → Test 追溯）
│   ├── 2026-07/               # 7 月开发模块
│   ├── 2026-08/               # 8 月开发模块
│   └── 2026-09/               # 9 月开发模块
│       └── README.md          # OKR→PRD→Module→Test 全链路追溯矩阵
├── tests/                     # 测试文档（按月归档，Test → Dev 追溯）
│   ├── 2026-07/
│   ├── 2026-08/
│   └── 2026-09/
│       └── README.md          # PRD→Module→Test 可追溯矩阵
├── workflows/                 # 开发规范 + 操作指南 + 流程规范
│   ├── 开发规范/
│   ├── 操作指南/
│   └── 流程规范/
└── bugs/                      # 缺陷（按月份 → 分类归档）
    ├── README.md              # 缺陷索引 + 分类目录 + 常见模式 + 排查流程
    └── 2026-09/
        ├── 模板/              # 缺陷模板
        ├── 国际化/            # i18n 相关缺陷
        ├── 代码质量/          # 代码质量类缺陷
        ├── 数据/              # 数据/业务逻辑类缺陷
        ├── 路由权限/          # 路由/权限类缺陷
        └── 跨项目/            # 跨项目协作类缺陷
```

## 快速导航

### 新人入门

1. [环境搭建](./workflows/操作指南/001-指南-环境搭建.md) — 环境要求、安装启动、IDE配置
2. [项目架构](./workflows/开发规范/002-规范-项目架构.md) — 技术栈、分层架构、数据流
3. [代码约定](./workflows/开发规范/001-规范-代码约定.md) — 命名、TypeScript、Store、反模式
4. [开发任务](./workflows/操作指南/002-指南-开发任务.md) — 新增页面/API/Store 的标准步骤

### 需求与追溯

| 入口 | 说明 |
|------|------|
| [OKR 目标](./okrs/2026-Q3/README.md) | OKR → PRD 可追溯矩阵 |
| [PRD 需求](./prds/2026-09/00-prd-需求总览.md) | 九月迭代需求总览 |
| [Dev 开发模块](./devs/2026-09/README.md) | OKR→PRD→Module→Test 全链路追溯矩阵 |
| [Test 测试文档](./tests/2026-09/README.md) | PRD→Module→Test 可追溯矩阵 |
| [Bug 缺陷索引](./bugs/README.md) | 缺陷分类索引 + 追溯规范 |

### 日常开发

| 场景 | 参考文档 |
|------|----------|
| 开发列表页 | [页面模式 #列表页](./workflows/开发规范/004-规范-页面模式.md) |
| 开发表单页 | [页面模式 #表单页](./workflows/开发规范/004-规范-页面模式.md) |
| 开发搜索功能 | [页面模式 #搜索表单](./workflows/开发规范/004-规范-页面模式.md) |
| 开发文件上传 | [页面模式 #文件上传](./workflows/开发规范/004-规范-页面模式.md) |
| 开发 ProTable 列 | [组件开发 #ProTable](./workflows/开发规范/006-规范-组件开发.md) |
| 开发 Composable | [Composable 开发](./workflows/开发规范/007-规范-Composable开发.md) |
| 开发时间轴组件 | [活动时间轴组件](./workflows/开发规范/009-规范-活动时间轴组件.md) |
| 调用后端 API | [API 开发](./workflows/开发规范/003-规范-API开发.md) |
| 添加按钮权限 | [代码约定 #硬约束](./workflows/开发规范/001-规范-代码约定.md) |
| 添加国际化文本 | [国际化规范](./workflows/开发规范/008-规范-国际化规范.md) |
| 配置路由/菜单 | [项目架构 #路由系统](./workflows/开发规范/002-规范-项目架构.md) |
| 排查常见问题 | [常见问题排查](./workflows/操作指南/003-指南-常见问题.md) |

### 代码审查

| 检查项 | 参考 |
|--------|------|
| 是否使用 ProTable 而非 el-table | [组件开发](./workflows/开发规范/006-规范-组件开发.md) |
| 是否使用 v-auth 而非 v-if 权限判断 | [代码约定 #硬约束](./workflows/开发规范/001-规范-代码约定.md) |
| 是否使用 $t() 而非硬编码文本 | [国际化规范](./workflows/开发规范/008-规范-国际化规范.md) |
| 是否通过 RequestHttp 而非直接 axios | [API 开发](./workflows/开发规范/003-规范-API开发.md) |
| 参数名是否使用 filter 而非 query | [API 开发 #参数命名契约](./workflows/开发规范/003-规范-API开发.md) |
| 是否使用 `<script setup lang="ts">` | [代码约定](./workflows/开发规范/001-规范-代码约定.md) |
| 完整审查流程 | [代码审查](./workflows/流程规范/004-流程-代码审查.md) |

### 代码质量审计（2026-09-23）

| 区域 | 文档 |
|------|------|
| **总览** | [PRD #100 全面优化](./prds/2026-09/100-prd-YiVad代码质量全面优化.md) · [Dev](./devs/2026-09/100-prd-task-YiVad代码质量全面优化.md) · [Test](./tests/2026-09/100-prd-test-YiVad代码质量全面优化.md) |
| **竞态条件** | [PRD #101](./prds/2026-09/101-prd-竞态条件修复.md) · [Dev](./devs/2026-09/101-prd-task-竞态条件修复.md) · [Test](./tests/2026-09/101-prd-test-竞态条件修复.md) |
| **防护模式** | [PRD #102](./prds/2026-09/102-prd-代码质量防护模式.md) · [Dev](./devs/2026-09/102-prd-task-代码质量防护模式.md) · [Test](./tests/2026-09/102-prd-test-代码质量防护模式.md) |
| **最终报告** | [PRD #103](./prds/2026-09/103-prd-代码质量审计最终报告.md) · [Dev](./devs/2026-09/103-prd-task-代码质量审计执行计划.md) · [Test](./tests/2026-09/103-prd-test-代码质量审计验证方案.md) |
| **基础设施** | [PRD #104](./prds/2026-09/104-prd-关键基础设施漏洞修复.md) · [Dev](./devs/2026-09/104-prd-task-关键基础设施漏洞修复.md) · [Test](./tests/2026-09/104-prd-test-关键基础设施漏洞修复.md) |
| **类型安全** | [PRD #105](./prds/2026-09/105-prd-类型安全全面恢复.md) · [Dev](./devs/2026-09/105-prd-task-类型安全全面恢复.md) · [Test](./tests/2026-09/105-prd-test-类型安全全面恢复.md) |
| **生产质量** | [PRD #106](./prds/2026-09/106-prd-生产环境质量标准化.md) · [Dev](./devs/2026-09/106-prd-task-生产环境质量标准化.md) · [Test](./tests/2026-09/106-prd-test-生产环境质量标准化.md) |
| **Bug 文档** | [#76-81 代码质量](./bugs/2026-09/代码质量/) · [跨项目 RPC](./bugs/2026-09/跨项目/) |
| **后端修复** | [YiAi live.py 时间戳](../yiai/bugs/2026-09/数据/001-数据-live端点时间戳类型不匹配.md) |

**审计结果**: 18 bug 修复 · 0 tsc 错误 · 6 大防护模式 · 14 文件变更

### 流程操作

| 操作 | 参考 |
|------|------|
| 创建新分支 | [分支与变更](./workflows/流程规范/001-流程-分支与变更.md) |
| 需求到上线全流程 | [需求到上线](./workflows/流程规范/002-流程-需求到上线.md) |
| 变更状态推进 | [变更状态管理](./workflows/流程规范/003-流程-变更状态.md) |
| 代码审查流程 | [代码审查](./workflows/流程规范/004-流程-代码审查.md) |
| 发布上线 | [分支与变更 #发布流程](./workflows/流程规范/001-流程-分支与变更.md) |
| 构建与质量门禁 | [质量构建](./workflows/开发规范/005-规范-质量构建.md) |

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
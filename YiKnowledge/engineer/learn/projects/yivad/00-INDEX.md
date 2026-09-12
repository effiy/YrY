---
title: YiVad Engineering — INDEX
tags: [index, yivad, navigation]
category: engineer/learn/projects/yivad
created: 2026-08-24
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Navigate YiVad project documentation"
related:
  - ./README.md
  - ../../INDEX.md
---

# YiVad — 项目索引

> Vue 3.5 管理后台。ProTable 驱动数据展示、后端菜单 API 动态路由、`v-auth` 按钮级权限控制。

## 核心文档

| 文档 | 用途 | 适合人群 |
|---|---|---|
| [01-架构设计](./01-项目-架构设计.md) | 技术栈全景、分层架构、关键组件（ProTable/Router/Auth/HTTP）、数据流 | 所有开发者 |
| [02-开发规范](./02-项目-开发规范.md) | 命名约定、标准模式（ProTable/v-auth/RequestHttp）、RPC 契约、SSE 守卫 | 开发者 |
| [03-功能模块](./03-项目-功能模块.md) | 20+ 视图域、18 个 API 模块、11 个 Pinia Store 的完整清单 | 开发者 |
| [04-流水线闭环](./04-项目-流水线闭环.md) | 需求到部署的完整页面流程——5 个流水线阶段 + 闭环反馈 | PM + 开发者 |

## 用户故事

| 故事 | 领域 | 状态 |
|---|---|---|
| [AiCR 代码审查](./stories/ai-code-review-aicr/story.md) | AI 驱动的代码审查助手 | design |
| [分析文件 Prompt 生成与 AiCR 联动](./stories/analysis-files-prompt-generation-and-aicr-linkage/story.md) | 场景定义 → AI Prompt → 关联源文件 → AiCR 代码审查 | operations |
| [Story Board 看板](./stories/story-board-page/story.md) | 看板式故事管理，支持 Gherkin 场景定义和 Claude Code Prompt 生成 | testing |

## 架构决策记录（ADR）

| ADR | 状态 | 说明 |
|---|---|---|
| [AiCR 阶段移植](../../../leader/decisions/yivad/aicr-phase-port.md) | 已实施 | AICR 功能从 YiWeb 到 YiVad 的移植 |
| [Vitest 引入](../../../leader/decisions/yivad/vitest-introduction.md) | 规划中 | 从 0 测试到 Vitest 测试框架的引入路线 |
| [Vite 到 Rsbuild 迁移](../../../leader/decisions/yivad/vite-to-rsbuild-migration.md) | 已实施 | 构建工具从 Vite 迁移到 Rsbuild |

## 跨项目链接

- [YiVad CLAUDE.md](../../../../YiVad/CLAUDE.md) — 实时项目档案（模块边界、约束、近期变更）
- [RPC 协议](../../build/cross-project-rpc-protocol.md) — RPC 信封规范、参数名契约、已知 Bug 模式
- [产品管理](../../../producter/projects/yivad/project-management.md) — 迭代节奏、交付物
- [入职指南](../../run/onboarding/03-入职-YiVad入职.md) — 新人第一天快速上手

## 快速导航

### 我是 YiVad 新人开发者

1. 先读 [入职指南](../../run/onboarding/03-入职-YiVad入职.md) 完成环境搭建
2. 再读 [架构设计](./01-项目-架构设计.md) 理解 ProTable/Router/Auth 核心组件
3. 然后读 [开发规范](./02-项目-开发规范.md) 了解关键约束（ProTable 标准、v-auth 权限、SSE 守卫）
4. 最后查 [功能模块](./03-项目-功能模块.md) 定位你要修改的视图或 API 模块

### 我想了解 PM 模块的页面流程

读 [04-流水线闭环](./04-项目-流水线闭环.md) —— 从 Issues（需求）到 Bugs（反馈）的完整五阶段闭环。
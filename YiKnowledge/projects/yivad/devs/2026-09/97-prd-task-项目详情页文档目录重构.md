---
prd_task_id: "YV-09-97"
title: "YV-09-97: 项目详情页文档目录重构 — 开发方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "97-prd-项目详情页文档目录重构.md"
tags: [开发方案, 重构, 文档目录]
type: task
category: 项目/管理后台/开发
source: YiVad
benefit: "开发方案：task-项目详情页文档目录重构"
lifecycle: active
---

# YV-09-97: 项目详情页文档目录重构 — 开发方案

> 关联 PRD: [97-prd-项目详情页文档目录重构](../prds/2026-09/97-prd-项目详情页文档目录重构.md)

## 修改清单

| # | 文件 | 变更 | 行数 |
|---|------|------|------|
| 1 | `DetailOverview.vue` | 模板+脚本 | +60/-160 |
| 2 | `project/en.ts` | i18n 迁移 | +3/-8 |
| 3 | `project/zh.ts` | i18n 迁移 | +3/-8 |
| 4 | `DetailOverview.scss` | CSS 重构 | 新增 do-docs-* |

## 核心变更

**删除**：`PipelineRow` 接口、`pipelineRows`/`pipelineStats`/`pipelineLimit`/`pipelineExpanded` computed/ref、`togglePipeline` 函数

**新增**：`DocItem` 接口、`docTab` ref (`"prds"|"devs"|"tests"`)、`docLimit` ref (12)、`docTabs`/`docTabItems` computed

**数据流**：`docTab` → `docTabItems` → `prdFiles`/`ykModules`/`testSpecs`（复用现有数据源）

**模板**：三列 `do-pipeline-table` → 单列 `do-docs-list`，Tab 切换替代固定三列布局

**i18n**：6 个 `pipeline.*` 键 → 3 个 `docs.*` 键 (title/empty/showAll)

**SCSS**：`do-pipeline-toggle` → `do-docs-toggle`，新增 `do-docs-tabs/tab/list/item/empty` 类族

## 影响面

数据源复用、无 API 变更、净减少 ~30 行代码、`vue-tsc` 零错误
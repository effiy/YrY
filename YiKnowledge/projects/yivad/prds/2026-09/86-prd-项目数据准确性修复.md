---
title: 项目数据准确性修复
tags: [yivad, prd, project-dashboard, data-accuracy, bug-fix]
category: projects/yivad/prds
created: 2026-09-22
updated: 2026-09-22
source: YiVad
type: prd
status: 已完成
project: YiVad
project_key: yivad
project_id: yivad
module: project-dashboard
priority: P0
effort: s
prd_task_id: "YV-09-86"
estimate_frontend: 0.25
estimate_backend: 0.25
prd_month: "202609"
owner: ""
source_okr: []
roles: [engineer]
related_modules: ["86-dev-AI-Chat页面布局修复"]
related_tests: ["86-test-项目数据准确性修复"]
benefit: "产品需求：项目数据准确性修复"
lifecycle: active
---

# PRD：项目数据准确性修复
> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY），不含实现方案与测试用例。

## 一、问题描述

`/project` 项目列表页展示的各项目统计数据不准确，具体表现为：

1. **Issue 计数仅包含近 30 天创建的数据**：服务端 `project_dashboard.py` 的 `_compute_basic_stats` 对 issue 聚合管道添加了 `createdAt` 日期过滤（默认最近 30 天），导致卡片上的 "Issues" 数量只统计近 30 天创建的 issue，而非全部。

2. **Bug/Module 计数与服务端不同步**：客户端 `useProjectStats.ts` 仅在服务端统计数量**大于**客户端本地数量时才使用服务端数据（`if (server.issues > s.issues)`），而由于问题 1 导致服务端数据偏小，服务端数据从未生效。

3. **数据不一致**：Issue 计数受 30 天窗口限制，而 Bug 和 Module 计数不受限制，三者口径不统一。

### 影响范围

- YiVad `/project` 列表页的项目卡片（Issue/Bug/Module 计数）
- KPI 磁贴（总 Issues、Open、Done 数量）
- 进度环（完成百分比）
- 项目详情页的 Overview 统计

## 二、期望行为

1. 项目卡片上的 Issues 计数 = MongoDB `issues` 集合中该项目的**全部**文档数
2. Bug 计数 = MongoDB `bugs` 集合中该项目的全部文档数
3. Module 计数 = MongoDB `modules` 集合中该项目的全部文档数
4. 进度环的完成百分比基于全量数据计算
5. 效率/质量指标（cycle time、throughput、bug rate）保持现有 30 天窗口不变

## 三、验收标准

| # | 验收项 | 验证方式 |
|---|--------|----------|
| AC-1 | Issues 计数 = `db.issues.countDocuments({project_key: "yiai"})` | 对比 MongoDB 直接查询与页面显示 |
| AC-2 | YiAi 项目的全部 issue 均被计入 | 页面显示数 ≥ 客户端 fetch 的 pageSize 上限 |
| AC-3 | Bug/Module 计数与 MongoDB 一致 | 同 AC-1 |
| AC-4 | 进度环百分比 = done / issues * 100（全量） | 人工校验 |
| AC-5 | YiAi 后端测试全部通过 | `python -m pytest tests/ -v` |
| AC-6 | YiVad 类型检查通过 | `pnpm type:check` |
| AC-7 | 服务端不可用时页面降级展示客户端统计数据 | 关闭 YiAi 后刷新页面 |
| AC-8 | 效率/质量指标仍为 30 天窗口 | 检查 Analytics 面板的 period 字段 |

## 四、范围

| 维度 | 说明 |
|------|------|
| 涉及项目 | YiAi（后端）、YiVad（前端） |
| 涉及页面 | `/project` 列表页、`/project/:key` 详情页 |
| 不涉及 | YiPet、分析控制台、报表模块 |
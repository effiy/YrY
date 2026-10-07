---
title: "项目详情页: 移除 Modules Tab"
key: remove-modules-tab-20260910
tags:
- ui-refinement
- modules
- tabs
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-10"
updated: 2026-09-10
source: internal
type: improvement
status: resolved
severity: minor
priority: p3
project: YiVad
module: hooks/useDetailTabs.ts, views/project/components/DetailOverview.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
benefit: "缺陷记录：数据-移除Modules-Tab"
lifecycle: active
---

## Description

从项目详情页移除 Modules Tab。Overview 侧边栏同步移除 Modules 统计卡片。

### 变更内容

| 变更 | 文件 | 说明 |
|------|------|------|
| 移除 Tab | `hooks/useDetailTabs.ts` | 删除 `modules` Tab 定义及 `ModuleList` 导入 |
| 移除侧边栏统计 | `DetailOverview.vue` | 删除 Modules 统计卡片 |

### 当前 Tab 列表（5 个）

Overview / Requirements / Docs / Bugs / Members

## Verification

- [ ] 项目详情页 Tab 栏不再显示 Modules
- [ ] Overview 侧边栏仅显示 Issues 和 Bugs 统计

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | Tab 配置变更时需同步更新 Overview 侧边栏统计卡片，保持 UI 一致性 |
| 流程 | 移除 UI 区域的操作需先确认该区域的所有数据消费者，逐步解除依赖后再删除 |

## 经验教训

- **变更的涟漪效应**：移除一个 Tab 不仅影响 `useDetailTabs.ts` 的配置数组，还影响 Overview 侧边栏的统计卡片布局。即使两个组件看似独立，共享的用户心智模型要求它们保持一致


---
title: "YV-09-98: 项目详情页文档目录文件预览弹框 — 内联预览替换为 KnowledgePreviewDialog"
tags:
  - 需求文档
  - 体验优化
  - 文档目录
  - 文件预览
  - 组件复用
category: 项目/管理后台/需求
created: "2026-09-23"
updated: "2026-09-23"
source: 内部
type: 需求
status: 已完成
implementation_progress: 全部完成（2 文件修改）
implementation_updated: "2026-09-23"
priority: P2
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-98
estimate_frontend: 0.15
review_status: 已评审
issue_type: 体验优化
roles:
  - engineer
source_okr: []
related_modules: ["98-prd-task-项目详情页文档目录文件预览弹框"]
related_tests: ["98-prd-test-项目详情页文档目录文件预览弹框"]
benefit: "产品需求：项目详情页文档目录文件预览弹框"
lifecycle: active
---

# YV-09-98: 项目详情页文档目录文件预览弹框

> 需求编号：YV-09-98 · 优先级：P2 · 人天：0.15d · 涉及文件：2 个

---

## 0. 文档概述

项目详情页 Overview Tab 的 Documents 文件列表点击后使用内联展开预览（截取前 600 字符），缺少 frontmatter 元数据展示、目录导航、编辑能力。本需求将内联预览替换为已有的 `KnowledgePreviewDialog` 组件，实现与其他入口（README 编辑、Activity 时间线、Todo 列表）一致的专业预览体验。

---

## 1. 背景

Documents 目录（PRDs / Dev Tasks / Test Specs）是 Overview Tab 的核心模块（PR #97 引入）。当前点击文件行展开内联预览区域：

- 只展示正文前 600 字符（`excerpt()` 截断）
- 无 frontmatter 元数据（状态、负责人、估时）
- 无 TOC 目录导航
- 无可编辑能力

而同一页面中 README 编辑按钮、Activity 条目、Todo 条目均已使用 `KnowledgePreviewDialog` 弹框预览。Documents 文件列表是唯一仍使用内联预览的入口，体验不一致。

---

## 2. 需求范围

**在范围**：Documents 文件列表点击行为改为 `openFile(path)` → `KnowledgePreviewDialog`，移除内联预览 UI 及相关代码/样式

**不在范围**：`KnowledgePreviewDialog` 组件本身（已有，无需修改）、数据加载逻辑、Tab 切换逻辑

---

## 3. 功能需求

- **FR-1**：点击 Documents 文件行 → 打开 `KnowledgePreviewDialog` 弹框预览
- **FR-2**：移除内联预览展开/收起 UI（chevron 图标、预览区域、loading 状态）
- **FR-3**：移除内联预览相关代码（`expandedPath`、`docContentCache`、`docContentLoading`、`toggleDocPreview`、`stripMdFrontmatter`、`excerpt`、`renderMd`）
- **FR-4**：移除内联预览相关 SCSS（`do-docs-item__chevron`、`is-expanded`、`do-docs-item__preview*`）
- **FR-5**：`vue-tsc --noEmit` 零错误

---

## 4. 验收标准

| ID | 条件 |
|----|------|
| AC-1 | 点击 PRDs/Dev Tasks/Test Specs 任一文件行，弹出 KnowledgePreviewDialog |
| AC-2 | 弹框显示完整 markdown 渲染 + frontmatter 元数据 |
| AC-3 | 弹框支持 Preview/Edit/Split 模式切换 |
| AC-4 | 文件行无 chevron 图标、无内联展开区域 |
| AC-5 | `vue-tsc` 零错误 |
| AC-6 | 无未使用的 `reactive`、`readProjectFile`（此上下文）导入 |

---

## 5. 关联文档

| 文档 | 路径 |
|------|------|
| 开发方案 | [98-prd-task-项目详情页文档目录文件预览弹框](../../devs/2026-09/98-prd-task-项目详情页文档目录文件预览弹框.md) |
| 测试方案 | [98-prd-test-项目详情页文档目录文件预览弹框](../../tests/2026-09/98-prd-test-项目详情页文档目录文件预览弹框.md) |
| 前置 PRD | [97-prd-项目详情页文档目录重构](./97-prd-项目详情页文档目录重构.md) |
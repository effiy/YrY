---
title: "项目详情页: 活动时间线和模块 Issue 点击尝试打开不存在的文件"
key: issue-click-opens-nonexistent-file-20260907
tags:
- file-not-found
- issue-preview
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-07"
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: views/project/components/DetailOverview.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-07)
frequency: always
---

## Description

`DetailOverview.vue` 中 `openIssueInline` 和 `handleActivityClick` 函数尝试通过 `previewDlg.value?.open(filePath)` 打开 Issue 对应的 YiKnowledge markdown 文件，路径格式为 `projects/{key}/issues/{date}/{type}/{slug}.md`。但 YiKnowledge 中不存在 `issues/` 目录，Issue 数据存储在 MongoDB 中而非 markdown 文件。点击活动时间线中的 Issue 或模块 Issue 列表中的条目会静默失败（预览对话框显示 "Failed to load content"）。

## Steps to Reproduce

1. 访问 `http://localhost:8848/#/project/yivad`
2. 在概览页的活动时间线中点击任意 Issue 条目
3. 预览对话框尝试加载不存在的文件，显示错误
4. 或在模块卡片的 Issue 列表中点击任意 Issue
5. 同样显示加载失败

## Root Cause

`openIssueInline` 和 `handleActivityClick` 构造了一个指向 YiKnowledge 中不存在路径的 `filePath`（`projects/{key}/issues/...`），而非直接导航到 Issue 详情页（`/issue/{key}`）。

## Fix

1. `openIssueInline`：直接导航到 `/issue/{key}` 而非尝试打开文件
2. `handleActivityClick`：对所有类型统一使用 `router.push(a.link)` 导航

## Verification

- `vue-tsc --noEmit` 通过
- 点击活动时间线中的 Issue → 导航到 Issue 详情页
- 点击模块卡片中的 Issue → 导航到 Issue 详情页

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况


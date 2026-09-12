---
title: "项目详情页: 逾期统计错误地将已取消 Issue 计入"
key: overdue-count-includes-cancelled-20260907
tags:
- overdue
- status-filter
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-07"
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/project/components/DetailOverview.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-07)
frequency: always
---

## Description

`DetailOverview.vue` 的 `overdueIssues` 统计在过滤逾期 Issue 时仅排除了 `done` 状态，未排除 `cancelled` 状态。文件内已定义了 `CLOSED_ISSUE_STATUSES` 常量（包含 `done` 和 `cancelled`），但 `overdueIssues` 未使用该常量，而是硬编码了 `i.status !== "done"`。

后果：已取消的 Issue 若设置了过期的截止日期，会被错误地计入逾期统计，导致概览页侧边栏显示的逾期数量偏高。

## Steps to Reproduce

1. 创建一个 Issue，设置过去的截止日期
2. 将该 Issue 状态改为 `cancelled`
3. 访问 `http://localhost:8848/#/project/yivad`
4. 概览页侧边栏的逾期计数包含了已取消的 Issue

## Root Cause

`overdueIssues` 过滤器使用 `i.status !== "done"` 而非 `!CLOSED_ISSUE_STATUSES.has(i.status)`，未将 `cancelled` 视为已关闭状态。

## Fix

将 `overdueIssues` 过滤条件从 `i.status !== "done"` 改为 `!CLOSED_ISSUE_STATUSES.has(i.status)`。

## Verification

- `vue-tsc --noEmit` 通过
- 已取消的 Issue 不再计入逾期统计

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


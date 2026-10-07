---
title: "项目详情页: DetailRequirements.vue 组件未被使用"
key: detail-requirements-dead-code-20260907
tags:
- dead-code
- project-detail
- requirements
category: projects/yivad/bugs/code-quality
created: "2026-09-07"
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/project/components/DetailRequirements.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-07)
frequency: always
source_prd: "YV-09-01"
source_module: "YV-09-01-1"
benefit: "缺陷记录：质量-DetailRequirements组件未使用"
lifecycle: active
---

## Description

`DetailRequirements.vue` 组件在 YiKnowledge 目录重构时被创建/修改，但从未被任何页面导入或使用。需求 Tab 实际使用的是 `IssueList` 组件（通过 `filterIssueType: "requirement"` 过滤），导致该组件成为死代码。

## Steps to Reproduce

1. 访问 `http://localhost:8848/#/project/yivad`
2. 检查所有 Tab（概览、需求、模块、文档、Bug、成员）
3. 需求 Tab 实际渲染的是 `IssueList` 组件，而非 `DetailRequirements`

## Root Cause

`useDetailTabs.ts` 中需求 Tab 配置为 `IssueList` 组件，`DetailRequirements.vue` 从未被加入 Tab 列表。

## Fix

删除 `src/views/project/components/DetailRequirements.vue` 文件。

**修复验证**：修复后需通过以下检查：`vue-tsc --noEmit` 类型检查通过，相关功能回归测试通过。

## Verification

- `vue-tsc --noEmit` 通过，无新增类型错误
- `grep -r "DetailRequirements" src/` 无任何引用

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 定期运行 `grep -r "ComponentName" src/` 审计未被引用的组件文件；新增组件时确认至少有一处 import |
| 流程 | 目录重构后运行 `vue-tsc --noEmit` + 手动检查新建组件是否在 Tab 配置中注册 |

## 经验教训

- **未引用的组件是构建工具无法检测的死代码**：`vue-tsc` 和 ESLint 可以检测未使用的导入变量，但无法检测「文件存在于目录中但无任何文件 import 它」的死组件。需要定期用 `grep -r "ComponentName" src/` 手动审计
- **重构残留**：此组件在 YiKnowledge 目录重构时创建，但因 Tab 配置使用 `IssueList` + `filterIssueType` 过滤而非独立组件，导致新创建的 `DetailRequirements` 从未被接入


---
title: "项目详情页: DetailMembers 添加/移除成员成功提示未国际化"
key: detail-members-i18n-hardcoded-20260907
tags:
- i18n
- hardcoded-string
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
module: views/project/components/DetailMembers.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-07)
frequency: always
---

## Description

`DetailMembers.vue` 中添加和移除成员的成功提示使用了硬编码英文字符串，而非 i18n 键。i18n 文件中已定义了 `project.members.addSuccess` 和 `project.members.removeSuccess`，但组件未使用。

- `ElMessage.success("Added " + username)` → 应为 `t("project.members.addSuccess", { username })`
- `ElMessage.success("Removed " + m.username)` → 应为 `t("project.members.removeSuccess", { username: m.username })`

## Steps to Reproduce

1. 访问 `http://localhost:8848/#/project/yivad`
2. 切换到成员 Tab
3. 添加或移除成员
4. 成功提示显示为英文

## Root Cause

`DetailMembers.vue` 未导入 `useI18n`，成功消息直接硬编码为英文字符串。

## Fix

1. 添加 `useI18n` 导入和 `const { t } = useI18n()`
2. 将 `ElMessage.success("Added " + username)` 改为 `ElMessage.success(t("project.members.addSuccess", { username }))`
3. 将 `ElMessage.success("Removed " + m.username)` 改为 `ElMessage.success(t("project.members.removeSuccess", { username: m.username }))`

## Verification

- `vue-tsc --noEmit` 通过
- 中文环境显示 "已添加 {username}" / "已移除 {username}"
- 英文环境显示 "Added {username}" / "Removed {username}"

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


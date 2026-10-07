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
benefit: "缺陷记录：数据-DetailMembers提示未国际化"
lifecycle: active
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
| 代码 | `ElMessage.success(str)` 中的字符串拼接（`"Added " + username`）应改为 i18n 参数化插值 `t("key", { username })` |
| 流程 | Code Review 中搜索 `ElMessage\.(success|warning|error|info)\(` 并验证参数是否为 `t()` 调用 |

## 经验教训

- **字符串拼接破坏 i18n 插值**：`"Added " + username` 在不同语言中语序可能不同（某些语言 username 在前），必须用 `t('key', { username })` 的命名参数方式让译者自由排列语序
- **i18n key 已存在但未被使用**：i18n 文件已定义了 `project.members.addSuccess`，但组件未接入 `useI18n`。i18n 文件的存在不代表所有组件已接入——需要强制性检查机制


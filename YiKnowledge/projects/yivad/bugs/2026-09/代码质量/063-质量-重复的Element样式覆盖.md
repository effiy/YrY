---
title: ElMessage 全局样式覆盖在多个组件中重复定义
tags: [yivad, code-quality, css]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-重复的Element样式覆盖"
lifecycle: active
---

# ElMessage 全局样式覆盖在多个组件中重复定义

## 现象

Element Plus 的 `ElMessage`/`ElNotification` 样式覆盖在多个组件的 `<style>` 中重复——这些全局样式应在单一位置定义。

## 涉及文件

- 多个包含 `.el-message`、`.el-notification` 样式覆盖的组件

## 修复方案

提取到 `styles/element-overrides.scss`，通过 Rsbuild 全局注入。

## 预防措施

组件库的样式覆盖应集中在全局样式文件中。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **组件库样式覆盖的散落问题**：当开发者在组件 A 中需要调整 `ElMessage` 样式时，很自然地在组件的 `<style>` 中写覆盖规则。后来组件 B 也做了同样的覆盖——因为不知道组件 A 中已经有了。统一的全局样式覆盖文件（`element-overrides.scss`）是消除重复的唯一方式


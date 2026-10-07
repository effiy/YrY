---
title: 全局注入的 var.scss 各组件重复引入基础变量
tags: [yivad, code-quality, scss]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-SCSS变量重复注入"
lifecycle: active
---

# 全局注入的 var.scss 各组件重复引入基础变量

## 现象

Rsbuild `additionalData` 全局注入 SCSS 变量，组件通过 `<style scoped lang="scss">` 可以访问这些变量。但部分样式文件在自己顶部又重复声明了变量或 mixin，导致变量被重复解析。

## 涉及文件

- `styles/var.scss` — 全局变量
- `rsbuild.config.ts` — additionalData 配置

## 修复方案

审查 `additionalData` 注入的变量范围，确保组件不会重复声明。使用 `@use 'var' as *` 一次性引入。

## 预防措施

全局 SCSS 变量通过 Rsbuild additionalData 注入后，组件不应重复导入。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **`additionalData` 注入后组件不应再手动导入变量文件**：如果 Rsbuild 已经全局注入了 `@use 'var' as *`，组件的 `<style scoped>` 中重复 `@import 'var.scss'` 会导致变量被多次解析和注入，增加 CSS bundle 大小
- **`additionalData` 与 `@use` 的明确分工**：`additionalData` 注入变量和 mixin（设计为在每个 scoped 块中可用），而全局样式（如 markdown 样式）通过独立的非 scoped `<style>` 块或单独的全局样式表引入


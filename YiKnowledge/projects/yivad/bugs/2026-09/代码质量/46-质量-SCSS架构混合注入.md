---
title: 全局 SCSS 文件未被所有组件作用域引用
tags: [yivad, code-quality, css-architecture]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-SCSS架构混合注入"
lifecycle: active
---

# 全局 SCSS 文件未被所有组件作用域引用

## 现象

YiVad 有 **26 个 SCSS 文件**，分布在 `styles/`、`layouts/`、`components/` 和 `views/` 中。全局注入的 `styles/var.scss` 包含主题变量，但 `styles/common.scss:49` 的注释说明：

```scss
// styles/common.scss:49
// rendering `v-html` with injected chips gets the styling for free
```

实际运作中，全局样式通过 Rsbuild `additionalData` 注入 SCSS 变量，但非 scoped 样式（如 `common.scss` 的 markdown 类）依赖 `@import` 链或全局 `<style lang="scss">` 块。当组件在多个位置引用同一个 mixin 或变量时，可能导致重复注入。

## 根因分析

- SCSS 架构混合了 3 种注入方式：Rsbuild additionalData（变量）、非 scoped `<style>`（markdown）、scoped `<style>`（组件）
- 存在重复的 mixin 定义风险
- 没有 SCSS 的 `@use` 模块化体系

## 涉及文件

- `styles/common.scss` — 全局 markdown 样式
- `styles/var.scss` — 主题变量
- `layouts/*/index.scss` — 布局专用样式
- 20+ 个组件 scoped 样式

## 修复方案

1. 变量和 mixin 通过 Rsbuild `additionalData` → `@use 'var' as *;` 全局可用
2. markdown 样式抽取到独立的 `styles/markdown.scss`，通过 `@use` 引入
3. 布局样式迁移到 CSS 变量系统，响应暗色模式

## 预防措施

- 新 SCSS 文件通过 `@use` 而非 `@import` 引入依赖
- 禁止在子目录中重复定义同名变量或 mixin

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **三种 SCSS 注入方式各有用途**：Rsbuild `additionalData`（变量注入，自动对每个 scoped style 生效）、非 scoped `<style>`（全局样式，如 markdown）、scoped `<style>`（组件私有样式）。问题不在于使用多种方式，而在于没有明确的使用规则——开发者不知道该把样式放在哪里
- **`@import` vs `@use` 的迁移**：Sass 已计划废弃 `@import`，项目应逐步迁移到 `@use` 模块体系。`@use` 有命名空间隔离，避免了变量/mixin 名称冲突


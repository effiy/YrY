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

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况


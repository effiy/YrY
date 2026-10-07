---
title: 部分 SCSS 使用 @import 而非 @use
tags: [yivad, code-quality, scss-modern]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-SCSS使用@import而非@use"
lifecycle: active
---

# 部分 SCSS 使用 @import 而非 @use

## 现象

SCSS 文件混用了 `@import`（已弃用）和 `@use`（推荐）：

Sass 官方在 Dart Sass 2.0 中将移除 `@import` 支持。`@import` 导致全局命名空间污染（所有变量/mixin 全局可见），而 `@use` 提供模块化作用域。

## 根因分析

- Rsbuild 的 `additionalData` 使用字符串拼接注入变量
- 部分旧 SCSS 文件用 `@import` 引入全局变量

## 涉及文件

- `styles/` 目录中的 SCSS 文件

## 修复方案

迁移 `@import` → `@use '...' as *`。

## 预防措施

- 禁止新代码使用 `@import`

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **`@import` 的全局命名空间污染**：`@import 'var.scss'` 后所有变量全局可见，无法追踪变量来源。`@use 'var' as v` 提供命名空间隔离，`$v.primary-color` 明确表示变量的来源模块
- **Dart Sass 2.0 的迁移窗口**：Sass 已宣布将在 2.0 中移除 `@import`。现在迁移到 `@use` 是在技术债务变成阻塞性 bug 之前的预防性投资


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

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况


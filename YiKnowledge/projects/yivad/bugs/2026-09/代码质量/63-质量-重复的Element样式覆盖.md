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

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况


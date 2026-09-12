---
title: 未使用 v-cloak 导致 Vue 挂载前出现未编译模板闪烁
tags: [yivad, code-quality, ux]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# 未使用 v-cloak 导致 Vue 挂载前出现未编译模板闪烁

## 现象

YiVad 项目未使用 Vue 的 `[v-cloak]` 指令来防止 FOUC（Flash of Unstyled Content）。在慢网络或首次加载时，用户可能短暂看到未编译的 Vue 模板表达式（`{{ variable }}`）和未渲染的组件骨架。

项目的 `index.html` 和 `App.vue` 中均未配置 `v-cloak`，全局 CSS 中也无 `[v-cloak] { display: none }` 样式。

## 根因分析

- Rsbuild 构建的 SPA 在 Vue 挂载前会短暂显示原始 HTML
- Element Plus 的按需加载组件在 CSS 加载完成前会显示无样式组件
- 没有 loading 骨架屏或 `v-cloak` 来掩盖这个过渡期

## 涉及文件

- `index.html` — 缺少 `v-cloak` 样式
- `src/App.vue` — 根元素未使用 `v-cloak`

## 修复方案

```css
/* 全局 CSS */
[v-cloak] { display: none !important; }
```

```html
<!-- index.html -->
<div id="app" v-cloak></div>
```

## 预防措施

- 所有 Vue SPA 项目应使用 `v-cloak` 或加载骨架屏

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况


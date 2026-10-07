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
benefit: "缺陷记录：质量-缺少v-cloak防闪烁"
lifecycle: active
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

- **SPA 初始化的过渡期**：Vue 挂载前，浏览器会短暂显示未编译的模板（`{{ }}` 表达式和原始 HTML）。`v-cloak` 是零成本的 3 行 CSS 方案（`[v-cloak] { display: none }`），但新项目模板中常被遗漏
- **Rsbuild 的影响**：Rsbuild 的构建速度快，首次加载的 FOUC 窗口可能很短。但这不意味着可以省略 `v-cloak`——慢网络或低端设备上这个窗口可达数百毫秒


---
title: 4 个视图文件中存在非 scoped 样式造成全局 CSS 泄漏
tags: [yivad, code-quality, css]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-非scoped样式全局泄漏"
lifecycle: active
---

# 4 个视图文件中存在非 scoped 样式造成全局 CSS 泄漏

## 现象

4 个 Vue SFC 同时包含 `<style scoped lang="scss">` 和 `<style lang="scss">`（非 scoped），后者的样式会泄漏到全局，影响其他组件：

| 文件 | 非 scoped 样式 |
|------|---------------|
| `views/issue/detail.vue:768` | `issue/detail.vue` |
| `views/knowledge/executive/okr.vue:840` | `okr.vue` |
| `views/aiChat/components/ChatToolbar/index.vue:3198` | ChatToolbar |
| `views/home/QuickNav.vue:283` | QuickNav |

非 scoped 样式在 ChatToolbar（3217 行组件）和 okr.vue 中尤其危险，这些组件有大量样式规则。

## 根因分析

- 使用 `marked` 渲染的 markdown 内容需要全局样式（v-html 内容无法被 scoped 选择器命中）
- 开发者用非 scoped `<style>` 块为 markdown-body 提供样式
- 但非 scoped 块中的选择器通常过于宽泛（如 `.markdown-body`、`h1`、`p`），可能意外覆盖其他组件的渲染

## 涉及文件

- `src/views/issue/detail.vue` — 非 scoped 样式
- `src/views/knowledge/executive/okr.vue` — 非 scoped 样式
- `src/views/aiChat/components/ChatToolbar/index.vue` — 非 scoped 样式
- `src/views/home/QuickNav.vue` — 非 scoped 样式

## 修复方案

1. 将非 scoped markdown 样式提取到独立的全局样式表 `src/styles/markdown.scss`
2. 使用 `:deep()` 选择器在 scoped 样式中穿透到 v-html 内容
3. 或用唯一的 CSS class 前缀（如 `.yivad-md-`）包裹非 scoped 样式规则

## 预防措施

- Stylelint 规则禁止在同一文件中同时使用 scoped 和非 scoped style 块
- 所有 markdown 样式统一在 `src/styles/` 中管理

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **非 scoped 样式的合法需求**：Markdown 渲染内容（`v-html`）无法被 Vue scoped 选择器命中（`data-v-xxx` 属性不会添加到动态 HTML 中），因此 markdown 样式确实需要全局样式。但这不意味着每个组件各自写非 scoped 块——应统一提取到 `src/styles/markdown.scss`
- **`:deep()` 的局限性**：`:deep()` 可以穿透子组件，但不能穿透 `v-html` 动态内容。对于 `v-html` 的样式，全局样式表 + 唯一前缀类名是唯一可靠的方案


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
---

# 4 个视图文件中存在非 scoped 样式造成全局 CSS 泄漏

## 现象

4 个 Vue SFC 同时包含 `<style scoped lang="scss">` 和 `<style lang="scss">`（非 scoped），后者的样式会泄漏到全局，影响其他组件：

| 文件 | 非 scoped 样式 |
|------|---------------|
| `views/issue/detail.vue:768` | `issue/detail.vue` |
| `views/knowledge/executiver/okr.vue:840` | `okr.vue` |
| `views/aiChat/components/ChatToolbar/index.vue:3198` | ChatToolbar |
| `views/home/QuickNav.vue:283` | QuickNav |

非 scoped 样式在 ChatToolbar（3217 行组件）和 okr.vue 中尤其危险，这些组件有大量样式规则。

## 根因分析

- 使用 `marked` 渲染的 markdown 内容需要全局样式（v-html 内容无法被 scoped 选择器命中）
- 开发者用非 scoped `<style>` 块为 markdown-body 提供样式
- 但非 scoped 块中的选择器通常过于宽泛（如 `.markdown-body`、`h1`、`p`），可能意外覆盖其他组件的渲染

## 涉及文件

- `src/views/issue/detail.vue` — 非 scoped 样式
- `src/views/knowledge/executiver/okr.vue` — 非 scoped 样式
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

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况


---
title: v-html 渲染未经过 XSS 消毒的用户/AI 内容
tags: [yivad, code-quality, security]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
resolution: |
  - useMarkdown.ts: sanitizeHtml() 改用 DOMPurify.sanitize() 替代正则表达式
  - 配置白名单标签和属性，阻止所有事件处理器和 data- 属性
  - renderWithHtml() 管道现为: DOMPurify → marked.parse → wrapMermaidBlocks
benefit: "缺陷记录：质量-v-html未消毒XSS风险"
lifecycle: active
---

# v-html 渲染未经过 XSS 消毒的用户/AI 内容

## 现象

YiVad 中 **30+ 处** 使用 `v-html` 渲染内容，大多用于 Markdown 预览。虽然大部分通过了 `marked` 渲染（无 HTML 消毒），但至少一处直接将原始 HTML 注入 DOM：

```vue
<!-- RagSources.vue:321 — 直接从 RAG 响应渲染 HTML -->
<div v-else class="rs-fp-body" v-html="preview.html" />
```

此外，搜索结果中的 `v-html="highlight(item.title)"` 和 `v-html="highlightSuggestion(s)"` 将用户输入的搜索词直接插入 HTML。

## 根因分析

- `marked` 默认不过滤 HTML 标签——恶意 markdown 可注入 `<script>` 或 `<iframe>`
- RAG 来源预览的 `preview.html` 来自外部知识文件内容，未做消毒
- 搜索高亮函数将用户输入拼接到 HTML 中，存在 XSS 风险
- 没有全局的 DOMPurify/sanitize-html 中间层

## 涉及文件

- `components/RagSources/RagSources.vue:321` — 原始 HTML 预览
- `views/search/index.vue:45,158,178` — 搜索高亮未消毒
- `views/module/index.vue:236` — 描述 HTML 渲染
- `views/rag/chat.vue:51` — RAG 聊天回答渲染
- `views/aiChat/components/MessageBubble/PetMessage.vue:341` — AI 回答渲染
- 等 20+ 个文件

## 修复方案

1. 引入 `DOMPurify` 或 `sanitize-html` 作为全局 markdown 渲染管道
2. 创建 `useSanitizedHtml` composable，统一 `v-html` 入口
3. `markdownToHtml(content)` → `sanitize(marked(content))` 管道
4. 搜索高亮函数在插入前对用户输入做 HTML 转义
5. 对 `RagSources.vue` 的 `preview.html` 做消毒处理

## 预防措施

- ESLint 规则禁止直接使用 `v-html`，必须通过消毒包装函数
- 新组件审查中标记 `v-html` 使用

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **Markdown 渲染管道的安全性**：`marked` 默认不过滤 HTML 标签，恶意 Markdown 中的 `<script>` 或 `<iframe>` 会直接注入 DOM。正确的渲染管道是 `marked.parse()` → `DOMPurify.sanitize()` → 挂载到 `v-html`，而非反过来或省略消毒步骤
- **RAG 来源内容的信任边界**：RAG 检索的 `preview.html` 来自外部知识文件，属于不可信输入。任何来自外部数据源渲染到 `v-html` 的内容都必须经过 DOMPurify 消毒
- **30+ 处 `v-html` 的治理**：逐个修复难以持续。应创建 `useSanitizedHtml` composable 作为唯一的 `v-html` 入口，并配置 ESLint 规则禁止直接使用 `v-html`


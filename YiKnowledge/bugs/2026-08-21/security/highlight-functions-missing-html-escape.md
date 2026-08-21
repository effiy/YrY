---
title: highlight/highlightSnippet 函数缺少 HTML 转义存在 XSS 风险
tags: [bug, xss, security, v-html, highlight]
category: bugs/security
created: 2026-08-21
updated: 2026-08-21
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: Search, CommandPalette, KnowledgeBase
assignee: ruiyi
reporter: ruiyi
environment: development
affectedVersion: 1.0.0
fixedVersion: 1.0.1
---

## Description

3 个 `highlight`/`highlightSnippet` 函数在向文本插入 `<mark>` 或 `<b>` 标签前未对输入进行 HTML 转义。这些函数的返回值直接用于 `v-html` 渲染，如果输入文本包含 HTML 特殊字符（`<`、`>`、`&`），会被浏览器解析为 HTML，可能导致 XSS 攻击。

## Steps to Reproduce

1. 在 YiKnowledge 中创建包含 `<img src=x onerror=alert(1)>` 的文件
2. 在搜索框中搜索该文件
3. 观察搜索结果中 HTML 被渲染

## Expected Result

用户输入和文件内容中的 HTML 特殊字符应被转义显示，而非被浏览器解析执行。

## Actual Result

HTML 特殊字符未转义，可能被浏览器解析执行。

## Affected Files

1. `src/views/search/index.vue` — `highlight()` 函数
2. `src/components/CommandPalette/CommandPalette.vue` — `highlight()` 函数
3. `src/views/dashboard/knowledgeBase/utils.ts` — `highlightSnippet()` 函数

## Cause

函数在插入高亮标签前未对原始文本进行 HTML 实体转义：
```ts
// 修复前
return text.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");
```

## Solution

在插入高亮标签前先转义 HTML 特殊字符：
```ts
// 修复后
const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
return escaped.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");
```

## Review

**教训**: 所有用于 `v-html` 渲染的函数都必须在插入 HTML 标签前对用户输入进行 HTML 转义。`renderAnswer` 函数（`rag/constants.ts`）已正确实现转义，可作为参考模式。

**改进措施**: 考虑引入 DOMPurify 统一处理所有 `v-html` 渲染的 HTML 内容。
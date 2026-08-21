---
title: renderCommentMd 的 @mention 高亮在 renderMarkdown 转义 HTML 后失效
tags: [bug, markdown, mention, highlight, render-order]
category: bugs/logic
created: 2026-08-21
updated: 2026-08-21
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: Issue Detail
assignee: ruiyi
reporter: ruiyi
environment: development
affectedVersion: 1.0.0
fixedVersion: 1.0.1
---

## Description

`issue/detail.vue` 的 `renderCommentMd` 函数在调用 `renderMarkdown` 之前先执行 `@mention` 替换，插入 `<span class="mention">` 标签。但 `renderMarkdown`（`useMarkdown.render`）会转义所有 `<` 字符为 `&lt;`（XSS 防护），导致插入的 span 标签被转义为纯文本，`@mention` 高亮完全失效。

## Steps to Reproduce

1. 在 Issue 评论中输入 `@username` 提及用户
2. 观察评论渲染结果中 `@username` 是否有高亮样式

## Expected Result

`@username` 显示为带有 `.mention` 样式的高亮文本。

## Actual Result

`@username` 显示为普通文本，`<span class="mention">` 标签被转义为 `&lt;span class="mention"&gt;` 显示在页面上。

## Cause

处理顺序错误：HTML 标签在 markdown 渲染前插入，但 `renderMarkdown` 会转义所有 `<` 字符。

```ts
// 修复前：先插入 HTML，后渲染（HTML 被转义）
const withMentions = md.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
return renderMarkdown(withMentions);
```

## Solution

调整处理顺序：先渲染 markdown，再在 HTML 输出中替换 `@mention`。

```ts
// 修复后：先渲染，后插入 HTML
const html = renderMarkdown(md);
return html.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
```

## Review

**教训**: 当渲染管道包含 HTML 转义步骤时，任何 HTML 标签的插入必须在转义之后进行。`renderMarkdown`（`useMarkdown.render`）的 XSS 防护策略是转义所有 `<`，因此任何需要插入 HTML 标签的场景应使用 `renderWithHtml` 或在渲染后处理。
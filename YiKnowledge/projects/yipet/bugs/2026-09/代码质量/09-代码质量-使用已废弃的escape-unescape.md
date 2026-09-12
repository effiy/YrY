---
title: chat/utils.ts 使用已弃用的 escape/unescape 函数
tags: [yipet, code-quality, code-smell, deprecated-api]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# chat/utils.ts 使用已弃用的 escape/unescape 函数

## 现象

`src/chat/utils.ts` 在 mermaid 图表 base64 编解码中使用了 `escape()` 和 `unescape()` 函数，这两个函数自 ECMAScript 3 起已被弃用，且在严格模式（`"use strict"`）下不可用。

## 根因分析

旧版 mermaid 编解码路径依赖 `unescape(encodeURIComponent(text))` → `btoa(...)` 的 hack 方式来编码非 ASCII 文本为 base64。这是 UTF-8 编码前的遗留做法 — `escape()`/`unescape()` 使用 `%xx` 编码而非标准的 UTF-8，会在非 ASCII 字符处产生不可预期的结果。

现代浏览器提供了 `TextEncoder` / `TextDecoder` API 进行标准 UTF-8 编解码，配合 `btoa` / `atob` 可直接处理任意 Unicode 文本。

## 涉及文件

- `src/chat/utils.ts:45` — `btoa(unescape(encodeURIComponent(decoded)))` — wrapMermaidBlocks 中的 mermaid 编码
- `src/chat/utils.ts:84` — `decodeURIComponent(escape(atob(...)))` — runMermaid 中的 mermaid 解码

## 修复方案

使用 `TextEncoder` / `TextDecoder` 替换弃用函数：

```typescript
// Encoding: string → base64
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binStr = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binStr);
}

// Decoding: base64 → string  
function base64ToUtf8(b64: string): string {
  const binStr = atob(b64);
  const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
```

`wrapMermaidBlocks` 中的第 45 行：`utf8ToBase64(decoded)` 替换 `btoa(unescape(encodeURIComponent(decoded)))`

`runMermaid` 中的第 84 行：`base64ToUtf8(...)` 替换 `decodeURIComponent(escape(atob(...)))`


## 影响范围

**影响模块**：`src/chat/utils.ts` 中 Mermaid 图表的 base64 编解码逻辑。
**影响用户**：在严格模式下 `escape()/unescape()` 不可用，可能导致 Mermaid 图表渲染失败。非 ASCII 字符（如中文）的 Mermaid 图表可能出现乱码。
**影响范围**：所有包含 Mermaid 图表的聊天消息渲染。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 工具 | ESLint `no-restricted-syntax` 规则禁止 `escape`/`unescape` 调用 | DevOps |
| 工具 | TypeScript `lib` 配置排除 `scripthost` 移除弃用函数的类型声明 | DevOps |
| 流程 | 代码审查时检查弃用 API 的使用 | Reviewer |


## 经验教训

`escape()`/`unescape()` 自 ECMAScript 3 起已被弃用，但大量旧代码和教程仍在使用。这些函数使用非标准的 `%xx` 编码，在非 ASCII 字符上产生不可预期的结果。`TextEncoder`/`TextDecoder` 是标准的 UTF-8 编解码方案，应在所有新代码中使用。

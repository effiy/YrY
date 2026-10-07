---
title: RAG检索摘要(RagContentSummary)可能显示为undefined
tags: [yipet, code-quality, rag, bug]
category: projects/yipet/bugs/code-quality
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# RAG检索摘要可能显示为"undefined"

## 现象

当 RAG 来源的第一个文件 `path` 字段为 `undefined` 时，`ragContentSummary` 会展示为 `"undefined +N"` 字符串，而非有意义的文件名。

## 复现步骤

1. 在聊天中开启知识库检索（Knowledge Grounded）
2. 提问一个触发了 RAG 检索的问题
3. 若后端返回的第一个 `RagSource.path` 为 `undefined`/`null`，消息气泡上的检索摘要将显示 `"undefined +2"` 而非 `"file.md +2"`

## 根因分析

`src/chat/stores/chat.ts` 第 1003 行（修复前）：

```typescript
state.messages[idx].ragContentSummary = topSource?.path?.split('/').pop() + ...
```

`optionalChain?.split('/').pop()` 在 `path` 为 `undefined` 时返回 `undefined`，然后 `undefined + " +2"` 被 JS 隐式转换为字符串 `"undefined +2"`。

可选链只保护了 `topSource` 和 `path` 的访问，但没有为 `path` 缺失提供 fallback 值。

## 涉及文件

- `YiPet/src/chat/stores/chat.ts` — `_runStream` 函数中 RAG 元数据赋值逻辑（约第 1000–1003 行）

## 修复方案

提取文件名并添加 fallback：

```diff
- state.messages[idx].ragContentSummary = topSource?.path?.split('/').pop() + ...
+ const topFile = topSource?.path?.split('/').pop() || 'unknown';
+ state.messages[idx].ragContentSummary = topFile + ...
```

当 `path` 缺失时显示 `"unknown"` 前缀。

## 验证

- `npm run typecheck` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓
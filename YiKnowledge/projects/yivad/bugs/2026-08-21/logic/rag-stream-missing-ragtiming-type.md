---
title: useRagStream.ts 引用不存在的 RagTiming 类型和 onTiming 处理器
tags: [bug, type-import, rag, typescript, dead-code]
category: bugs/logic
created: 2026-08-21
updated: 2026-08-21
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: RAG Stream
assignee: ruiyi
reporter: ruiyi
environment: development
affectedVersion: 1.0.0
fixedVersion: 1.0.1
---

## Description

`src/views/rag/composables/useRagStream.ts` 导入了 `RagTiming` 类型，但 `@/api/interface/rag.ts` 中从未定义该类型。同时 `RagStreamHandlers` 接口中不存在 `onTiming` 处理器，导致 `streamRagChat` 调用时传入 `onTiming` 属性报类型错误。

## Steps to Reproduce

1. 运行 `pnpm type:check`
2. 观察 `useRagStream.ts(5,26)` 和 `useRagStream.ts(119,7)` 报错

## Expected Result

类型检查通过。

## Actual Result

- `TS2305: Module '"@/api/interface/rag"' has no exported member 'RagTiming'`
- `TS2353: Object literal may only specify known properties, and 'onTiming' does not exist in type 'RagStreamHandlers'`

## Cause

`RagTiming` 类型和 `onTiming` 回调是为计划中的 timing 功能预留的，但后端从未实现该功能。API 接口文件中未定义对应类型，`RagStreamHandlers` 也未包含 `onTiming` 处理器。这是典型的 dead code 残留。

## Solution

1. 从 `useRagStream.ts` 移除 `RagTiming` 导入
2. 从 `RagStreamMessage` 接口移除 `timing` 字段
3. 从 `runStream` 函数移除 `onTiming` 回调

## Review

**教训**: 预留未实现功能的类型和接口会导致编译错误。如果功能暂不实现，不应在代码中引用未定义的类型。应该在功能真正实现时再添加对应的类型和接口。
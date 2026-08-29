---
title: history.vue 中 HistoryEntry.timestamp 类型与 QueryTrendsChart 不一致
tags: [bug, type-mismatch, rag, typescript]
category: bugs/data
created: 2026-08-21
updated: 2026-08-21
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: RAG History
assignee: ruiyi
reporter: ruiyi
environment: development
affectedVersion: 1.0.0
fixedVersion: 1.0.1
---

## Description

`src/views/rag/history.vue` 中定义了本地 `HistoryEntry` 接口，`timestamp` 字段类型为 `number`。但 `QueryTrendsChart.vue` 组件期望的 `HistoryEntry.timestamp` 类型为 `string`（用于 `.slice(0, 10)` 截取日期）。两个同名接口的类型定义不一致，导致 `vue-tsc` 报 `TS2719` 错误。

## Steps to Reproduce

1. 运行 `pnpm type:check`
2. 观察 `history.vue(48,26)` 报错 `Type 'HistoryEntry[]' is not assignable to type 'HistoryEntry[]'`

## Expected Result

两个 `HistoryEntry` 接口的 `timestamp` 类型一致，类型检查通过。

## Actual Result

`history.vue` 中 `timestamp: number`，`QueryTrendsChart.vue` 中 `timestamp: string`，类型不兼容。实际数据源 `ragStore.queryHistory` 返回的是 `string` 类型（来自 `RagQueryRecord.timestamp`）。

## Cause

`history.vue` 中的本地 `HistoryEntry` 接口与 `QueryTrendsChart.vue` 中的 `HistoryEntry` 接口是独立定义的，未共享同一类型定义。`history.vue` 错误地将 `timestamp` 标注为 `number`，而实际数据和图表组件都使用 `string`。

## Solution

将 `history.vue` 中 `HistoryEntry.timestamp` 的类型从 `number` 改为 `string`。

## Review

**教训**: 当多个组件使用同名接口时，应该提取到共享类型文件中，避免各自定义导致类型不一致。本地接口定义需要与数据源的实际类型保持一致。
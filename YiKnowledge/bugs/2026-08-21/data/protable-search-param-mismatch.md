---
title: ProTable 搜索参数名错误导致数据查询为空
tags: [bug, data, protable, api-contract]
category: bugs/data
created: 2026-08-21
updated: 2026-08-21
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: ProTable
assignee: ruiyi
reporter: ruiyi
environment: production
affectedVersion: 1.0.0
fixedVersion: 1.0.1
---

## Description

ProTable 组件调用 `data_service.query_documents` 时使用了 `query` 参数，但后端 `_build_filter` 只识别 `filter` 参数，导致搜索条件被静默忽略，列表始终返回全量数据。

## Steps to Reproduce

1. 打开任意 ProTable 列表页
2. 在搜索框输入关键词进行搜索
3. 观察返回结果未按搜索条件过滤

## Expected Result

搜索结果应按照输入的关键词过滤列表数据。

## Actual Result

列表返回全量数据，搜索条件未生效。

## Cause

前端 `getBugList` 等 API 函数曾使用 `query` 作为参数名，但后端 `data_service.query_documents` 的 `_build_filter` 方法只处理 `filter` 参数。`query` 参数被静默丢弃，MongoDB 查询未添加任何过滤条件。

## Solution

将所有 API 模块中的 `query` 参数统一改为 `filter`，与后端 RPC 协议保持一致。

## Review

**教训**: 跨项目参数名契约必须严格对齐。前端和后端使用不同的参数名（`query` vs `filter`）不会报错，只会静默失败，排查成本高。

**改进措施**:
- 在 CLAUDE.md 中明确记录参数名契约
- 新增 API 调用时检查 RPC 协议表
- 考虑添加 API 契约测试
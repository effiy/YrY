---
type: okr-kr
id: lead-002-kr2
title: KR2 — RPC 契约参数名称自动化验证
parent: lead-002
status: active
progress: 0
updated: 2026-09-15
---

# KR2: RPC 契约参数名称自动化验证

> **父目标**：[测试安全网建立](./goal.md) | **权重**：25%

## 当前状态

| 指标 | 值 |
|---|---|
| 当前验证方式 | 手动检查清单 |
| 目标验证方式 | CI 可运行的集成测试 |
| 目标测试数 | ≥ 3 |

## 曾导致 bug 的参数名不匹配

| # | 正确参数名 | 错误使用 | 上下文 | 影响 |
|---|---|---|---|---|
| 1 | `filter` | `query` | `data_service.query_documents` | 后端静默忽略 `query`，返回空结果 |
| 2 | `target_file` | `path` | `/read-file`、`/write-file` | HTTP 422 错误 |
| 3 | `cname` | `collection_name` | `data_service` collection 参数 | 后端静默忽略 |

## 测试设计

| 测试 | 验证内容 | 方法 |
|---|---|---|
| 测试 1 | `callService.query_documents` 发送 `filter` | mock RequestHttp，断言请求体包含 `filter` 而非 `query` |
| 测试 2 | `fileService.readFile` 发送 `target_file` | mock RequestHttp，断言请求体包含 `target_file` 而非 `path` |
| 测试 3 | `callService` collection 操作使用 `cname` | mock RequestHttp，断言请求体包含 `cname` |

**测试框架**：vitest + msw (mock service worker) 或直接 mock `RequestHttp`

## 进度记录

| 日期 | 进度 | 备注 |
|---|---|---|
| 2026-09-15 | 0% | KR 定义完成 |
| | | |
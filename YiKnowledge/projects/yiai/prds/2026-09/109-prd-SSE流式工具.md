---

doc_type: module
prd_id: "YA-09-109"
title: "YA-09-109: SSE 流式工具 — 统一 SSE 格式化与流式传输"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
related_tasks: ["109-prd-task-SSE流式工具.md"]
related_tests: ["109-prd-test-SSE流式工具.md"]

type: 需求
---

# YA-09-109: SSE 流式工具

> **PRD 版本**：v3.0

## 1. 背景

YiAi 的 Chat、RAG、Agent、Execution 模块均使用 SSE 流式传输。需统一格式化（`format_sse` + `stream_async` + `stream_sync`）和 JSON 序列化（orjson 替代 json），消除各路由中的重复代码。

## 2. 范围

**In scope**：`shared/sse_utils.py` — format_sse/orjson 序列化、stream_async（async generator）、stream_sync（sync generator）

**Out of scope**：WebSocket 支持

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P1 | 统一 SSE 格式 | `data: {json}\n\n` |
| P1 | orjson 序列化 | 2-5× faster than json.dumps |

## 3. 时间线

历史实现（2026-09-10 重构去重）
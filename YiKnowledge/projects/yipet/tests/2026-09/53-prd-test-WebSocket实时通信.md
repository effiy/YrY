---
doc_type: test
title: "WebSocket 实时通信 — 测试用例"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["53-架构设计-WebSocket实时通信"]
---

# WebSocket 实时通信 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-WS01 | 连接建立 | ws://YiAi 握手成功 | P1 |
| TC-WS02 | 双向消息 | send/onmessage 正常 | P1 |
| TC-WS03 | 断线重连 | 自动重连+指数退避 | P1 |
| TC-WS04 | vs SSE 对比 | 延迟更低 | P2 |
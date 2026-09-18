---
doc_type: test
title: "YA-09-17: SSE 流式背压控制 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-17"
source_prds: ["17-需求-SSE流式背压控制与缓冲策略"]
source_modules: ["17-prd-task-SSE流式背压控制与缓冲策略"]
source_okr: [yiai-001]
---

# YA-09-17: SSE 流式背压控制 — 测试规格

> 来源 PRD：[17-需求-SSE流式背压控制与缓冲策略.md](../../prds/2026-09/17-需求-SSE流式背压控制与缓冲策略.md)

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-BP-01 | 慢客户端 → Queue 缓冲 | token 生成 > 消费 → Queue 堆积，无 token 丢失 |
| UT-BP-02 | Queue 满 → 丢弃旧 token | Queue 1000 → 新 token 替换最旧 |
| UT-BP-03 | 客户端断开 → 生成器停止 | SSE 连接关闭 → `asyncio.CancelledError` |
| UT-BP-04 | 超时 30s → 关闭连接 | 无 token 生成 > 30s → 关闭 SSE |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 慢客户端导致服务端 OOM |
| S2 — 一般 | 客户端断开后 LLM 仍在生成 |

---
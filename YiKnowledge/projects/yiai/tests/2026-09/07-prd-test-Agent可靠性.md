---
doc_type: test
title: "YA-09-07: Agent 可靠性修复 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-07"
source_prds: ["07-需求-Agent可靠性"]
source_modules: ["07-prd-task-Agent可靠性"]
source_okr: [yiai-001]
---

# YA-09-07: Agent 可靠性修复 — 测试规格

> 来源 PRD：[07-需求-Agent可靠性.md](../../prds/2026-09/07-需求-Agent可靠性.md)
> 开发方案：[07-prd-task-Agent可靠性.md](../../devs/2026-09/07-prd-task-Agent可靠性.md)
> 需求编号：YA-09-07 · 优先级：P0

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-AG-01 | 工具调用超时 30s | `asyncio.TimeoutError` → Agent 继续（非崩溃） |
| UT-AG-02 | SSE 流式错误传播 | 错误 → SSE `{type:"error", message:"..."}` |
| UT-AG-03 | 分层超时：LLM 调用 60s | 超时 → 重试 1 次 → 仍超时 → 返回错误 |
| UT-AG-04 | 分层超时：工具调用 30s | 超时 → 跳过该工具 → 继续执行 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S0 — 阻断 | Agent 工具超时导致整个 Agent 循环崩溃 |
| S1 — 严重 | SSE 流中断无错误事件 → 前端永远等待 |

---
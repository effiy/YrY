---
doc_type: module
prd_task_id: "YA-09-15"
title: "YA-09-15: 全链路 TraceID 透传 — OpenTelemetry + Span 传播 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "33-需求-分布式链路追踪.md"
source_okr: [yiai-001]
---

# YA-09-15: 全链路 TraceID 透传 — OpenTelemetry + Span 传播 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[33-需求-分布式链路追踪.md](../../prds/2026-09/33-需求-分布式链路追踪.md)
> 需求编号：YA-09-15 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

通过 OpenTelemetry SDK 在 FastAPI 中间件层注入 TraceID，跨 RPC/SSE/MongoDB 调用透传。

```mermaid
flowchart LR
  REQ["HTTP 请求"] --> MW["OpenTelemetry 中间件"]
  MW --> SPAN["创建 Root Span"]
  SPAN --> RPC["RPC 调度 (子 Span)"]
  RPC --> MONGO["MongoDB (子 Span)"]
  MONGO --> OLLAMA["Ollama (子 Span)"]
```

### 透传机制

| 环节 | 透传方式 |
|------|---------|
| HTTP → RPC | `X-Trace-Id` 请求头 |
| RPC → MongoDB | `comment` 字段附加 TraceID |
| SSE 流 | 首帧包含 TraceID |
| 日志 | `logging.LogRecord` 自动附加 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | OpenTelemetry SDK + FastAPI 中间件 | TraceID 出现在响应头 | 0.5 |
| 2 | RPC/MongoDB/Ollama Span 传播 | Jaeger 中完整调用链 | 0.5 |
| 3 | 日志自动附加 + 采样策略 + 测试 | 日志与 Trace 关联 | 0.5 |

**合计：1.5d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 集成：[YA-07-03 RPC 信封协议](../2026-07/03-prd-task-RPC信封协议.md)
- 关联：[YA-09-16 结构化 JSON 日志](./35-prd-task-结构化日志.md)
---
doc_type: module
prd_task_id: "YA-09-23"
title: "YA-09-23: 请求响应日志中间件 — 结构化 + 脱敏 + 慢请求 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "141-需求-请求响应日志中间件.md"
source_okr: [yiai-001]
---

# YA-09-23: 请求响应日志中间件 — 结构化 + 脱敏 + 慢请求 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[141-需求-请求响应日志中间件.md](../../prds/2026-09/141-需求-请求响应日志中间件.md)
> 需求编号：YA-09-23 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

FastAPI 中间件自动记录每个请求的：方法、路径、状态码、耗时、TraceID。慢请求（> 阈值）额外记录 WARN。

### 日志格式

```json
{
  "type": "request",
  "method": "POST",
  "path": "/",
  "status": 200,
  "duration_ms": 45,
  "trace_id": "abc123",
  "client_ip": "127.0.0.1",
  "user_agent": "YiVad/1.0"
}
```

### 慢请求检测

| 阈值 | 级别 | 动作 |
|------|------|------|
| > 1s | WARN | 记录完整请求体（脱敏后） |
| > 5s | ERROR | 记录 + 企业微信告警 |

### 敏感路径过滤

以下路径的请求体不记录：`/auth/login`（密码）、任何含 `password`/`token`/`secret` 字段的 body。

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 中间件实现 + 结构化日志 | 每条请求有完整日志 | 0.5 |
| 2 | 慢请求检测 + 敏感路径过滤 + 测试 | 慢请求触发 WARN | 0.5 |

**合计：1.0d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 集成：[YA-09-15 TraceID](./33-prd-task-分布式链路追踪.md)
- 集成：[YA-09-16 结构化日志](./35-prd-task-结构化日志.md)
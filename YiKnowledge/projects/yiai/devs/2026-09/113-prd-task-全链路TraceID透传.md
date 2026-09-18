---
doc_type: module
prd_task_id: "YA-09-24"
title: "YA-09-24: 全链路 TraceID 透传 — ContextVar 跨协程传播 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "113-需求-全链路TraceID透传.md"
source_okr: [yiai-001]
---

# YA-09-24: 全链路 TraceID 透传 — ContextVar 跨协程传播 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[113-需求-全链路TraceID透传.md](../../prds/2026-09/113-需求-全链路TraceID透传.md)
> 需求编号：YA-09-24 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 [YA-09-15 分布式链路追踪](./33-prd-task-分布式链路追踪.md)（OpenTelemetry Span）基础上，补充轻量级 `contextvars.ContextVar` 方案——不依赖 OpenTelemetry SDK，仅透传 TraceID 字符串到日志和 MongoDB comment。

```python
import contextvars

trace_id: contextvars.ContextVar[str] = contextvars.ContextVar("trace_id", default="")

# 中间件注入
trace_id.set(str(uuid.uuid4()))

# 日志自动附加
old_factory = logging.getLogRecordFactory()
def trace_factory(*args, **kwargs):
    record = old_factory(*args, **kwargs)
    record.trace_id = trace_id.get()
    return record
```

### 透传范围

| 组件 | 透传方式 |
|------|---------|
| HTTP 请求 | 中间件注入 `ContextVar` |
| 异步协程 | `ContextVar` 自动跨 `await` 传播 |
| MongoDB | `comment` 字段附加 TraceID |
| 日志 | `LogRecord` 工厂自动附加 |
| 企微通知 | 告警消息带 TraceID 链接 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | ContextVar 注入 + 日志自动附加 | 同一请求的日志 trace_id 一致 | 0.25 |
| 2 | MongoDB comment + 企微通知 + 测试 | 慢查询可追溯到请求 | 0.25 |

**合计：0.5d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 基础：[YA-09-15 OpenTelemetry 追踪](./33-prd-task-分布式链路追踪.md)
- 集成：[YA-09-16 结构化日志](./35-prd-task-结构化日志.md)
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

type: task
---

# YA-09-24: 全链路 TraceID 透传 — ContextVar 跨协程传播 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[113-需求-全链路TraceID透传.md](../../prds/2026-09/113-需求-全链路TraceID透传.md)
> 需求编号：YA-09-24 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

## 一、架构总览

OpenTelemetry SDK 虽功能完整但过重（~200MB 额外依赖，5-10ms Span 创建开销）。方案：使用 Python `contextvars.ContextVar` 实现轻量级 TraceID 透传——不依赖 OpenTelemetry SDK，零外部依赖，4 行核心代码。TraceID 自动随 asyncio 协程传播，注入日志（LogRecord factory）、MongoDB 查询（comment 字段）、企微告警消息。请求入口中间件生成 UUIDv4 TraceID，响应头 `X-Trace-ID` 返回客户端。

```mermaid
graph TB
    subgraph "请求入口"
        MID[中间件<br/>trace_id.set(uuid4())]
        HEADER["响应头 X-Trace-ID"]
    end

    subgraph "ContextVar 传播 (contextvars)"
        TRACEVAR["trace_id: ContextVar[str]"]
    end

    subgraph "透传目标"
        LOG[LogRecord factory<br/>record.trace_id = trace_id.get()]
        MONGO["MongoDB comment<br/>db.collection.find({}, comment=trace_id)"]
        NOTIFY["企微告警<br/>消息带 trace_id 链接"]
        RESP["响应 header<br/>X-Trace-ID"]
    end

    REQ[HTTP 请求] --> MID
    MID --> TRACEVAR
    TRACEVAR --> LOG
    TRACEVAR --> MONGO
    TRACEVAR --> NOTIFY
    TRACEVAR --> RESP
```

### 透传范围

| 组件 | 透传方式 | 示例 |
|------|---------|------|
| HTTP 请求 | 中间件注入 `ContextVar`，`X-Trace-ID` 响应头 | `X-Trace-ID: 550e8400-e29b-41d4-a716-446655440000` |
| 异步协程 | `ContextVar` 自动跨 `await` 传播 | 无需显式传参 |
| MongoDB | `comment` 字段附加 TraceID | `db.sessions.find({}, comment="550e8400...")` |
| 日志 | `LogRecord` factory 自动附加 | `{"trace_id": "550e...", "msg": "..."}` |
| 企微通知 | 告警消息带 TraceID 链接 | `[告警] 服务异常 (trace: 550e...)` |

---

## 二、文件清单

| 文件 | 操作 | 行数 | 说明 |
|------|------|------|------|
| `src/shared/trace_context.py` | **新建** | ~30 | ContextVar 定义 + LogRecord factory + MongoDB comment 工具 |
| `src/server/middleware.py` | 修改 | +15 | 注入 TraceID 中间件（请求入口）|
| `src/shared/logging.py` | 修改 | +10 | 注册 trace factory 到 logging |
| `tests/shared/test_trace_context.py` | **新建** | ~60 | 4 场景测试 |

---

## 三、模块设计

### 3.1 trace_context（核心模块）

```python
# src/shared/trace_context.py

import uuid
import logging
from contextvars import ContextVar
from typing import Optional


# 核心 ContextVar
trace_id: ContextVar[str] = ContextVar("trace_id", default="")


def set_trace_id(tid: Optional[str] = None) -> str:
    """设置当前协程的 TraceID（未提供时自动生成 UUIDv4）。"""
    tid = tid or str(uuid.uuid4())
    trace_id.set(tid)
    return tid


def get_trace_id() -> str:
    """获取当前协程的 TraceID。协程安全——无需显式传参。"""
    return trace_id.get("")


def get_mongo_comment() -> dict:
    """获取 MongoDB comment 字典（用于附加到查询）。"""
    tid = get_trace_id()
    return {"trace_id": tid} if tid else {}


# LogRecord factory 注入
_original_factory = logging.getLogRecordFactory()

def _trace_log_factory(*args, **kwargs) -> logging.LogRecord:
    record = _original_factory(*args, **kwargs)
    record.trace_id = get_trace_id()
    return record

logging.setLogRecordFactory(_trace_log_factory)
```

### 3.2 中间件注入

```python
# src/server/middleware.py

from src.shared.trace_context import set_trace_id, get_trace_id

@app.middleware("http")
async def trace_id_middleware(request: Request, call_next):
    """TraceID 注入中间件——请求入口，最先执行。"""
    # 优先从请求头获取 (上游传递)，否则生成新 ID
    tid = request.headers.get("X-Trace-ID") or str(uuid.uuid4())
    set_trace_id(tid)

    response = await call_next(request)

    # 响应头返回 TraceID（方便客户端关联）
    response.headers["X-Trace-ID"] = get_trace_id()
    return response
```

---

## 四、数据流

### 4.1 完整请求链路

```
客户端请求 → 无 X-Trace-ID header
  → trace_id_middleware: set_trace_id("550e8400...")
  → LogRecord factory: record.trace_id = "550e8400..."
  → logger.info("开始处理") → {"trace_id": "550e...", "msg": "开始处理"}
  → db.sessions.find({"key": "xxx"}, comment="550e8400...") → MongoDB 慢查询日志可见
  → await asyncio.sleep(1) → ContextVar 自动跨 await 传播
  → 子协程中 logger.info("子任务") → trace_id 依然 = "550e8400..."
  → 异常 → 企微告警: "[ERROR] 处理失败 trace=550e8400..."
  → response.headers["X-Trace-ID"] = "550e8400..."
  → 客户端收到响应 → 可用 TraceID 查询日志
```

### 4.2 ContextVar 跨协程原理

```
请求协程 A: trace_id.set("aaa")
  ├── await asyncio.sleep(1)         # 挂起
  ├── 协程 B 执行: trace_id.set("bbb")  # B 有独立 context
  │   └── logger.info() → trace_id="bbb"  # B 的 context
  ├── 协程 A 恢复
  └── logger.info() → trace_id="aaa"  # A 的 context 未受影响
```

---

## 五、实施路线图

| 阶段 | 人天 | 任务 | 产出 | 验证 |
|------|------|------|------|------|
| 一：ContextVar 定义 | 0.1 | trace_context.py + LogRecord factory | `trace_context.py` (~30行) | 同一请求日志 trace_id 一致 |
| 二：中间件注入 | 0.1 | 中间件注入 + 响应头返回 | `middleware.py` 修改 | curl -v 可见 X-Trace-ID |
| 三：MongoDB + 企微集成 | 0.15 | Mongo comment + 企微告警注入 | 查询层 + 通知层修改 | 慢查询日志和告警消息可见 trace_id |
| 四：测试收尾 | 0.15 | 跨协程传播 + 并发隔离 + 边界测试 | 4 场景测试 | pytest 通过 |

**合计：0.5d。**

---

## 六、代码审查检查清单

- [ ] `ContextVar` 使用 `default=""` 确保无请求时日志不报错
- [ ] 中间件优先从 `X-Trace-ID` 请求头获取（上游传递）
- [ ] 响应头 `X-Trace-ID` 返回 TraceID（客户端可关联）
- [ ] LogRecord factory 自动注入 `trace_id` 到所有日志
- [ ] MongoDB 查询通过 `comment` 字段附加 TraceID
- [ ] `asyncio.create_task()` 创建的子任务自动继承 ContextVar
- [ ] 企微告警模板包含 TraceID（方便回溯）
- [ ] ContextVar 协程隔离测试（两个并发请求 trace_id 不同）
- [ ] 无外部依赖（不引入 OpenTelemetry SDK）
- [ ] 不影响现有日志格式（仅新增 trace_id 字段）

---

## 七、技术风险评估

| 风险 | 概率 | 影响 | 等级 | 缓解措施 |
|------|------|------|------|----------|
| ContextVar 在新线程中不传播 | 中 | 低 | 低 | 记录已知限制；新线程显式传递 |
| TraceID 无全局唯一性保障 | 低 | 低 | 低 | UUIDv4 碰撞概率 2^-122，可忽略 |
| 高 QPS 下 LogRecord factory 性能 | 低 | 低 | 低 | ContextVar.get() 是 O(1) 操作 |
| `comment` 字段影响 MongoDB 查询缓存 | 低 | 低 | 低 | 仅附加到日志/慢查询分析，不影响查询结果 |

### 回滚策略：移除 trace_id_middleware 注册即可，不影响任何业务功能。|
---

doc_type: test
title: "YA-09-29: 请求追踪与分布式链路追踪 — OpenTelemetry 集成与 Span 传播 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa, sre]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-29"
source_prds: ["33-需求-分布式链路追踪"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-29: 请求追踪与分布式链路追踪 — 测试规格

> **文档职责**：本文档定义分布式链路追踪模块的**怎么验证**（VERIFY），覆盖 OpenTelemetry 初始化、Span 层级记录、异步上下文传播、TraceID 透传和 Jaeger 导出。

> 来源 PRD：[33-需求-分布式链路追踪.md](../../prds/2026-09/33-需求-分布式链路追踪.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | OpenTelemetry TracerProvider 初始化、Context 传播验证 | pytest + unittest.mock | 初始化配置、Span 属性设置、TraceID 格式 |
| L2 集成 | 真实 FastAPI 请求 + Span 层级记录 | pytest + httpx + opentelemetry | Gateway->Service->Domain->External 四层 Span |
| L3 手动回归 | Jaeger UI 可视化验证 | 手动 + Jaeger | 火焰图展示、耗时分布、跨服务关联 |

### 1.2 测试数据

```python
# tests/tracing/conftest.py

import pytest
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory import InMemorySpanExporter

@pytest.fixture
def in_memory_exporter():
    """内存 Span 导出器——捕获 Span 供断言使用。"""
    exporter = InMemorySpanExporter()
    provider = TracerProvider()
    provider.add_span_processor(SimpleSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    yield exporter
    # 清理全局 TracerProvider

@pytest.fixture
def tracer(in_memory_exporter):
    """测试用 Tracer 实例。"""
    return trace.get_tracer("test-tracer")

@pytest.fixture
def sample_request_context():
    """模拟请求上下文——包含 X-Request-Id 和 trace_id。"""
    return {
        "request_id": "req-abc123",
        "trace_id": "0000000000000000abc12300000000",
        "user": "test_user",
    }

@pytest.fixture
async def traced_client(app_with_tracing):
    """带 OpenTelemetry 中间件的测试客户端。"""
    async with AsyncClient(
        transport=ASGITransport(app=app_with_tracing),
        base_url="http://test"
    ) as ac:
        yield ac
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 OpenTelemetry 初始化

---

#### TC-TRACE-001: TracerProvider 正常启动并注册

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `init_tracing()` 被调用 |
| **步骤** | 1. 调用 `init_tracing(service_name="yiai")`<br/>2. 获取 `trace.get_tracer_provider()`<br/>3. 检查 Tracer 实例 |
| **预期结果** | - TracerProvider 非 None<br/>- Service name 为 `"yiai"`<br/>- 至少包含 1 个 SpanProcessor |

---

#### TC-TRACE-002: 开发环境使用 ConsoleSpanExporter

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-002 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 未设置 `JAEGER_ENDPOINT` 环境变量 |
| **步骤** | 1. 调用 `init_tracing()`<br/>2. 检查 `TracerProvider` 的导出器类型 |
| **预期结果** | - 导出器为 `ConsoleSpanExporter`<br/>- 或 `BatchSpanProcessor(ConsoleSpanExporter)`<br/>- Span 输出到 stdout |

---

#### TC-TRACE-003: 生产环境使用 Jaeger 导出（环境变量控制）

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 设置 `JAEGER_ENDPOINT=http://jaeger:14268/api/traces` |
| **步骤** | 1. 调用 `init_tracing()`<br/>2. 检查导出器配置 |
| **预期结果** | - 导出器包含 `JaegerExporter`<br/>- 端点地址正确 |

---

### 2.2 Span 层级记录

---

#### TC-TRACE-004: API Gateway Span 包含请求方法和状态码

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `traced_client` fixture，发送 RPC 请求 |
| **步骤** | 1. POST `/` body: `{module_name: "services.database.data_service", method_name: "query_documents", parameters: {...}}`<br/>2. 检查 `in_memory_exporter` 中捕获的 Span |
| **预期结果** | - 第一个 Span 名称为 `POST /`<br/>- 属性: `http.method=POST`, `http.status_code=200`<br/>- Span 包含 `rpc.module` 和 `rpc.method` 属性 |

---

#### TC-TRACE-005: Service 层 Span 记录耗时

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-005 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `query_documents` 方法有 `@trace_span("data_service.query_documents")` |
| **步骤** | 1. 发送 RPC 查询请求<br/>2. 检查 Span 层级结构<br/>3. 计算 `end_time - start_time` |
| **预期结果** | - 存在 Span `"services.database.data_service.query_documents"`<br/>- 该 Span 为 Gateway Span 的子 Span<br/>- `duration_ms` 属性记录实际耗时 > 0 |

---

#### TC-TRACE-006: External 层 Span（MongoDB + Ollama）

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-006 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | RAG 查询请求触发 MongoDB 查询 + Ollama 调用 |
| **步骤** | 1. 发送 RAG 查询请求<br/>2. 检查捕获的 Span 列表 |
| **预期结果** | - `mongodb.find` Span 记录耗时<br/>- `ollama.chat` Span 记录耗时<br/>- 两者都是 Service 层 Span 的子 Span |

---

#### TC-TRACE-007: Span 总耗时等于各层 Span 耗时之和

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-007 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 一次完整的 RAG 查询请求 |
| **步骤** | 1. 获取 Gateway Span 的 `duration_ms`<br/>2. 获取 Service + Domain + External 的 `duration_ms`<br/>3. 累加子 Span 耗时 |
| **预期结果** | - 父 Span 耗时 >= 子 Span 耗时之和<br/>- 误差 < 5%（异步重叠可接受） |

---

### 2.3 异步上下文传播

---

#### TC-TRACE-008: asyncio.create_task 中 trace_id 透传

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-008 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Service 通过 `asyncio.create_task` 创建后台任务 |
| **步骤** | 1. 发送请求触发 `asyncio.create_task(webhook_notify())`<br/>2. 检查后台任务的 Span 中的 `trace_id`<br/>3. 对比主请求的 `trace_id` |
| **预期结果** | - 后台任务的 `trace_id` 与主请求相同<br/>- 后台任务的 Span 为独立的子 Span<br/>- 日志中两个 Span 的 trace_id 一致 |

---

#### TC-TRACE-009: Agent 工具调用保持 trace_id 连续性

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-009 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Agent 循环中多次工具调用 |
| **步骤** | 1. 发送 Agent 请求<br/>2. 检查每次工具调用的 Span<br/>3. 验证所有 Span 的 trace_id 一致 |
| **预期结果** | - 主请求 + 所有工具调用的 trace_id 相同<br/>- 每次工具调用是主 Span 的子 Span<br/>- 工具调用间 Span 链完整 |

---

### 2.4 TraceID 与日志关联

---

#### TC-TRACE-010: 结构化日志包含 trace_id 字段

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-010 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 结构化日志 + OpenTelemetry 同时启用 |
| **步骤** | 1. 发送 RPC 请求<br/>2. 捕获 JSON 日志行<br/>3. 验证 trace_id 字段 |
| **预期结果** | - 每条日志包含 `trace_id`<br/>- `trace_id` 与 Gateway Span 一致<br/>- `span_id` 对应当前 Span |

---

#### TC-TRACE-011: 无请求上下文时 trace_id 为空字符串

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-011 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 后台任务（非请求触发）记录日志 |
| **步骤** | 1. apscheduler 触发 Watcher 扫描<br/>2. 检查 Watcher 日志中的 `trace_id` |
| **预期结果** | - `trace_id` 为空字符串 `""`<br/>- 或 `trace_id` 为新生成的独立 Trace<br/>- 不携带非关联的 trace_id |

---

### 2.5 Jaeger 可视化导出

---

#### TC-TRACE-012: Span 正确导出到 Jaeger

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-012 |
| **层级** | L3 手动 |
| **优先级** | P1 |
| **前提** | Jaeger all-in-one 运行在 `http://localhost:16686` |
| **步骤** | 1. 设置 `JAEGER_ENDPOINT` 并启动 YiAi<br/>2. 发送 5 个不同类型的 RPC 请求<br/>3. 打开 Jaeger UI 查询 Service `yiai` |
| **预期结果** | - 5 个 Trace 在 Jaeger 中可见<br/>- 每个 Trace 包含多层 Span<br/>- 火焰图正确展示调用层级 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: Jaeger 不可达时不影响正常请求处理

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 设置无效的 `JAEGER_ENDPOINT`<br/>2. 发送 RPC 请求 |
| **预期结果** | - RPC 请求返回 200<br/>- Span 导出失败不抛出异常到请求<br/>- 日志 WARNING: "Jaeger exporter connection failed, spans not exported" |

### TC-EDGE-002: 高并发请求时 Span 不交叉

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 使用 `asyncio.gather` 同时发送 10 个请求<br/>2. 检查每个请求的 Span trace_id 唯一性 |
| **预期结果** | - 10 个请求生成 10 个不同的 trace_id<br/>- 每个请求的 Span 层级独立不交叉<br/>- Context 传播正确隔离 |

### TC-EDGE-003: 超长 Span 属性值截断

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 构造请求参数包含 10KB 字符串<br/>2. 检查 Span 属性的 `parameters` 值 |
| **预期结果** | - Span 属性值截断到 256 字符<br/>- 日志记录完整参数（不受截断影响） |

### TC-EDGE-004: 请求中途取消时的 Span 状态

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. 发送长时间请求<br/>2. 客户端中途取消（`asyncio.CancelledError`）<br/>3. 检查 Span 状态 |
| **预期结果** | - Span 状态标记为 `CANCELLED` 或 `ERROR`<br/>- Span 仍被记录和导出<br/>- `end_time` 等于取消时刻 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: OpenTelemetry 开销 < 0.1ms/Span

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 对比启用/禁用 Tracing 时的请求延迟<br/>2. 发送 100 次相同请求<br/>3. 计算 P50 延迟差异 |
| **预期结果** | - 启用 Tracing 的额外开销 < 0.5ms/请求<br/>- 单个 Span 创建开销 < 0.1ms |

### TC-REG-002: 现有日志格式不受 Tracing 影响

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 启用 Tracing 后检查所有模块日志<br/>2. 对比启用前后的日志格式 |
| **预期结果** | - 日志仍为 JSON 结构化格式<br/>- 仅新增 `trace_id`/`span_id` 字段<br/>- 无格式破坏 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-OpenTelemetry 初始化 | tracing.py | TC-TRACE-001~003 | L1 |
| FR-Gateway Span 记录 | 中间件 | TC-TRACE-004 | L2 |
| FR-Service/Domain/External Span | 装饰器 | TC-TRACE-005~007 | L2 |
| FR-异步上下文传播 | Context | TC-TRACE-008~009 | L2 |
| FR-TraceID 日志关联 | 日志集成 | TC-TRACE-010~011 | L1+L2 |
| FR-Jaeger 导出 | 导出器 | TC-TRACE-012 | L3 |
| FR-容错 | 异常处理 | TC-EDGE-001~004 | L1+L2 |
| FR-性能 | 开销测量 | TC-REG-001~002 | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 跨服务 Span 关联（YiVad -> YiAi） | 前端未集成 OpenTelemetry | 在 YiVad 可观测性测试中补充 |
| Zipkin 导出后端 | 当前仅支持 Jaeger | 评估需要后添加 Zipkin exporter |
| 生产环境 Sampling 策略 | 测试环境 100% 采样 | 在性能测试中验证 10% 采样策略 |
| Span 事件（Event）记录 | 基础 Span 覆盖已完成 | 在异常检测测试中补充 Event |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [33-需求-分布式链路追踪.md](../../prds/2026-09/33-需求-分布式链路追踪.md) |
| 结构化日志 | [../2026-09/35-prd-test-结构化日志.md](../2026-09/35-prd-test-结构化日志.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/33-需求-分布式链路追踪.md`*
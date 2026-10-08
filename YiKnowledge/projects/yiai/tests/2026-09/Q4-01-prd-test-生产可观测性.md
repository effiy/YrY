---

doc_type: test
title: "YA-10-01: 生产可观测性与智能运维 — 追踪/告警/仪表盘/剖析/自愈 — 测试规格"
status: 待开始
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202610"
prd_task_id: "YA-10-01"
source_prds: ["01-需求-生产可观测性"]
source_modules: ["01-prd-task-生产可观测性"]
source_okr: [yiai-q4-001]

type: test
---

# YA-10-01: 生产可观测性与智能运维 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

> 来源 PRD：[01-需求-生产可观测性.md](../../prds/2026-Q4/01-需求-生产可观测性.md)
> 来源 Dev：[01-prd-task-生产可观测性.md](../../devs/2026-Q4/01-prd-task-生产可观测性.md)

---

<a id="sec-scope"></a>
## 一、测试范围

### 测试层级

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 纯函数/类级测试，无外部依赖 | pytest + unittest.mock | tracing 工具函数, alert 规则引擎, logging formatter |
| L2 集成测试 | 模块间交互, 真实 MongoDB (test db) | pytest-asyncio + httpx + motor | trace 传播, alert pipeline, dashboard API, monitor 后台任务 |
| L3 系统测试 | 全栈端到端 (需要 Jaeger, 企微 Webhook) | pytest + 外部 fixtures | 完整 trace -> Jaeger, alert -> 企微送达 |
| L4 性能基准 | 启用/禁用 tracing 的性能对比 | pytest-benchmark + wrk | P95 增加 < 5% |

### 测试数据

```python
# Fixtures in tests/conftest.py (新增)

@pytest.fixture
def sample_traceparent():
    """Valid W3C traceparent header."""
    return "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"

@pytest.fixture
def sample_alert_rule_threshold():
    """Threshold alert rule fixture."""
    return {
        "name": "test_high_error",
        "description": "Test error rate alert",
        "rule_type": "threshold",
        "severity": "warning",
        "threshold": 0.05,
        "cooldown_seconds": 60,
        "enabled": True,
    }

@pytest.fixture
def sample_metric_snapshot():
    """Metric snapshot fixture."""
    return {
        "timestamp": datetime(2026, 10, 1, 12, 0, 0, tzinfo=timezone.utc),
        "metrics": {
            "rpc_p50_ms": 12.3, "rpc_p95_ms": 45.7, "rpc_p99_ms": 89.2,
            "rpc_rps": 5.2, "rpc_error_rate": 0.01,
            "mongodb_pool_usage_pct": 0.45, "mongodb_query_p95_ms": 3.2,
            "rag_query_p95_ms": 120.5, "rag_cache_hit_rate": 0.72,
            "ollama_p95_ms": 3200.0,
            "memory_rss_mb": 256.0, "cpu_pct": 12.5,
            "eventloop_lag_ms": 0.05, "health_score": 85,
        },
    }

@pytest.fixture
async def test_mongo_collection():
    """Create a test collection in test database, drop after test."""
    from data.database import get_database
    db = get_database()
    collection = db["test_observability"]
    yield collection
    await collection.drop()
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 KR1: 全链路 TraceID 透传

---

#### TC-TRACE-001: TraceID 生成 —— 入站请求无 traceparent 时自动生成

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行, tracing enabled, Zipkin 可达 |
| **步骤** | 1. 发送 POST / RPC 请求 (不带 traceparent header)<br/>2. 检查响应 status code = 200<br/>3. 读取 `logs/app.jsonl` 中该请求的日志行<br/>4. 检查 Jaeger UI 是否有对应 trace |
| **预期结果** | - 所有日志行 `trace_id` 字段为 32 hex 字符且值相同<br/>- trace_id 非空字符串<br/>- span_id 为 16 hex 字符<br/>- Jaeger 查询该 trace_id 返回 1 个 trace |

---

#### TC-TRACE-002: TraceID 继承 —— 入站请求含 traceparent 时继承上游 TraceID

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行 |
| **步骤** | 1. 发送 POST / 请求, 带 header `traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01`<br/>2. 检查日志中的 trace_id |
| **预期结果** | - 日志 trace_id = `0af7651916cd43dd8448eb211c80319c` (继承上游)<br/>- span_id 为新生成的 16 hex (非 `b7ad6b7169203331`) |

---

#### TC-TRACE-003: MongoDB $comment 注入 —— 所有 Motor 操作携带 trace_id

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | MongoDB profiler level 设置为 1 (记录慢查询) |
| **步骤** | 1. 发送 POST / RPC -> `data_service.query_documents`<br/>2. 查询 `system.profile` 集合中该操作的 command<br/>3. 检查 `command.comment` |
| **预期结果** | - `command.comment.trace_id` = 请求的 trace_id<br/>- `command.comment.span_id` = 对应的 span_id |

---

#### TC-TRACE-004: Zipkin Span 导出 —— Span 出现在 Jaeger

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-004 |
| **层级** | L3 E2E |
| **优先级** | P1 |
| **前提** | Jaeger 运行在 localhost:16686, Zipkin 端点 localhost:9411 |
| **步骤** | 1. 发送 10 个 POST / RPC 请求 (不同 module_name/method_name)<br/>2. 等待 BatchSpanProcessor flush (5s)<br/>3. 请求 Jaeger API: `GET http://localhost:16686/api/traces?service=YiAi` |
| **预期结果** | - Jaeger API 返回 N >= 1 条 traces<br/>- 每条 trace 包含至少 1 个 Span<br/>- Span.name 格式为 `rpc.{module_name}.{method_name}` |

---

#### TC-TRACE-005: 18 路由全覆盖 —— 所有端点经过 trace 中间件

| 字段 | 内容 |
|------|------|
| **ID** | TC-TRACE-005 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行, 通过 `app.routes` 获取所有注册路由 |
| **步骤** | 1. 遍历所有已注册路由 (排除 /metrics, /health/*, /static)<br/>2. 对每条路由发送至少 1 个有效请求<br/>3. 检查日志中每条请求的 trace_id |
| **预期结果** | - 所有路由的请求日志均含非空 trace_id<br/>- 无遗漏路由 (覆盖率 100%) |

---

### 2.2 KR2: 智能告警路由

---

#### TC-ALERT-001: 阈值告警触发 —— 错误率超过阈值时发送通知

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-001 |
| **层级** | L1 单元 + L2 集成 |
| **优先级** | P0 |
| **前提** | 注册 threshold 规则: error_rate > 0.05, severity=warning, channel=wework |
| **步骤** | 1. 注入 error_rate=0.08 的指标值<br/>2. 调用 `rule.evaluate(0.08)`<br/>3. 检查 alert_service 是否调用 notifier.notify() |
| **预期结果** | - `evaluate()` 返回 `True`<br/>- notifier.notify() 被调用 1 次<br/>- notifier 收到的 title 含 `[WARNING]` 前缀 |

---

#### TC-ALERT-002: 环比告警 —— 错误率突增 200% 时触发

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-002 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 注册 delta 规则: error_rate 环比 > 200% |
| **步骤** | 1. 填充基线样本: [0.01, 0.01, 0.01, 0.01, 0.01]<br/>2. 调用 `evaluate(0.05)` (base=0.01, delta=400%)<br/>3. 检查触发状态 |
| **预期结果** | - `evaluate(0.05)` 返回 `True`<br/>- 基线样本正确计算均值 0.01<br/>- 变化率计算 = (0.05-0.01)/0.01 * 100 = 400% |

---

#### TC-ALERT-003: 冷却窗口 —— 同一规则 5 分钟内不重复触发

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 注册 threshold 规则: cooldown=60s |
| **步骤** | 1. 第 1 次 evaluate(0.08) -> 期望 True<br/>2. 立即第 2 次 evaluate(0.08) -> 冷却中<br/>3. 等待 65s<br/>4. 第 3 次 evaluate(0.08) -> 冷却已过 |
| **预期结果** | - 第 1 次: `True`<br/>- 第 2 次: `False` (冷却)<br/>- 第 3 次: `True` (冷却已过) |

---

#### TC-ALERT-004: 告警聚合 —— 60s 内同规则多条告警合并为 1 条

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | alert_service 运行, 聚合窗口 60s |
| **步骤** | 1. 在 10s 内连续触发 5 次同一规则<br/>2. 检查 notifier.notify() 调用次数 |
| **预期结果** | - notifier.notify() 仅调用 1 次<br/>- 消息 body 包含 `Occurrences in last 60s: 5` |

---

### 2.3 KR3: 健康度仪表盘

---

#### TC-DASHBOARD-001: 指标采集与导出 —— `/metrics` 端点返回 Prometheus 格式

| 字段 | 内容 |
|------|------|
| **ID** | TC-DASHBOARD-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行, prometheus_client 已安装 |
| **步骤** | 1. `curl http://localhost:10086/metrics`<br/>2. 解析响应文本 |
| **预期结果** | - HTTP 200<br/>- Content-Type = `text/plain; version=0.0.4`<br/>- 包含至少 15 个指标 family (HELP + TYPE 注释)<br/>- 指标名格式: `yiai_*` |

---

#### TC-DASHBOARD-002: 评分卡计算 —— 综合健康分 0-100

| 字段 | 内容 |
|------|------|
| **ID** | TC-DASHBOARD-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | metric_snapshots 有数据 (手动插入 1 条正常快照) |
| **步骤** | 1. `curl http://localhost:10086/dashboard/scorecard`<br/>2. 验证返回结构 |
| **预期结果** | - `data.score` 为 0-100 整数<br/>- `data.sub_scores` 包含 latency/error/pool/resource 四个子分<br/>- `data.timestamp` 为 ISO 8601 格式<br/>- 正常快照下 score > 70 |

---

#### TC-DASHBOARD-003: 趋势查询 —— 范围数据点返回

| 字段 | 内容 |
|------|------|
| **ID** | TC-DASHBOARD-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | metric_snapshots 含至少 5 条 span 1h 的数据 |
| **步骤** | 1. `curl "http://localhost:10086/dashboard/trends?metric=latency_p99&window=1h"` |
| **预期结果** | - `data.data` 为数组，每个元素含 `timestamp` 和 `value`<br/>- 数组长度 >= 5<br/>- 时间戳单调递增 |

---

### 2.4 KR4: 性能剖析火焰图

---

#### TC-PROFILE-001: Histogram 分桶覆盖 —— P50/P95/P99 可精确计算

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROFILE-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 新增 buckets 定义: `[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0]` |
| **步骤** | 1. 发送 N 个延迟不同的请求 (覆盖 5ms 到 60s)<br/>2. 检查 `/metrics` 中 `yiai_rpc_request_duration_seconds_bucket`<br/>3. 使用 `histogram_quantile(0.50/0.95/0.99, ...)` 验证分位数 |
| **预期结果** | - P50 对应 10-50ms 范围内的合理值<br/>- P99 对应 5-30s 范围内的合理值<br/>- `+Inf` 桶包含所有请求数<br/>- P99 不落在 `+Inf` 桶 (bucket 覆盖足够) |

---

#### TC-PROFILE-002: 慢查询采样 —— MongoDB 操作超阈值时记录详情

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROFILE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | MongoDB CommandListener 阈值 100ms (可配) |
| **步骤** | 1. 注入慢查询 (模拟 collection scan, > 100ms)<br/>2. 检查日志中是否有慢查询记录<br/>3. 检查记录包含: collection, duration, filter |
| **预期结果** | - 日志 level=WARNING<br/>- 日志含 `[SlowQuery]` 标记<br/>- 记录包含 `collection`、`duration_ms`、`filter` 字段 |

---

#### TC-PROFILE-003: 火焰图数据端点 —— `/debug/profile` 返回 speedscope JSON

| 字段 | 内容 |
|------|------|
| **ID** | TC-PROFILE-003 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **前提** | py-spy 已安装 (`pip install py-spy`) |
| **步骤** | 1. `curl "http://localhost:10086/debug/profile?duration=10"` <br/>2. 验证返回 JSON 结构 |
| **预期结果** | - HTTP 200<br/>- 返回 speedscope 兼容 JSON (`$schema`, `shared`, `profiles` 字段)<br/>- profiles 含至少 100 个 frame 采样<br/>- duration 约为 10s |

---

### 2.5 KR5: 自愈恢复

---

#### TC-HEAL-001: 连接池自动扩容 —— 使用率 > 80% 时触发扩容

| 字段 | 内容 |
|------|------|
| **ID** | TC-HEAL-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | self_healing.pool.enabled=true, threshold=0.8, scale_step=0.2 |
| **步骤** | 1. 模拟: pool_usage=0.85 注入 (通过 metric Gauge set)<br/>2. 等待 pool_monitor_loop 下个周期 (15s)<br/>3. 检查 `mongodb_pool_usage_ratio` 指标<br/>4. 检查日志中的扩缩记录 |
| **预期结果** | - 日志含 `[Monitor] Auto-scaling pool` 记录<br/>- maxPoolSize 从 100 变为 120 (或配置的当前值 * 1.2)<br/>- maxPoolSize 不超过 self_healing.pool.max_pool_size (200) |

---

#### TC-HEAL-002: 游标超时 kill —— 超过 30s 的 getMore 游标被终止

| 字段 | 内容 |
|------|------|
| **ID** | TC-HEAL-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | self_healing.cursor_kill.enabled=true, max_age=30s |
| **步骤** | 1. 创建一个大结果集查询，不消费游标 (模拟泄漏)<br/>2. 等待 cursor_leak_scan_loop 下个周期 (10s)<br/>3. 检查游标是否被杀<br/>4. 检查日志 |
| **预期结果** | - 泄漏游标在 30s 超时后被 kill<br/>- 日志含 `[Monitor] Killed stale cursor` 记录<br/>- 原始查询收到 `CursorNotFound` 错误<br/>- 不误杀正常活跃查询 |

---

#### TC-HEAL-003: EventLoop 阻塞检测 —— 心跳间隔 > 1s 触发告警

| 字段 | 内容 |
|------|------|
| **ID** | TC-HEAL-003 |
| **层级** | L1 单元 + L2 集成 |
| **优先级** | P0 |
| **前提** | self_healing.eventloop.enabled=true, alert_threshold=1.0s |
| **步骤** | 1. 注入阻塞: `time.sleep(2.0)` 在任意 async handler 中<br/>2. 等待 heartbeat_loop 下个周期 (1s)<br/>3. 检查 `eventloop_lag_seconds` 指标<br/>4. 检查日志/告警 |
| **预期结果** | - `eventloop_lag_seconds` Histogram 包含 > 1.0s 的观测值<br/>- 日志 level=WARNING 含 `[Monitor] EventLoop blocked`<br/>- 如告警规则注册: 企微收到 heartbeat 告警 |

---

#### TC-HEAL-004: 心跳持续更新 —— 正常运行无告警

| 字段 | 内容 |
|------|------|
| **ID** | TC-HEAL-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | runtime_monitor 运行中 |
| **步骤** | 1. 正常运行 30s<br/>2. 检查 `eventloop_lag_seconds` 指标<br/>3. 检查日志无 EventLoop blocked 警告 |
| **预期结果** | - `eventloop_lag_seconds` 的观测值 < 0.01s (绝大多数)<br/>- 无 WARNING 级别 EventLoop 日志 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: traceparent 格式错误时生成新 TraceID

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 发送请求, traceparent=`"invalid-format"`<br/>2. 检查 trace_id |
| **预期结果** | - W3C 解析失败, 生成新 trace_id (降级, 不崩溃)<br/>- 日志可能含 WARNING: `Failed to parse traceparent` |

### TC-EDGE-002: Zipkin 不可达时追踪不阻塞业务

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 停止 Jaeger/Zipkin 进程<br/>2. 发送正常 RPC 请求<br/>3. 检查响应延迟和状态 |
| **预期结果** | - RPC 请求正常响应 (HTTP 200)<br/>- P95 延迟无明显增加<br/>- 日志可能含 `Failed to export spans` (WARNING/DEBUG) |

### TC-EDGE-003: 告警风暴防护 —— 10+ 规则同时触发时聚合正常

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 同时注入 10 个规则的超阈值指标值<br/>2. 等待 1 个评估周期<br/>3. 检查企微收到的消息数量 |
| **预期结果** | - 每条规则独立冷却, 消息不超过 10 条<br/>- 无企微限流错误 (20 msg/min)<br/>- 无消息丢失 |

### TC-EDGE-004: 指标基数爆炸防护 —— 高基标签不会无限增长

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 发送 N=100 个请求, 每个请求不同 module_name + method_name 标签值<br/>2. 检查 `/metrics` 响应大小 |
| **预期结果** | - `/metrics` 响应大小 < 1MB<br/>- 无重复标签组合导致的线性增长<br/>- 未知 module_name 统一为 `other` (白名单机制) |

### TC-EDGE-005: Promise 并发 —— 10 并发请求的 trace_id 不串扰

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 使用 `asyncio.gather` 同时发送 10 个请求<br/>2. 检查每个请求日志的 trace_id |
| **预期结果** | - 10 个请求的 trace_id 互不相同<br/>- 同一请求的所有日志行 trace_id 一致<br/>- ContextVar 在并发下有正确的协程隔离 |

### TC-EDGE-006: tracing disabled 时零性能开销

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-006 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 设置 `tracing.enabled=false`<br/>2. 发送 100 个请求, 测量 P50/P95<br/>3. 与 tracing.enabled=true 对比 |
| **预期结果** | - tracing disabled 时 P95 与 baseline 无异<br/>- `current_trace_id.get()` 返回空字符串 (不抛异常) |

### TC-EDGE-007: dashboard API 无数据时降级返回

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-007 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. 清空 metric_snapshots 集合<br/>2. 请求 `/dashboard/scorecard` 和 `/dashboard/trends?metric=latency_p99&window=24h` |
| **预期结果** | - scorecard 返回 `{score: 0, message: "no data yet"}`<br/>- trends 返回 `{data: []}`<br/>- HTTP 200 (非 500) |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: Q3 /health 端点行为不变

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `curl /health/live` -> 期望 `{status: "alive"}` HTTP 200<br/>2. `curl /health/ready` -> 期望 `{status: "ready"}` HTTP 200<br/>3. `curl /health/debug` -> 期望包含 mongo/ollama/rag/memory 字段 HTTP 200 |
| **预期结果** | - 三个端点的响应格式与 Q3 完全一致<br/>- `/health/debug` 可选新增 eventloop 字段 |

### TC-REG-002: 现有 RPC 协议不变

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发送标准 RPC 请求: `{module_name: "services.database.data_service", method_name: "query_documents", parameters: {cname: "menus", filter: {}}}`<br/>2. 验证响应格式 |
| **预期结果** | - 响应格式 `{code: 0, message: "ok", data: {list: [...], ...}}` 不变<br/>- 无新增响应字段冲突 |

### TC-REG-003: SSE 流式响应正常

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发送 chat SSE 请求 (需要 Ollama)<br/>2. 验证 stream 正常流式输出 |
| **预期结果** | - SSE 流正常输出 `data: {...}\n\n` 帧<br/>- 完成后收到 `data: {"done": true}`<br/>- 流中的日志 trace_id 一致 |

### TC-REG-004: 现有 Prometheus 指标兼容

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 请求 `/metrics`<br/>2. 检查已有的 9 类指标 (rpc_request_total, mongodb_pool_size 等) 是否仍存在 |
| **预期结果** | - Q3 已有的指标全部存在且名称未变<br/>- 新增指标以 `yiai_` 前缀, 不与现有指标冲突 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | KR | 测试用例 | 覆盖层级 |
|--------|-----|---------|---------|
| FR-1.1 TraceID 生成与注入 | KR1 | TC-TRACE-001 | L2 |
| FR-1.2 跨协程传播 | KR1 | TC-EDGE-005 | L2 |
| FR-1.3 日志自动关联 | KR1 | TC-TRACE-001 | L2 |
| FR-1.4 MongoDB 传播 | KR1 | TC-TRACE-003 | L2 |
| FR-1.5 Ollama 传播 | KR1 | TC-TRACE-005 (扩展) | L2 |
| FR-1.6 OpenTelemetry Span | KR1 | TC-TRACE-004 | L3 |
| FR-1.7 Zipkin 导出 | KR1 | TC-TRACE-004 | L3 |
| FR-1.8 18 路由全覆盖 | KR1 | TC-TRACE-005 | L2 |
| FR-2.1 告警规则引擎 | KR2 | TC-ALERT-001, TC-ALERT-002 | L1+L2 |
| FR-2.2 通道路由 | KR2 | TC-ALERT-001 | L2 |
| FR-2.3 冷却窗口 | KR2 | TC-ALERT-003 | L1 |
| FR-2.4 告警聚合 | KR2 | TC-ALERT-004 | L2 |
| FR-3.1 指标采集 | KR3 | TC-DASHBOARD-001 | L2 |
| FR-3.2 Metrics 导出 | KR3 | TC-DASHBOARD-001 | L2 |
| FR-3.3 评分卡 API | KR3 | TC-DASHBOARD-002 | L2 |
| FR-3.4 趋势查询 API | KR3 | TC-DASHBOARD-003 | L2 |
| FR-4.1 直方图分桶 | KR4 | TC-PROFILE-001 | L2 |
| FR-4.2 慢查询采样 | KR4 | TC-PROFILE-002 | L2 |
| FR-4.3 火焰图数据 | KR4 | TC-PROFILE-003 | L2 |
| FR-5.1 连接池扩容 | KR5 | TC-HEAL-001 | L2 |
| FR-5.2 游标超时回收 | KR5 | TC-HEAL-002 | L2 |
| FR-5.3 EventLoop 检测 | KR5 | TC-HEAL-003, TC-HEAL-004 | L1+L2 |
| — | — | TC-EDGE-001~007 (边界) | L1+L2 |
| — | — | TC-REG-001~004 (回归) | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| Ollama 侧 Span 传播无法测试 | Ollama 不原生支持 W3C TraceContext, 仅检查 `X-Trace-Id` header 的发送 | 通过 mock Ollama server 检查请求头 |
| Zipkin Exporter 批量导出时机不确定 | BatchSpanProcessor 的导出时机依赖 timeout + batch size, 测试结果不稳定 | 使用 `await provider.force_flush()` 或设置 `schedule_delay_millis=100` |
| 企微 Webhook 真实送达的 E2E | 测试环境无真实企微 Webhook URL | Mock HTTP endpoint 作为 Webhook 接收方 |
| 自愈-内存重启 E2E | 内存触发重启是破坏性操作, 无法在单进程测试中验证 | 仅做单元测试 (GC 调用), 重启逻辑通过日志验证 |
| Grafana 仪表盘数据正确性 | Grafana 是独立系统, 无法在 pytest 中自动化 | 手动验收: 导入 JSON -> 检查 4 面板数据展示 |

---

<a id="sec-test-data"></a>
## 七、测试数据与 Fixture 详细定义

### L2 集成测试的 MongoDB 初始化

```python
# tests/test_observability_integration.py (新增文件)

@pytest.fixture(autouse=True)
async def setup_tracing():
    """Ensure tracing is initialized for integration tests."""
    from shared.tracing import init_tracing
    init_tracing()
    yield
    from shared.tracing import shutdown_tracing
    shutdown_tracing()

@pytest.fixture
async def test_alert_rule_doc(test_mongo_collection):
    """Insert test alert rule document."""
    doc = {
        "name": "test_high_latency",
        "description": "Test high latency alert",
        "metric_name": "yiai_rpc_request_duration_seconds",
        "condition": {
            "type": "threshold",
            "threshold": 5.0,
            "window_seconds": 300,
            "min_samples": 3,
        },
        "severity": "warning",
        "channels": ["wework"],
        "cooldown_seconds": 300,
        "enabled": True,
    }
    await test_mongo_collection.insert_one(doc)
    yield doc
    await test_mongo_collection.delete_one({"name": "test_high_latency"})

@pytest.fixture
async def mock_wework_notifier(mocker):
    """Mock WeWork notifier for alert tests."""
    mock = mocker.patch("services.alert.notifiers.wework.notify")
    mock.return_value = True
    yield mock
```

### 性能基准测试

```python
# tests/test_observability_perf.py (新增文件)

@pytest.mark.slow
@pytest.mark.asyncio
async def test_tracing_overhead_p95():
    """Verify tracing adds < 5% to P95 latency."""
    import time
    from shared.tracing import init_tracing, shutdown_tracing

    # Baseline: tracing disabled
    latencies_baseline = []
    for _ in range(100):
        start = time.perf_counter()
        # ... send RPC request ...
        latencies_baseline.append(time.perf_counter() - start)

    # With tracing: tracing enabled
    init_tracing()
    latencies_trace = []
    for _ in range(100):
        start = time.perf_counter()
        # ... send RPC request ...
        latencies_trace.append(time.perf_counter() - start)

    p95_baseline = sorted(latencies_baseline)[int(95 * len(latencies_baseline) / 100)]
    p95_trace = sorted(latencies_trace)[int(95 * len(latencies_trace) / 100)]

    overhead_pct = (p95_trace - p95_baseline) / p95_baseline * 100
    assert overhead_pct < 5.0, f"Tracing overhead {overhead_pct:.1f}% exceeds 5%"
```

---

<a id="sec-references"></a>
## 八、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [01-需求-生产可观测性.md](../../prds/2026-Q4/01-需求-生产可观测性.md) |
| 源 Dev Module | [01-prd-task-生产可观测性.md](../../devs/2026-Q4/01-prd-task-生产可观测性.md) |
| Q3 告警测试 | [../2026-09/0036-prd-test-告警路由.md](../2026-09/036-prd-test-告警路由.md) |
| Q3 结构化日志测试 | [../2026-09/0035-prd-test-结构化日志.md](../2026-09/035-prd-test-结构化日志.md) |
| Q3 EventLoop 测试 | [../2026-09/0078-prd-test-EventLoop阻塞检测.md](../2026-09/078-prd-test-EventLoop阻塞检测.md) |
| Q3 健康度评分卡测试 | [../2026-09/0051-prd-test-健康度评分卡.md](../2026-09/051-prd-test-健康度评分卡.md) |
| Q3 性能剖析测试 | [../2026-09/0037-prd-test-性能剖析火焰图.md](../2026-09/037-prd-test-性能剖析火焰图.md) |
| OpenTelemetry Python Docs | [opentelemetry-python.readthedocs.io](https://opentelemetry-python.readthedocs.io/) |
| W3C TraceContext Spec | [w3c.github.io/trace-context](https://www.w3.org/TR/trace-context/) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-Q4/01-需求-生产可观测性.md`*
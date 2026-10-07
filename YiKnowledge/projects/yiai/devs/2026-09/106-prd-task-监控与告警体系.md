---

doc_type: module
prd_task_id: "YA-09-50"
title: "YA-09-50: 监控与告警体系 — Prometheus + Grafana — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 5.0
source_prd: "106-需求-监控与告警体系.md"
source_okr: [yiai-001]
related_tests: ["106-prd-test-监控与告警体系"]
acceptance_criteria:
  - "`/metrics` 端点输出符合 Prometheus 文本格式，所有自定义指标可被抓取"
  - Grafana 5 个仪表盘可导入并实时展示数据，面板无报错
  - 4 条告警规则全部生效，触发后 2min 内企业微信收到通知
  - MetricsMiddleware 对请求延迟增加 < 0.5ms (P99)
  - docker-compose 一键启动 Prometheus + Grafana + Alertmanager

type: task
---

# YA-09-50: 监控与告警体系 — Prometheus + Grafana — 开发方案

| 属性 | 值 |
|------|-----|
| 文档编号 | YA-09-50 |
| 版本 | v1.0 |
| 密级 | 内部 |
| 作者 | 陈铭 |
| 审核人 | — |
| 状态 | 需求已编写 |
| 最后更新 | 2026-09-23 |

> 来源 PRD：[106-需求-监控与告警体系.md](../../prds/2026-09/106-需求-监控与告警体系.md)
> 需求编号：YA-09-50 · 优先级：P1 · 人天：5.0d
> 测试规格：[106-prd-test-监控与告警体系.md](../../tests/2026-09/106-prd-test-监控与告警体系.md)

---

## 目录

1. [问题](#一问题)
2. [设计约束](#二设计约束)
3. [架构](#三架构)
4. [实施步骤](#四实施步骤)
5. [非功能性设计](#五非功能性设计)
6. [测试策略](#六测试策略)
7. [关联与回滚](#七关联与回滚)
附录 A. [变更记录](#附录-a-变更记录)

---

<a id="sec-1"></a>
## 一、问题

当前 YiAi 无可观测性基础设施——无请求延迟、错误率、吞吐量等生产关键指标。线上问题排查依赖日志 grep，无 dashboards 和告警。

**目标**: 建立从指标采集 → 可视化 → 告警的完整可观测性链路。

---

<a id="sec-2"></a>
## 二、设计约束

| 约束项 | 说明 |
|--------|------|
| 零侵入业务代码 | MetricsMiddleware 在 ASGI 层自动采集，业务 Service 无需修改 |
| Prometheus 文本格式 | `/metrics` 端点输出符合 Prometheus 标准，直出 `text/plain` |
| 采集间隔 15s | Prometheus `scrape_interval: 15s`，指标精度满足生产监控需求 |
| 告警延迟 ≤ 2min | 从指标越线到企微通知送达，端到端延迟不超过 2min |
| 仪表盘可导入 | Grafana dashboard 以 JSON 文件管理，支持 `docker-compose up` 一键导入 |
| 指标命名规范 | 遵循 Prometheus 最佳实践：`yiai_{domain}_{metric}_total|_seconds|_count` |

---

<a id="sec-3"></a>
## 三、架构

```
YiAi App (prometheus_client)
  └─ GET /metrics → Prometheus 抓取 (15s interval)
       └─ Grafana 仪表盘 (实时查询)
            └─ Alertmanager 告警规则
                 └─ 企业微信 / Webhook 通知
```

### 3.1 核心指标

```python
# server/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Request
import time

# 请求指标
request_count = Counter("yiai_requests_total", "Total requests", ["method", "endpoint", "status"])
request_duration = Histogram("yiai_request_duration_seconds", "Request latency", ["method", "endpoint"])
active_connections = Gauge("yiai_active_connections", "Active connections")

# LLM 指标
llm_inference_duration = Histogram("yiai_llm_inference_seconds", "LLM inference latency", ["model"])
llm_tokens_total = Counter("yiai_llm_tokens_total", "Total tokens", ["model", "type"])
llm_errors = Counter("yiai_llm_errors_total", "LLM errors", ["model", "error_type"])

# MongoDB 指标
mongo_query_duration = Histogram("yiai_mongo_query_seconds", "MongoDB query latency", ["collection", "operation"])
mongo_pool_size = Gauge("yiai_mongo_pool_size", "Connection pool size")
mongo_pool_available = Gauge("yiai_mongo_pool_available", "Available connections")

# RAG 指标
rag_retrieval_duration = Histogram("yiai_rag_retrieval_seconds", "RAG retrieval latency")
rag_documents_retrieved = Histogram("yiai_rag_docs_retrieved", "Documents per query")

# Agent 指标
agent_tool_calls = Counter("yiai_agent_tool_calls_total", "Agent tool calls", ["tool"])
agent_loop_iterations = Histogram("yiai_agent_loop_iterations", "Agent loop iterations")

# 中间件：自动采集请求指标
class MetricsMiddleware:
    async def __call__(self, request: Request, call_next):
        active_connections.inc()
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        active_connections.dec()
        request_count.labels(request.method, request.url.path, response.status_code).inc()
        request_duration.labels(request.method, request.url.path).observe(duration)
        return response

# 暴露 /metrics 端点
async def metrics_endpoint():
    return Response(generate_latest(), media_type="text/plain")
```

### 3.2 Grafana 仪表盘

| Dashboard | 面板 | 数据源 |
|-----------|------|--------|
| 服务概览 | QPS, P50/P95/P99 延迟, 错误率, 活跃连接 | `yiai_request_*` |
| LLM 专项 | 推理延迟/模型, Token 消耗趋势, 错误分布 | `yiai_llm_*` |
| MongoDB 专项 | 查询延迟, 连接池利用率, 慢查询 Top 10 | `yiai_mongo_*` |
| RAG 专项 | 检索延迟, 文档命中数, 缓存命中率 | `yiai_rag_*` |
| Agent 专项 | 工具调用分布, 循环迭代数, 成功率 | `yiai_agent_*` |

### 3.3 告警规则

```yaml
# deploy/prometheus/alerts.yml
groups:
  - name: yiai
    rules:
      - alert: HighErrorRate
        expr: rate(yiai_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations: { summary: "错误率 > 5%: {{ $value }}" }

      - alert: HighLatency
        expr: histogram_quantile(0.99, yiai_request_duration_seconds) > 5
        for: 5m
        annotations: { summary: "P99 延迟 > 5s" }

      - alert: MongoPoolExhausted
        expr: yiai_mongo_pool_available < 2
        for: 1m
        annotations: { summary: "MongoDB 连接池即将耗尽" }

      - alert: LLMErrorSpike
        expr: rate(yiai_llm_errors_total[5m]) > 0.1
        for: 5m
        annotations: { summary: "LLM 错误率飙升" }
```

### 3.4 告警路由

| 告警级别 | 通道 | 接收人 |
|----------|------|--------|
| critical (HighErrorRate, MongoPoolExhausted) | 企业微信 + Webhook | 值班 oncall |
| warning (HighLatency, LLMErrorSpike) | 企业微信 | 开发组 |

---

<a id="sec-4"></a>
## 四、实施步骤

| # | 步骤 | 文件 | 验证 | 人天 |
|---|------|------|------|------|
| 1 | `server/metrics.py` + `MetricsMiddleware` | `server/metrics.py` | `curl /metrics` 显示 Prometheus 格式 | 1.5 |
| 2 | Grafana dashboards（5 个仪表盘 JSON） | `deploy/grafana/dashboards/` | 本地 Grafana 可导入并显示数据 | 1.5 |
| 3 | Prometheus 配置 + docker-compose 集成 | `deploy/prometheus/`, `docker-compose.yml` | `docker-compose up` 后 Prometheus 可抓取 | 0.5 |
| 4 | 告警规则 + Alertmanager + 企微通知 | `deploy/prometheus/alerts.yml` | 触发告警后 2min 内收到企微消息 | 1.0 |
| 5 | 文档：仪表盘使用说明 + 告警响应手册 | — | Wiki 可查阅 | 0.5 |

**合计：5.0d**

---

<a id="sec-5"></a>
## 五、非功能性设计

### 5.1 性能指标

| 指标 | 目标值 | 测试条件 |
|------|--------|----------|
| MetricsMiddleware 额外延迟 | ≤ 0.5ms (P99) | 单次 `time.time()` + Counter.inc + Histogram.observe |
| `/metrics` 端点响应时间 | ≤ 50ms | 50 个指标系列 |
| Prometheus 抓取开销 | ≤ 100ms | scrape_interval=15s 时单次抓取耗时 |
| Grafana 面板加载 | ≤ 2s | 查询 1h 时间范围数据 |

### 5.2 监控与告警

| 监控项 | 数据源 | 采集频率 | 告警规则 |
|--------|--------|----------|----------|
| 指标端点可用性 | Prometheus `up` 指标 | 15s | `up == 0` 持续 1min → critical |
| Prometheus 抓取成功率 | Prometheus 自身指标 | 15s | 抓取失败率 > 10% → warning |
| Grafana 数据源连通性 | Grafana 健康检查 | 30s | 连通失败 → warning |
| Alertmanager 通知送达率 | 企微 webhook 响应码 | 实时 | 连续 3 次非 200 → critical |

### 5.3 安全

| 层面 | 措施 |
|------|------|
| 端点保护 | `/metrics` 端点不暴露敏感业务数据，仅聚合指标 |
| 网络隔离 | Prometheus/Grafana 仅监听内网地址，不对外暴露 |
| 认证 | Grafana 默认启用登录认证，初始密码通过环境变量注入 |

### 5.4 容量预估

| 指标 | 预估值 | 推算依据 |
|------|--------|----------|
| 指标系列数 | ~50 个 | 5 类指标 × 10 个 label 组合 |
| 每样本大小 | ~2KB | 50 系列 × ~40B/sample |
| 15 天存储量 | ~170MB | 2KB × 4次/min × 60min × 24h × 15d |
| Grafana 并发查询 | ≤ 5 | 本地开发 + 小团队场景 |

---

<a id="sec-6"></a>
## 六、测试策略

### 6.1 测试分层

| 层级 | 覆盖范围 | 工具 |
|------|----------|------|
| 单元测试 | MetricsMiddleware 指标计数正确性、Histogram bucket 分布 | pytest + prometheus_client |
| 集成测试 | `/metrics` 端点输出格式、Prometheus 抓取链路 | pytest + httpx |
| 端到端测试 | docker-compose 全栈：YiAi → Prometheus → Grafana → Alertmanager | docker-compose + curl |
| 压力测试 | MetricsMiddleware 在高 QPS 下的性能开销 | locust / wrk |

### 6.2 关键测试用例

| 场景 | 验证点 |
|------|--------|
| 正常请求计数 | 发起 10 次 GET / → `yiai_requests_total{method="GET", endpoint="/", status="200"}` = 10 |
| 错误请求计数 | 发起 3 次 404 → `yiai_requests_total{status="404"}` = 3 |
| 延迟分布 | 模拟慢请求 (1s) → `yiai_request_duration_seconds_bucket{le="2.0"}` 包含该请求 |
| MetricsMiddleware 性能 | 1000 QPS 下 P99 额外延迟 < 0.5ms |
| Prometheus 抓取 | `curl /metrics` 返回 `text/plain`，`promtool check metrics` 通过 |
| 告警触发 | 手动将 `yiai_requests_total{status="500"}` 推到阈值 → Alertmanager 发送企微通知 |
| 告警恢复 | 指标回落 → Alertmanager 发送 `resolved` 通知 |
| Grafana 导入 | 5 个 JSON dashboard 文件导入后无 `Template variable` 报错 |

---

<a id="sec-7"></a>
## 七、关联与回滚

- 上游：健康检查探针、SSE 背压控制
- 下游：缓存命中率、Agent 工具调用指标
- 回滚：`config.yaml: metrics.enabled = false` 禁用；Prometheus 抓取失败不影响业务

---

## 附录 A. 变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-09-11 | v1.0 | 初始版本：指标定义、Grafana 仪表盘、告警规则、实施步骤 | 陈铭 |
| 2026-09-23 | v1.1 | 补充设计约束、非功能性设计（性能/监控/安全/容量）、测试策略、告警路由、变更记录 | 陈铭 |
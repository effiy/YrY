---
type: okr-goal
id: yiai-q4-001
title: "生产级可观测性与智能运维"
status: planned
period: "2026 Q4"
owner: 陈铭
project: YiAi
project_id: yiai
progress: 10
updated: 2026-09-23
kr1: "全链路 TraceID 透传 — 从 RPC 入口 → Service → MongoDB/Ollama 的端到端追踪，覆盖率从 30% → 100%"
kr1_completion: 5
kr2: "智能告警路由 — 基于错误码/服务/严重级别的分级告警 + 通知偏好中心，告警延迟 5min → <30s"
kr2_completion: 10
kr3: "健康度仪表盘 — Dashboard 健康聚合 API 覆盖所有 18 个路由模块 + 15+ 核心指标"
kr3_completion: 15
kr4: "性能剖析火焰图 — 每个端点的 P50/P95/P99 延迟 + 慢查询自动采样与分析"
kr4_completion: 0
kr5: "自愈恢复机制 — 连接池耗尽/Cursor 泄漏/EventLoop 阻塞的自动检测与恢复"
kr5_completion: 10
metric1_id: "yiai-q4-m01"
metric1_desc: "TraceID 透传覆盖率"
metric1_current: "30%"
metric1_target: "100%"
metric2_id: "yiai-q4-m02"
metric2_desc: "告警延迟 (P95)"
metric2_current: "5min"
metric2_target: "<30s"
metric3_id: "yiai-q4-m03"
metric3_desc: "服务可用性 SLA"
metric3_current: "99.5%"
metric3_target: "99.9%"
related_prds:
  - projects/yiai/prds/2026-Q4/01-需求-生产可观测性.md
  - projects/yiai/prds/2026-09/35-需求-结构化日志.md
  - projects/yiai/prds/2026-09/36-需求-告警路由.md
  - projects/yiai/prds/2026-09/37-需求-性能剖析火焰图.md
  - projects/yiai/prds/2026-09/51-需求-健康度评分卡.md
  - projects/yiai/prds/2026-09/84-需求-Zipkin链路导出.md
  - projects/yiai/prds/2026-09/85-需求-系统资源监控告警.md
  - projects/yiai/prds/2026-09/93-需求-自愈恢复机制.md
  - projects/yiai/prds/2026-09/106-需求-监控与告警体系.md
  - projects/yiai/prds/2026-09/113-需求-全链路TraceID透传.md
---

# 生产级可观测性与智能运维

> Q4 核心运维目标。在 Q3 稳定性修复的基础上，建立完整的可观测性体系——从日志、指标、追踪三大支柱覆盖所有 18 个路由模块，实现智能告警与自愈恢复，将服务可用性从 99.5% 提升至 99.9%。

---

## 背景

Q3 完成了四轨稳定性修复——RAG 增量索引、MongoDB 连接管理、Agent 超时保护、RPC 契约校验——将 YiAi 从"开发可用"提升至"功能可靠"。但可观测性仍处于初级阶段，四个结构性缺口制约着生产化进程：

**日志不可检索**：当前日志为纯文本输出到 `logs/app.log`，无结构化字段、无 TraceID 关联、无级别过滤。排查一个 RPC 调用慢的问题需要在 200MB+ 日志文件中 grep 相关行，平均排查时间 >15min。

**告警依赖人工**：无自动化告警机制。服务异常（连接池耗尽、LLM 调用超时、RAG 索引失败）需要开发者主动查看日志或用户反馈才能发现。Q3 期间因 YAML 配置键名冲突导致 `config.yaml` 部分配置被覆盖，问题在代码合入 3 天后才被发现。

**性能瓶颈不可见**：每个端点的延迟分布（P50/P95/P99）无采集。Ollama 推理慢（P99 >28s）、MongoDB 慢聚合（>10s）等瓶颈仅通过用户反馈"聊天响应慢"间接感知，无法量化。

**故障恢复依赖重启**：连接池耗尽、Cursor 泄漏、EventLoop 阻塞等已知故障模式无自动恢复机制。当前 SOP 是：用户反馈 → 开发者登录 → 查看日志 → 重启服务。平均恢复时间（MTTR）>10min。

Q4 需要将运维从"被动响应"升级到"主动发现 + 自动恢复"，建立生产级服务的可观测性基线。

---

## 季度演进

### 十月 — 基础设施搭建

十月聚焦可观测性三大支柱的基础设施：

| 支柱 | 动作 | 交付物 |
|------|------|--------|
| 日志 | 结构化 JSON 日志 + TraceID 注入 + 日志级别动态调整 | `src/shared/logging.py` 重构 |
| 指标 | 端点延迟直方图 + MongoDB 连接池指标 + Ollama 推理延迟 | `src/shared/metrics.py`（新增） |
| 追踪 | TraceID 生成/传播/导出 + Zipkin 兼容格式 | `src/shared/tracing.py`（新增） |

关键里程碑：10 月底前完成 TraceID 透传覆盖所有 RPC 端点 + MongoDB/Ollama 两个外部依赖。

### 十一月 — 告警与仪表盘

在基础设施就绪后，建立告警规则引擎和健康度聚合：

- **告警路由**：错误码 → 严重级别 → 通知渠道（企微/邮件/Webhook）的分级路由，支持通知偏好中心和静默窗口
- **健康度仪表盘**：Dashboard API（`src/server/routes/dashboard/`）聚合连接池利用率、RAG 索引延迟、Agent 任务成功率、LLM 调用延迟、SSE 连接数等 15+ 核心指标
- **性能剖析**：基于延迟直方图的火焰图生成，慢查询（>100ms MongoDB，>5s LLM）自动采样

### 十二月 — 自愈与闭园

- **自愈恢复**：连接池耗尽自动扩容（`minPoolSize` 动态调整）、Cursor 泄漏检测与回收（定时扫描 `db.serverStatus().metrics.cursor.open`）、EventLoop 阻塞检测（`asyncio` 任务延迟 >1s 告警）
- **Zipkin 链路导出**：完整 Trace → Zipkin JSON 格式导出，支持本地 Jaeger 可视化和远端 Zipkin 聚合
- **季度回顾**：SLA 达标率审核、告警规则有效性调优、性能基线更新

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | 全链路 TraceID 透传 — 100% RPC 端点 + MongoDB/Ollama | 5% |
| KR2 | 智能告警路由 — 分级告警 + 5min → <30s | 10% |
| KR3 | 健康度仪表盘 — 18 模块 + 15+ 指标 | 15% |
| KR4 | 性能剖析火焰图 — P50/P95/P99 + 慢查询采样 | 0% |
| KR5 | 自愈恢复 — 连接池/Cursor/EventLoop 自动检测与恢复 | 10% |

---

## KR1 — 全链路 TraceID 透传

### 现状

当前部分端点（RPC 路由、chat_service）通过 `contextvars` 传播 `request_id`，但存在三个缺口：

1. **覆盖不全**：30% 的端点（RSS、文件管理、MCP、模块执行）未生成 request_id
2. **传播断链**：MongoDB 操作和 Ollama HTTP 调用不携带 TraceID——`async for cursor` 和 `httpx.AsyncClient.post()` 的 Span 信息丢失
3. **格式不标准**：`request_id` 为 `uuid4` 字符串，不兼容 W3C TraceContext 或 Zipkin B3 格式

### 目标状态

```
RPC 入口 (TraceID 生成)
  → Middleware (Span: request_parsing)
  → Service Layer (Span: business_logic)
    → MongoDB (Span: find/aggregate, 携带 traceparent)
    → Ollama (Span: llm_inference, 携带 traceparent)
  → Response (Span: serialization + TraceID 回传 response header)
```

### 方案

**TraceID 生成与传播**（`src/shared/tracing.py`）：
- 使用 OpenTelemetry SDK（`opentelemetry-api` + `opentelemetry-sdk`）
- 格式：W3C TraceContext（`traceparent: 00-{trace_id}-{span_id}-01`）
- 传播：通过 `contextvars.ContextVar` 在当前请求的协程树中自动传播
- MongoDB：在 `motor.motor_asyncio` 的 command 监听器中注入 `comment` 字段携带 TraceID
- Ollama：通过 `httpx.AsyncClient` 的 `event_hooks` 注入 `traceparent` 请求头

**Span 粒度**：

| 层级 | Span | 关键属性 |
|------|------|---------|
| HTTP 入口 | `http_request` | method, path, status_code, duration_ms |
| RPC 分发 | `rpc_dispatch` | module_name, method_name, param_count |
| Service 编排 | `service_call` | service_name, method |
| MongoDB | `mongodb_operation` | collection, operation (find/aggregate/insert/update), filter_shape |
| Ollama | `llm_inference` | model, prompt_tokens, completion_tokens, duration_ms |

**Zipkin 导出**（`src/shared/tracing.py`）：
- `ZipkinExporter` → 本地 Jaeger（`http://localhost:9411`）或远端 Zipkin
- 可选：通过 `config.yaml` 的 `tracing.exporter` 配置（`zipkin` / `jaeger` / `console` / `none`）
- 采样策略：生产环境 10% 采样，开发环境 100% 采样（通过 `tracing.sample_rate` 配置）

### 验证

- 发送 `POST /` RPC 请求 → response header 含 `X-Trace-Id` → Jaeger UI 可见完整调用链（HTTP → RPC → Service → MongoDB）
- 关闭 MongoDB → 调用查询接口 → Span 状态标记为 `error` + `exception.escaped: true`
- 100% 端点覆盖验证：`grep -r "TraceID\|trace_id\|tracing" src/server/routes/` 覆盖所有 18 个路由文件

---

## KR2 — 智能告警路由

### 现状

零自动化告警。异常感知路径：用户反馈 → 开发者检查日志 → 手动定位。Q3 期间 3 次生产事件的平均感知时间 >2h。

### 目标状态

```
错误事件发生
  → ErrorCode 分类（1001~9999）
  → 严重级别映射（critical/major/minor/trivial）
  → 通知偏好中心（用户订阅 + 静默窗口）
  → 多渠道分发（企微 Markdown 卡片 / 邮件 / Webhook / YiVad 通知中心）
```

### 方案

**告警规则引擎**（`src/services/alert/alert_service.py`）：

| 规则 | 触发条件 | 级别 | 渠道 | 冷却 |
|------|---------|------|------|------|
| MongoDB 连接池 >80% | 连续 3 次采样 | critical | 企微 + 邮件 | 5min |
| LLM 超时率 >10% | 5min 窗口内 | major | 企微 | 10min |
| Agent 任务失败率 >20% | 10min 窗口内 | major | 企微 + Webhook | 15min |
| RAG 索引失败 | 即时触发 | major | 企微 | 30min |
| Cursor 泄漏检测 | 游标数持续增长 10min+ | critical | 企微 + 邮件 | 5min |
| EventLoop 阻塞 >1s | 即时触发 | critical | 企微 | 1min |
| 未知 RPC 参数 | 即时触发 | minor | YiVad 通知 | 1h |

**通知偏好中心**：每个用户可配置通知渠道开关（企微/邮件/Webhook）、静默窗口（22:00-08:00 仅 critical）、聚合模式（5min 内同类型合并为一条）。

**企微消息格式**：Markdown 卡片，含告警级别色标（critical=红/major=橙/minor=黄）、错误码、触发值 vs 阈值、TraceID 链接（可跳转 Jaeger）。

### 验证

- 人为触发连接池耗尽（设置 `maxPoolSize=1`）→ 企微收到 critical 告警卡片（延迟 <30s）
- 同一告警 5min 内重复触发 3 次 → 合并为一条（"过去 5min 内重复 3 次"）
- 静默窗口（22:00-08:00）→ minor/major 告警不推送，critical 仍推送

---

## KR3 — 健康度仪表盘

### 现状

`/health` 端点仅返回 `{"status": "ok"}`。`src/server/routes/dashboard/` 下的聚合 API 覆盖了部分指标（连接池、会话数、Bug 数），但指标零散、无历史趋势、无评分卡。

### 目标

Dashboard API 聚合 15+ 核心指标，每 60s 快照一次，支持 24h/7d/30d 趋势查询。健康度评分卡（0-100 综合分）直观展示服务整体状态。

### 核心指标

| 类别 | 指标 | 采集方式 | 更新频率 |
|------|------|---------|---------|
| 连接池 | 活跃/可用/总连接数、利用率 %、等待队列长度 | `db.serverStatus().connections` | 15s |
| 延迟 | P50/P95/P99（全局 + 按端点） | `metrics` histogram | 实时 |
| LLM | 调用次数、成功率、P99 延迟、Token 用量 | `chat_service` stats collector | 实时 |
| RAG | 索引成功率、检索延迟、文档数 | `indexer` + `engine` stats | 60s |
| Agent | 任务完成率、平均轮次、工具调用分布 | `agent` loop stats | 实时 |
| SSE | 活跃连接数、断开率、错误率 | SSE connection tracker | 实时 |
| 系统 | CPU/Memory/Disk（通过 `psutil`）| system stats collector | 30s |

**健康度评分卡**：

```
总分 = ∑(维度分 × 权重)
  连接池健康 (25%)  = 利用率 <60%→100, <80%→70, >90%→30
  延迟健康 (25%)    = P95 <1s→100, <3s→70, >5s→30
  LLM 健康 (20%)    = 成功率 >99%→100, >95%→70, <90%→30
  RAG 健康 (15%)    = 索引成功率 >99%→100
  Agent 健康 (15%)  = 任务完成率 >85%→100
```

### 验证

- Dashboard API 返回 15+ 指标均有当前值 + 时间戳
- 健康度评分 <60 → 企微推送每日健康报告（含评分曲线）
- 指标快照存储 MongoDB `dashboard_snapshots` 集合，30d 历史可查询

---

## KR4 — 性能剖析火焰图

### 现状

无端点延迟分布数据。性能问题只能通过"聊天响应慢"等定性反馈感知，缺乏量化依据。不知哪个端点是瓶颈、哪个操作最耗时。

### 方案

**延迟采集**（`src/shared/metrics.py`）：
- 每个端点的请求延迟通过 `PrometheusHistogram` 采集，bucket: `[10ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s, 30s]`
- 外部依赖延迟（MongoDB/Ollama）通过 Span duration 采集
- 慢操作自动采样：MongoDB `find/aggregate` >100ms 记录完整 `command` + `duration`；LLM 调用 >5s 记录 `model` + `prompt_tokens` + `completion_tokens`

**火焰图生成**：
- 基于采集的 Span 数据（TraceID → Span 树），按端点聚合生成调用栈火焰图
- 输出格式：Speedscope JSON（兼容 `speedscope.app` 和 Jaeger 内嵌视图）

**慢查询分析**：
- MongoDB 慢操作日志写入 `slow_operations` 集合
- Dashboard 提供 Top-10 慢端点、Top-10 慢查询排行榜
- 定时分析（daily）：自动检测新增慢查询模式并企微推送建议（如"建议为 `sessions.tags` 添加索引"）

### 验证

- 人为插入慢聚合（`$group` on 无索引字段）→ Dashboard 出现该查询在 Top-10 榜单
- 调用 100 次不同端点 → P50/P95/P99 延迟数据可查询且分布合理

---

## KR5 — 自愈恢复机制

### 现状

三种已知故障模式依赖人工重启恢复：

| 故障 | 检测方式 | 修复方式 | MTTR |
|------|---------|---------|------|
| 连接池耗尽 | 用户反馈 | 重启服务 | >10min |
| Cursor 泄漏 | MongoDB 服务告警 | 重启服务 | >10min |
| EventLoop 阻塞 | 无检测 | 无 | ∞ |

### 方案

**连接池自愈**：
- 检测：`asyncio.Task` 每 15s 采样 `db.serverStatus().connections`，利用率 >90% 持续 60s 触发自愈
- 恢复：动态提升 `minPoolSize`（当前值 × 1.5，上限 50）+ 对积压请求返回 503（而非排队耗尽）
- 恢复通知：企微推送"连接池自愈完成：minPoolSize 10→15，当前利用率 45%"

**Cursor 泄漏自愈**：
- 检测：定时扫描 `db.serverStatus().metrics.cursor.open.total`，持续增长 10min+ 触发
- 恢复：`db.killCursors()` 批量关闭空闲超过 120s 的 Cursor + 企微告警
- 根因修复：固定周期性清理 + 向开发团队报告泄漏来源（通过 comment 中的 TraceID 反查）

**EventLoop 阻塞检测**（`src/shared/monitor.py`）：
- 实现：`asyncio.Task` 心跳任务每 1s 更新 `last_heartbeat`，监控任务每 5s 检查 `now - last_heartbeat > 1s`
- 检测到阻塞：采样当前 `asyncio.all_tasks()` 堆栈 → 写入 `eventloop_blocks` 集合 → 企微告警（含最慢任务堆栈）
- 恢复：阻塞 >30s 触发 `os.kill(os.getpid(), signal.SIGTERM)` → uvicorn 自动重启（需配合 `supervisor` 或 `systemd` 的 `Restart=always`）

### 验证

- 人为耗尽连接池（maxPoolSize=1 + 20 并发请求）→ 60s 内企微收到连接池告警 → 服务返回 503 而非超时 → 连接池自动扩容
- 模拟 Cursor 泄漏（创建 50 个未关闭的 cursor）→ 10min 内检测到持续增长 → 批量 kill 空闲 cursor → 企微推送
- EventLoop 阻塞注入（`asyncio.sleep(5)` 在事件循环中）→ 5s 内检测 → 企微推送堆栈信息

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| OpenTelemetry SDK 引入性能开销 >5% | 中 | 中 | 采样率可控（生产 10%），console exporter 仅开发环境 |
| 告警误报导致告警疲劳 | 高 | 中 | 冷却窗口 + 聚合去重 + 静默时段 + 每季度告警规则评审 |
| EventLoop 自愈触发误杀 | 低 | 高 | 心跳检测容差（连续 3 次检测到阻塞才触发），先告警后恢复 |
| Zipkin/Jaeger 未部署导致 Trace 无法可视化 | 中 | 低 | console exporter 作为 fallback，TraceID 始终在 response header |
| 指标采集增加 MongoDB 负载 | 低 | 低 | serverStatus 每 15s 一次（极低开销），Dashboard 快照异步写入 |

---

## 交付里程碑

| 月份 | 里程碑 | 关键交付 |
|------|--------|---------|
| 10月第1周 | TraceID 透传核心实现 | `tracing.py` + RPC 中间件注入 + MongoDB command listener |
| 10月第3周 | 结构化日志 + 延迟直方图 | `logging.py` JSON 格式 + `metrics.py` PrometheusHistogram |
| 10月第4周 | TraceID 覆盖 100% 端点 | 所有 18 个路由文件集成，Jaeger 端到端链路可视 |
| 11月第2周 | 告警规则引擎上线 | `alert_service.py` + 企微/邮件/Webhook 三渠道 |
| 11月第3周 | 健康度仪表盘 v1 | Dashboard API 15 指标 + 评分卡 + 24h 趋势 |
| 11月第4周 | 性能剖析火焰图 | 延迟分布采集 + Speedscope 格式导出 |
| 12月第1周 | 自愈 v1（连接池 + Cursor）| 连接池自动扩容 + Cursor 泄漏回收 |
| 12月第2周 | EventLoop 阻塞检测 | 心跳检测 + 堆栈采样 + 自动重启 |
| 12月第3周 | Zipkin 链路导出 + Jaeger 集成 | 完整 Trace → Zipkin JSON 格式 |
| 12月第4周 | 季度回顾 + 规则调优 | SLA 审核、告警有效性评估、性能基线更新 |

---

## 影响

| 维度 | Q3 现状 | Q4 目标 |
|------|--------|--------|
| TraceID 透传覆盖率 | 30% 端点 | 100% 端点 + MongoDB + Ollama |
| 告警延迟 (P95) | 人工感知 >2h | 自动告警 <30s |
| 服务可用性 SLA | 99.5% (MTTR >10min) | 99.9% (MTTR <2min) |
| 性能瓶颈可见性 | 无量化数据 | P50/P95/P99 + 火焰图 |
| 故障恢复方式 | 手动重启 | 自动检测 + 自愈恢复 |
| 日志可检索性 | 纯文本 grep | 结构化 JSON + TraceID 关联 |

---

## 未竟事项（Q1 2027 展望）

| 事项 | 原因 | Q1 归属 |
|------|------|---------|
| 分布式追踪跨服务（YiVad SSR 端） | YiVad 前端暂无 Trace 生成 | 前端可观测性专项 |
| ML-based 异常检测 | 需要告警数据积累（至少 3 个月） | AI + 运维交叉项目 |
| 自动化压测 + 容量规划 | 依赖性能基线数据积累 | SRE 成熟度专项 |
| 多实例 Trace 聚合（K8s 部署后） | 当前单实例部署 | K8s 迁移项目 |
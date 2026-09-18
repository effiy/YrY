---
doc_type: module
prd_task_id: "YA-09-39"
title: "YA-09-39: 监控与告警体系 — Prometheus + Grafana + 企微通知 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "106-需求-监控与告警体系.md"
source_okr: [yiai-001]
---

# YA-09-39: 监控与告警体系 — Prometheus + Grafana + 企微通知 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[106-需求-监控与告警体系.md](../../prds/2026-09/106-需求-监控与告警体系.md)
> 需求编号：YA-09-39 · 优先级：P1 · 人天：2.0d · 状态：已完成

---

<a id="sec-1"></a>
## 一、方案

`prometheus_client` 库暴露 `/metrics` 端点，Grafana 可视化，企微机器人告警。

### 核心指标

| 指标 | 类型 | 说明 |
|------|------|------|
| `http_requests_total` | Counter | 按 method/path/status 的请求数 |
| `http_request_duration_seconds` | Histogram | P50/P95/P99 延迟 |
| `mongodb_connections_active` | Gauge | 活跃连接数 |
| `ollama_inference_duration_seconds` | Histogram | 推理耗时 |
| `sse_connections_active` | Gauge | 活跃 SSE 连接数 |
| `cache_hit_ratio` | Gauge | 缓存命中率 |

### 告警规则

```yaml
groups:
  - name: yi-ai
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        annotations: { summary: "错误率 > 5%" }
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
        annotations: { summary: "P95 延迟 > 2s" }
```

### 企微通知

告警触发 → `send_message(alert_summary)` → 群机器人推送。

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | prometheus_client + `/metrics` 端点 | Prometheus 可抓取指标 | 0.75 |
| 2 | Grafana 仪表盘 + 告警规则 | 仪表盘可视化 | 0.75 |
| 3 | 企微通知集成 + 测试 | 告警触发 > 企微收到消息 | 0.5 |

**合计：2.0d**。

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

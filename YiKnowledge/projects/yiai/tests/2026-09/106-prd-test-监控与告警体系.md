---

doc_type: test
title: "YA-09-101: 监控与告警体系 — Prometheus 指标 + Grafana 仪表盘 + 企微告警 — 测试规格"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-101"
source_prds: ["106-需求-监控与告警体系"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-101: 监控与告警体系 — 测试规格

> 来源 PRD：[106-需求-监控与告警体系](../../prds/2026-09/106-需求-监控与告警体系)
> 需求编号：YA-09-101 · 优先级：P1 · 人天：2.0d

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 一、测试范围与策略

### 1.1 测试范围

| 模块 | 测试重点 | 层级 |
|------|---------|------|
| Prometheus 指标暴露 | `/metrics` 端点、Counter/Gauge/Histogram 注册 | 单元 |
| Grafana 仪表盘 | JSON 模型导入、查询验证、面板渲染 | 集成 |
| 企微告警 | AlertManager 规则 -> 企微机器人 Webhook | 集成 |
| 健康检查端点 | `/health` 端点含依赖状态（MongoDB/Ollama） | 单元 |
| 关键指标采集 | 请求延迟/错误率/吞吐量/MongoDB 连接池 | 单元 |

### 1.2 测试策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest + prometheus_client | 指标注册、标签正确性、Counter 递增 | 60% |
| 集成测试 | pytest + httpx | `/metrics` 端点、`/health` 端点、告警触发 | 40% |

---

## 二、测试数据与前置条件

| 组件 | 要求 |
|------|------|
| Prometheus | 本地实例 `localhost:9090` 或 mock |
| 测试指标 | `http_requests_total`, `http_request_duration_seconds`, `mongodb_pool_size` |
| 企微 Webhook | 测试用机器人 key |
| Grafana JSON | `tests/fixtures/monitoring/dashboard.json` |

---

## 三、测试用例

### 3.1 核心功能验证

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-MT-01 | `/metrics` 端点可访问 | `GET /metrics` | 返回 200，Content-Type: text/plain | P0 |
| UT-MT-02 | 请求计数器递增 | 10 次 RPC 请求 | `http_requests_total{status="2xx"}` = 10 | P0 |
| UT-MT-03 | 请求延迟直方图 | 100 次请求不同延迟 | `http_request_duration_seconds_bucket` 正确分布 | P0 |
| UT-MT-04 | 错误率指标 | 5 次 5xx 错误 + 95 次成功 | `http_requests_total{status="5xx"}` = 5 | P0 |
| UT-MT-05 | `/health` 全健康 | 所有依赖正常 | 返回 200，`{mongodb: ok, ollama: ok}` | P0 |
| UT-MT-06 | `/health` 依赖异常 | MongoDB 不可用 | 返回 503，`{mongodb: error, ollama: ok}` | P1 |
| UT-MT-07 | MongoDB 连接池指标 | 活跃连接数 | `mongodb_active_connections` 正确反映 | P1 |
| UT-MT-08 | 企微告警发送 | 错误率 > 5% 持续 5min | AlertManager 触发 -> Webhook -> 企微消息 | P1 |
| UT-MT-09 | 仪表盘 JSON 有效 | Grafana dashboard JSON | 可被 Grafana 导入，面板不报错 | P1 |
| UT-MT-10 | 指标标签正确 | `method="POST"`, `path="/rpc"` | 每个指标含 method/path/status 标签 | P1 |

---

## 四、边界与异常测试

### 4.1 边界场景

| 编号 | 场景 | 输入 | 预期 |
|------|------|------|------|
| BE-01 | 极高 QPS 指标采集 | 10000 req/s 时指标采集 | 指标采集不增加 > 1% 延迟 |
| BE-02 | 空请求无指标 | 服务启动后 0 请求 | `/metrics` 返回所有指标但计数为 0 |
| BE-03 | 指标端点鉴权 | `/metrics` 被外部访问 | 仅内网 IP 或认证用户可访问 |
| BE-04 | 企微 Webhook 超时 | Webhook 请求 > 5s | 告警不丢失，重试 3 次后记录错误 |

### 4.2 异常场景

| 编号 | 场景 | 触发条件 | 预期 |
|------|------|---------|------|
| EX-01 | Prometheus client 未安装 | `import prometheus_client` 失败 | 降级：不暴露指标但不影响服务 |
| EX-02 | 企微 Webhook 不可达 | 网络故障 | 告警超时后降级为日志记录 |
| EX-03 | 指标端点过大 | 1000+ 个指标注册 | `/metrics` 响应大小 < 100KB |

---

## 五、回归测试

| 编号 | 回归场景 | 验证方法 |
|------|---------|---------|
| RG-01 | 监控不影响业务延迟 | 启用指标采集后 P99 延迟增加 < 1% |
| RG-02 | Grafana 面板升级后兼容 | 新版 Grafana 导入旧 dashboard JSON 无误 |

---

## 六、可追溯性矩阵

| 需求点 | 测试用例 | 覆盖状态 |
|--------|---------|---------|
| `/metrics` 端点 | UT-MT-01 | 已覆盖 |
| 请求计数/延迟/错误 | UT-MT-02 至 UT-MT-04 | 已覆盖 |
| 健康检查 | UT-MT-05, UT-MT-06 | 已覆盖 |
| MongoDB 指标 | UT-MT-07 | 已覆盖 |
| 企微告警 | UT-MT-08 | 已覆盖 |
| Grafana 仪表盘 | UT-MT-09 | 已覆盖 |

---

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 真实 Grafana 部署验证 | 需 Grafana 实例 | 生产部署后补充 |
| 高基数标签影响 | 每个 session_id 作为标签 | 限制标签基数 |
| 长时间运行指标准确性 | Counter 重置处理 | 7 天稳定性测试 |

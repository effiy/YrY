---

doc_type: test
title: "YA-09-87: 服务端请求流量录制与回放 — 生产流量镜像用于测试环境压力测试 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-87"
source_prds: ["91-需求-流量录制与回放"]
source_modules: ["91-prd-task-流量录制与回放"]
source_okr: [yiai-001]

type: test
---

# YA-09-87: 流量录制与回放 — 测试规格

> 来源 PRD：[91-需求-流量录制与回放.md](../../prds/2026-09/91-需求-流量录制与回放.md)
> 需求编号：YA-09-87 · 优先级：P2 · 人天：0.5d

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 一、测试范围与策略

### 1.1 测试范围

| 模块 | 测试重点 | 层级 |
|------|---------|------|
| TrafficRecorder 中间件 | 采样判断、脱敏逻辑、缓冲区批量写入 | 单元 |
| TrafficRecorderMiddleware | FastAPI 集成、请求响应拦截 | 集成 |
| TrafficReplayer | 回放执行、性能对比、劣化检测 | 单元 |
| 回放 CI 集成 | `pytest --replay-traffic` 端到端流程 | 集成 |
| TTL 索引 | MongoDB `traffic_records` 30 天自动清理 | 集成 |

### 1.2 测试策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest + unittest.mock | 采样率、脱敏、指纹计算、百分位统计 | 50% |
| 集成测试 | pytest + httpx + mongomock | 录制写入、回放对比、CI 标志 | 30% |
| 性能测试 | pytest | 录制开销 < 0.5ms P99、回放吞吐 > 100 req/s | 20% |

---

## 二、测试数据与前置条件

| 组件 | 要求 |
|------|------|
| MongoDB | 测试数据库含 `traffic_records` 集合 |
| 环境变量 | `TRAFFIC_SAMPLE_RATE` 可设 0.01/1.0/0 |
| 测试 fixture | 100 条模拟 RPC 请求（含 method/path/body/duration_ms） |
| 敏感字段样本 | Authorization/Bearer token、password 字段 |

---

## 三、测试用例

### 3.1 功能验证（8 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-TR-01 | 1% 采样命中 | 设 `TRAFFIC_SAMPLE_RATE=1.0`，发送 1 个请求 | `record()` 被调用，生成 record_id | P0 |
| UT-TR-02 | 采样未命中 | 设 `TRAFFIC_SAMPLE_RATE=0`，发送 100 个请求 | 0 条记录写入，无异常 | P0 |
| UT-TR-03 | 请求头部脱敏 | 请求含 `Authorization: Bearer abc123` | 录制记录中 `headers.authorization = "***REDACTED***"` | P0 |
| UT-TR-04 | 请求体递归脱敏 | body 含嵌套 `{"user":{"password":"secret"}}` | 嵌套层 `password` 也被脱敏 | P0 |
| UT-TR-05 | 邮箱/IP 脱敏 | body 含 `email: "real@corp.com"` `ip: "10.0.0.1"` | 替换为 `user@example.com` 和 `0.0.0.0` | P1 |
| UT-TR-06 | 缓冲区批量写入 | 缓冲区累积 100 条 | 自动触发 `_flush_buffer()`，`insert_many` 被调用 | P1 |
| UT-TR-07 | 回放单条记录 | 1 条录制数据执行 `replay_one` | 返回 `{success, recorded_duration_ms, replay_duration_ms}` | P0 |
| UT-TR-08 | 回放性能对比 | 100 条录制数据回放 | 报告含 P50/P95/P99 对比和劣化百分比 | P0 |

### 3.2 性能劣化检测（4 条）

| 编号 | 用例 | 步骤 | 预期 | 优先级 |
|------|------|------|------|--------|
| UT-TP-01 | P50 劣化未超阈值 | 回放 P50 劣化 15%（<20%） | `passed = True` | P0 |
| UT-TP-02 | P50 劣化超阈值 | 回放 P50 劣化 25%（>20%） | `passed = False`，报告含 `p50_pct=25.0` | P0 |
| UT-TP-03 | P99 劣化超阈值 | 回放 P99 劣化 35%（>30%） | `passed = False` | P1 |
| UT-TP-04 | 部分回放失败 | 100 条中 5 条失败 | `success=95, failed=5`，劣化计算仅用成功结果 | P1 |

---

## 四、边界与异常测试

### 4.1 边界场景（4 条）

| 编号 | 场景 | 输入 | 预期 |
|------|------|------|------|
| BE-01 | 空请求体 | body 为 None | 不报错，`request_body: null` |
| BE-02 | 超大请求体 | 1MB JSON body | 脱敏递归深度不超过 10 层，不超时 |
| BE-03 | 无敏感字段 | 普通查询请求 | 所有字段原样保留 |
| BE-04 | 录制数据为空 | `traffic_records` 集合为空时回放 | 返回错误，`passed=False` |

### 4.2 异常场景（3 条）

| 编号 | 场景 | 触发条件 | 预期 |
|------|------|---------|------|
| EX-01 | MongoDB 写入失败 | 断连时批量写入 | 捕获异常，记录日志，不影响请求响应 |
| EX-02 | 回放目标不可达 | YiAi 未启动时 `replay()` | `_replay_one` 返回 `success=False, error=str()` |
| EX-03 | TTL 自动清理 | 文档 `timestamp` 超过 30 天 | MongoDB 自动删除（需等待 TTL 周期） |

---

## 五、回归测试（2 条）

| 编号 | 回归场景 | 验证方法 |
|------|---------|---------|
| RG-01 | 录制中间件不影响正常请求 | 启用录制后 P50/P99 延迟无显著增加（<0.5ms） |
| RG-02 | 环境变量关闭录制 | `TRAFFIC_SAMPLE_RATE=0` 后中间件完全跳过，无任何副作用 |

---

## 六、可追溯性矩阵

| 需求点 | 测试用例 | 覆盖状态 |
|--------|---------|---------|
| 1% 采样录制 | UT-TR-01, UT-TR-02 | 已覆盖 |
| 敏感数据脱敏 | UT-TR-03, UT-TR-04, UT-TR-05 | 已覆盖 |
| 缓冲区批量写入 | UT-TR-06 | 已覆盖 |
| 流量回放 | UT-TR-07, UT-TR-08 | 已覆盖 |
| 劣化检测 | UT-TP-01 至 UT-TP-04 | 已覆盖 |
| 异常降级 | EX-01, EX-02 | 已覆盖 |

---

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 生产环境真实录制 | 需生产环境运行后采样 | 部署后补充在线验证 |
| 长时间 TTL 测试 | 30 天 TTL 无法在 CI 中验证 | 使用短 TTL（1 分钟）加速测试 |
| 多实例回放 | 当前为单实例 | 未来分布式部署时补充 |
| 统计数据分布验证 | 1% 采样能否代表生产分布 | 需大量录制数据后做统计学检验 |
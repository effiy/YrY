---

doc_type: test
prd_test_id: "YA-09-100"
title: "YA-09-100: 翻译分析增强 — 供应商健康监控 + 分析趋势 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate: 0.25
source_task: "100-prd-task-翻译分析增强.md"
source_prds: ["100-需求-翻译分析增强"]
tags: [test, translation, analytics, monitoring, edge-cases]

type: test
---

# YA-09-100: 翻译分析增强 — 测试方案

> **版本**：v2.0 · **人天**：0.25d · **状态**：已完成

---

## 1. 测试范围

| 维度 | 说明 |
|------|------|
| 模块 | `services/translation/provider_health.py` + `translate_service.py` |
| 测试类型 | 单元测试 + 集成测试 + 边界测试 |
| 数据依赖 | MongoDB `translation_records`、`translation_memory`、`translation_feedback` |

---

## 2. 功能测试

### TC-01：provider_health 健康状态判定

| # | 输入条件 | 期望 status |
|---|---------|------------|
| 1.1 | 成功率 = 100% | `healthy` |
| 1.2 | 成功率 = 95% | `healthy`（边界：≥ 95%） |
| 1.3 | 成功率 = 94.9% | `degraded`（边界：< 95%） |
| 1.4 | 成功率 = 70% | `degraded`（边界：≥ 70%） |
| 1.5 | 成功率 = 69.9% | `down`（边界：< 70%） |
| 1.6 | 成功率为 0%（全部失败） | `down`，`failed = total` |
| 1.7 | 无调用记录 | `providers: {}` |

### TC-02：hourly_trend 时间序列

| # | 场景 | 期望 |
|---|------|------|
| 2.1 | `days=1` | 返回 ≤ 24 条记录 |
| 2.2 | `days=7` | 返回 ≤ 168 条记录，按 `hour` 升序 |
| 2.3 | 无数据 | 返回 `[]` |
| 2.4 | `hour` 字段格式 | `YYYY-MM-DDTHH`（如 `2026-09-23T14`） |

### TC-03：top_language_pairs 排序

| # | 场景 | 期望 |
|---|------|------|
| 3.1 | `limit=5` | 返回 ≤ 5 条 |
| 3.2 | `limit=100` | 返回实际数量（不超过 100） |
| 3.3 | 排序验证 | 按 `count` 降序 |
| 3.4 | 字段完整性 | 每条含 `from`、`to`、`count`、`total_chars` |

---

## 3. 边界与异常测试

### TC-10：空数据库

| # | 接口 | 期望 |
|---|------|------|
| 10.1 | `provider_health()` | `{period_hours: 24, providers: {}, memory_entries: 0, feedback: {good: 0, bad: 0}}` |
| 10.2 | `hourly_trend()` | `[]` |
| 10.3 | `provider_breakdown()` | `[]` |
| 10.4 | `top_language_pairs()` | `[]` |

### TC-11：MongoDB 不可达

| # | 场景 | 期望 |
|---|------|------|
| 11.1 | MongoDB 连接失败 | 不抛异常，返回空结果 |
| 11.2 | `db.initialize()` 超时 | 函数内 try/except 捕获 |
| 11.3 | 日志记录 | `logger.warning` 输出错误信息 |

### TC-12：大数据量

| # | 场景 | 目标 |
|---|------|------|
| 12.1 | 10 万条 `translation_records` | `provider_health` < 200ms |
| 12.2 | 10 万条，`$unwind` 展开 | `provider_breakdown` < 300ms |
| 12.3 | 100 万条 | 考虑后续添加索引或限制时间窗口 |

### TC-13：参数边界

| # | 输入 | 期望 |
|---|------|------|
| 13.1 | `hours=0` | 不抛异常，返回最近 0 小时数据（空） |
| 13.2 | `hours=-1` | 不抛异常 |
| 13.3 | `days=0` | 不抛异常 |
| 13.4 | `limit=0` | 不抛异常，返回 `[]` |

---

## 4. 回归测试

| # | 模块 | 验证内容 |
|---|------|---------|
| R1 | `translate_service.translate` | 原有翻译功能不受影响 |
| R2 | `translate_service.translate_stream` | SSE 流式翻译正常 |
| R3 | `translate_service.translation_memory_search` | 记忆搜索正常 |
| R4 | `translate_service.translation_feedback` | 反馈提交正常 |
| R5 | `python -m pytest tests/ -q` | 547 passed（无回归） |

---

## 5. 性能基准

| 接口 | 目标 | 验证方法 |
|------|------|---------|
| `provider_health(24h)` | < 100ms | MongoDB `explain("executionStats")` |
| `hourly_trend(7d)` | < 200ms | 同上 |
| `provider_breakdown(30d)` | < 300ms | 同上 |
| 4 接口串行调用 | < 1s | `asyncio.gather` timing |

---

## 6. 安全测试

| # | 场景 | 期望 |
|---|------|------|
| S1 | RPC 调用无认证 | 认证中间件拦截（若启用） |
| S2 | SQL 注入尝试（MongoDB） | 聚合管道参数化，不受注入影响 |
| S3 | DoS（大量并发请求） | 后续加 rate limiting |

## 7. 测试命令

```bash
cd YiAi && python -m pytest tests/ -q
```
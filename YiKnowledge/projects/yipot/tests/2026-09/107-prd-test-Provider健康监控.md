---

doc_type: test
title: "Provider 健康监控 + 趋势分析 — 测试方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["53-prd-YiAi后端集成"]
source_modules: ["88-prd-task-Provider健康监控"]

type: test
---

# Provider 健康监控 + 趋势分析 — 测试方案

> 来源模块：[88-prd-task-Provider健康监控](../../devs/2026-09/88-prd-task-Provider健康监控.md)

---

## TC-HL-001: provider_health 基本查询

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `provider_health` → `hours: 24` | HTTP 200 |
| 2 | 检查 `providers` | 对象，包含各 Provider 的 health 数据 |
| 3 | 每个 Provider 有 `total, success, failed, success_rate, status` | 完整字段 |
| 4 | `memory_entries` | 整数（≥ 0） |
| 5 | `feedback` | `{ good: int, bad: int }` |

## TC-HL-002: provider_health 健康状态判定

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | success_rate >= 95% | `status: "healthy"` |
| 2 | 70% <= success_rate < 95% | `status: "degraded"` |
| 3 | success_rate < 70% | `status: "down"` |

## TC-HL-003: hourly_trend 小时趋势

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `hourly_trend` → `days: 7` | 返回数组 |
| 2 | 每个元素有 `hour, count, chars` | 完整字段 |
| 3 | `hour` 格式 | `YYYY-MM-DDTHH` |
| 4 | 数组按 `hour` 升序 | 时间递增 |

## TC-HL-004: provider_breakdown Provider 细分

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `provider_breakdown` → `days: 30` | 返回数组 |
| 2 | 每个元素有 `provider, count, success` | 完整字段 |
| 3 | `provider` 非空 | Provider 名称字符串 |

## TC-HL-005: 空数据场景

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 无翻译记录的时段查询 `provider_health` | `providers: {}`，不 crash |
| 2 | `hourly_trend` 空数据 | `[]` |
| 3 | `provider_breakdown` 空数据 | `[]` |

## TC-HL-006: 参数验证

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `provider_health(hours=0)` | 返回当前时刻数据（可能为空） |
| 2 | `hourly_trend(days=1)` | 仅最近 24 小时 |
| 3 | `provider_breakdown(days=365)` | 最近一年数据 |
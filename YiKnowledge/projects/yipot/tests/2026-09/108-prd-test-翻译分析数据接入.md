---

doc_type: test
title: "YiPot 翻译分析数据接入 — 测试方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["100-prd-翻译分析数据接入"]
source_modules: ["100-prd-task-翻译分析数据接入"]

type: test
---

# YiPot 翻译分析数据接入 — 测试方案

> 来源 PRD：[100-prd-翻译分析数据接入](../../prds/2026-09/100-prd-翻译分析数据接入.md)

---

## TC-DA-001: getAnalytics 基本查询

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `api.translation.getAnalytics(30)` | 返回 `{ total_translations, period_days, by_target_language }` |
| 2 | `total_translations` | 整数 ≥ 0 |
| 3 | `by_target_language` | 数组，每项含 `language, count, total_chars` |

## TC-DA-002: getProviderHealth 基本查询

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `api.translation.getProviderHealth(24)` | 返回 `{ period_hours, providers, memory_entries, feedback }` |
| 2 | `providers` | 对象，每个 Provider 含 `total, success, failed, success_rate, status` |

## TC-DA-003: feedback 提交

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `api.translation.feedback({ source, target, rating: 'good' })` | 返回 `{ success: true }` |
| 2 | MongoDB `translation_feedback` | 存在对应文档 |

## TC-DA-004: 错误处理

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | YiAi 不可达时调用 `getAnalytics()` | 抛出 Error |
| 2 | YiAi 不可达时调用 `getProviderHealth()` | 抛出 Error |
| 3 | YiAi 不可达时调用 `feedback()` | 抛出 Error |

## TC-DA-005: 构建验证

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `pnpm build` | 构建成功 |
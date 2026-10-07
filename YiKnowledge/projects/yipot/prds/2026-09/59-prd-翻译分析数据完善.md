---

doc_type: module
prd_id: "PO-09-59"
title: "PO-09-59: 翻译分析数据完善 — hourly_trend / provider_breakdown / top_language_pairs"
status: 已完成
priority: P1
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: 需求
---

# PO-09-59: 翻译分析数据完善

> 跨项目数据一致性改进：YiAi 已提供 `hourly_trend`/`provider_breakdown`/`top_language_pairs` 三个 RPC 方法，YiVad TranslationAnalytics 已消费，YiPot 未接入。

## 背景

YiAi `services/translation/translate_service.py` 通过 `provider_health.py` 暴露 5 个分析 RPC：

| RPC 方法 | 功能 | YiVad 消费 | YiPot 消费 |
|----------|------|-----------|-----------|
| `provider_health` | 供应商健康监控 | ✓ | ✓ |
| `hourly_trend` | 小时翻译量趋势 | ✓ | ✗ |
| `provider_breakdown` | 供应商使用分布 | ✓ | ✗ |
| `top_language_pairs` | 语种对排名 | ✗ | ✗ |
| `translation_analytics` | 基础使用统计 | ✗ | ✓ |

YiPot 的 `src/api/services/translation.ts` 仅暴露了 `getAnalytics`/`getProviderHealth`，缺少趋势和分布数据，导致历史页面只能展示静态统计，无法呈现时间维度变化。

## 范围

**In scope**：
- YiPot API 层新增 `getHourlyTrend`/`getProviderBreakdown`/`getTopLanguagePairs` 三个方法
- 数据流完整：YiPot → YiAi RPC → MongoDB 聚合 → 响应

**Out of scope**：
- YiPot 历史页面图表渲染（后续 PRD）
- YiAi 后端新增聚合方法（已存在，无需改动）

| 优先级 | 故事 | 验收标准 |
|--------|------|----------|
| P1 | API 方法补全 | `getHourlyTrend(7)` 返回 `[{hour, count, chars}]` |
| P1 | API 方法补全 | `getProviderBreakdown(30)` 返回 `[{provider, count, success}]` |
| P2 | API 方法补全 | `getTopLanguagePairs(20)` 返回 `[{from, to, count, total_chars}]` |

## 验收标准

- [ ] `translationService.getHourlyTrend()` 可调用并返回趋势数据
- [ ] `translationService.getProviderBreakdown()` 可调用并返回分布数据
- [ ] `translationService.getTopLanguagePairs()` 可调用并返回语种对排名
- [ ] 数据格式与 YiVad `translationService.ts` 中定义的类型一致

## 关联

- YiAi 后端：[provider_health.py](../../yiai/devs/2026-09/100-prd-task-翻译分析增强.md)
- YiVad 消费：[TranslationAnalytics.vue](../../yivad/devs/2026-09/100-prd-task-翻译分析仪表盘.md)
- 主 PRD：[54-prd-交互增强与历史优化](./54-prd-交互增强与历史优化.md)
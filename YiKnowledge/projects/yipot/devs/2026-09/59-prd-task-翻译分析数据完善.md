---

doc_type: module
prd_id: "PO-09-59"
title: "PO-09-59-dev: 翻译分析数据完善 — 开发方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: task
---

# PO-09-59-dev: 翻译分析数据完善 — 开发方案

## 改动清单

### 1. YiPot `src/api/services/translation.ts` — 新增 3 个 RPC 方法

**文件**: `YiPot/src/api/services/translation.ts`

在 `createTranslationService` 返回对象中，`getProviderHealth` 方法后新增：

```typescript
/** Get hourly translation volume trend. */
async getHourlyTrend(days?: number) {
  const res = await client.rpc(
    `${MODULE}.translate_service`, 'hourly_trend', { days: days ?? 7 },
  );
  if (!res.ok) throw new Error(res.error || 'Trend fetch failed');
  return res.data;
},

/** Get per-provider usage breakdown. */
async getProviderBreakdown(days?: number) {
  const res = await client.rpc(
    `${MODULE}.translate_service`, 'provider_breakdown', { days: days ?? 30 },
  );
  if (!res.ok) throw new Error(res.error || 'Breakdown fetch failed');
  return res.data;
},

/** Get most translated language pairs. */
async getTopLanguagePairs(limit?: number) {
  const res = await client.rpc(
    `${MODULE}.translate_service`, 'top_language_pairs', { limit: limit ?? 20 },
  );
  if (!res.ok) throw new Error(res.error || 'Language pairs fetch failed');
  return res.data;
},
```

### 2. YiAi 后端 — 无需改动

`services/translation/translate_service.py` 中 `hourly_trend`/`provider_breakdown`/`top_language_pairs` 三个 RPC 方法已于 2026-09-23 实现（见 `provider_health.py`），直接可用。

### 3. 数据流

```
YiPot API Service
  → client.rpc('services.translation.translate_service', 'hourly_trend', {days: 7})
    → YiAi execution executor → translate_service.hourly_trend(days=7)
      → provider_health.hourly_trend(days=7)
        → MongoDB translation_records 聚合管道
          ← [{hour: "2026-09-23T14", count: 42, chars: 1234}, ...]
```

### 4. 类型对齐

YiPot 返回数据类型与 YiVad `translationService.ts` 一致：

| 方法 | 返回类型 |
|------|---------|
| `getHourlyTrend` | `Array<{hour: string, count: number, chars: number}>` |
| `getProviderBreakdown` | `Array<{provider: string, count: number, success: number}>` |
| `getTopLanguagePairs` | `Array<{from: string, to: string, count: number, total_chars: number}>` |

## 验证步骤

1. 确保 YiAi 运行（`python main.py`）
2. 在 YiPot 中调用 `getApi().translation.getHourlyTrend(7)` 检查返回数据
3. 确认返回格式与 YiVad `HourlyTrendItem[]` 类型一致
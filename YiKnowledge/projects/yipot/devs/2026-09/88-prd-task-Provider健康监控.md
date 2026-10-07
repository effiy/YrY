---

doc_type: module
prd_task_id: "YP-09-53-8"
title: "YiAi Provider 健康监控 + 趋势分析 — 开发方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_backend: 0.3
estimate_frontend: 0.1
source_prd: "53-prd-YiAi后端集成.md"
parent_module: "YP-09-53"
related_tests: ["YP-09-53"]

type: task
---

# YiAi Provider 健康监控 + 趋势分析 — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md) · 父模块：[80-prd-task-YiAi后端集成.md](./80-prd-task-YiAi后端集成.md)

---

## 源码索引

| 文件 | 说明 | 行数 |
|------|------|------|
| `YiAi/src/services/translation/provider_health.py` | Provider 健康监控（Provider 成功率 + 趋势 + 细分 + 语言对） | 144 |
| `YiAi/src/services/translation/translate_service.py` | 新增 3 个委托函数（provider_health/hourly_trend/provider_breakdown） | +12 |
| `YiAi/src/services/translation/__init__.py` | 新增导出 provider_health/hourly_trend/provider_breakdown | +6 |
| `YiVad/src/api/modules/translationService.ts` | 新增 4 个前端 API + 3 个 TypeScript 接口 | +60 |

---

## 一、RPC 方法

### 1.1 provider_health — Provider 健康状态

```
RPC: services.translation.translate_service.provider_health
参数: { hours?: int }  // 默认 24 小时
返回: {
  period_hours: 24,
  providers: {
    "openai": { total: 150, success: 147, failed: 3, success_rate: 0.98, status: "healthy", total_chars: 12000 },
    "google": { total: 200, success: 200, failed: 0, success_rate: 1.0, status: "healthy", total_chars: 15000 },
  },
  memory_entries: 1234,
  feedback: { good: 45, bad: 3 }
}
```

健康状态判定：
- `success_rate >= 95%` → `healthy`
- `70% <= success_rate < 95%` → `degraded`
- `success_rate < 70%` → `down`

### 1.2 hourly_trend — 小时级翻译趋势

```
RPC: services.translation.translate_service.hourly_trend
参数: { days?: int }  // 默认 7 天
返回: [
  { hour: "2026-09-23T14", count: 42, chars: 3200 },
  { hour: "2026-09-23T15", count: 38, chars: 2800 },
  ...
]
```

### 1.3 provider_breakdown — Provider 用量细分

```
RPC: services.translation.translate_service.provider_breakdown
参数: { days?: int }  // 默认 30 天
返回: [
  { provider: "google", count: 520, success: 518 },
  { provider: "openai", count: 310, success: 305 },
  ...
]
```

### 1.4 top_language_pairs — 热门语言对（额外）

```
RPC: services.translation.translate_service.top_language_pairs
参数: { limit?: int }
返回: [
  { from: "en", to: "zh", count: 450, total_chars: 35000 },
  ...
]
```

---

## 二、MongoDB 聚合实现

### 2.1 provider_health 查询

```python
pipeline = [
    {"$match": {"created_at": {"$gte": cutoff}}},
    {"$unwind": "$results"},                                    # 展开 results 数组
    {"$group": {
        "_id": "$results.provider",                             # 按 provider 分组
        "total": {"$sum": 1},
        "empty": {"$sum": {"$cond": [{"$eq": ["$results.text", ""]}, 1, 0]}},
        "total_chars": {"$sum": {"$strLenCP": "$source"}},
    }},
]
```

### 2.2 hourly_trend 查询

```python
pipeline = [
    {"$match": {"created_at": {"$gte": cutoff}}},
    {"$group": {
        "_id": {"$dateToString": {"format": "%Y-%m-%dT%H", "date": "$created_at"}},
        "count": {"$sum": 1},
        "chars": {"$sum": "$source_length"},
    }},
    {"$sort": {"_id": 1}},
]
```

---

## 三、YiVad 前端接口

```typescript
export interface ProviderHealth {
  period_hours: number;
  providers: Record<string, {
    total: number; success: number; failed: number;
    success_rate: number; status: "healthy" | "degraded" | "down";
    total_chars: number;
  }>;
  memory_entries: number;
  feedback: { good: number; bad: number };
}

export function getProviderHealth(hours?: number) { ... }
export function getHourlyTrend(days?: number) { ... }
export function getProviderBreakdown(days?: number) { ... }
```

---

## 四、实施进度

| 任务 | 内容 | 状态 |
|------|------|------|
| H-01 | `provider_health.py` — 4 个 MongoDB 聚合查询 | ✅ |
| H-02 | `translate_service.py` — 3 个委托函数 | ✅ |
| H-03 | `__init__.py` — 新增导出 | ✅ |
| H-04 | `translationService.ts` — 3 个前端 API + 类型 | ✅ |
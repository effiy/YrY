---

doc_type: module
prd_task_id: "YP-09-100"
title: "YiPot 翻译分析数据接入 — 开发方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.2
source_prd: "100-prd-翻译分析数据接入.md"
related_tests: ["YP-09-100"]

type: task
---

# YiPot 翻译分析数据接入 — 开发方案

> 来源 PRD：[100-prd-翻译分析数据接入](../../prds/2026-09/100-prd-翻译分析数据接入.md)

---

## 源码索引

| 文件 | 说明 | 变化 |
|------|------|------|
| `YiPot/src/api/services/translation.ts` | 新增 `getAnalytics`、`getProviderHealth`、`feedback` | +27 |

---

## 实现

### getAnalytics

```typescript
async getAnalytics(days?: number) {
  const res = await client.rpc(
    'services.translation.translate_service', 'translation_analytics',
    { days: days ?? 30 }
  );
  if (!res.ok) throw new Error(res.error || 'Analytics failed');
  return res.data;
}
```

### getProviderHealth

```typescript
async getProviderHealth(hours?: number) {
  const res = await client.rpc(
    'services.translation.translate_service', 'provider_health',
    { hours: hours ?? 24 }
  );
  if (!res.ok) throw new Error(res.error || 'Health check failed');
  return res.data;
}
```

### feedback

```typescript
async feedback(params: {
  source: string; target: string; rating: 'good' | 'bad';
  provider?: string; from_lang?: string; to_lang?: string;
}) {
  const res = await client.rpc(
    'services.translation.translate_service', 'translation_feedback', params
  );
  if (!res.ok) throw new Error(res.error || 'Feedback failed');
  return res.data;
}
```

---

## 实施进度

| 任务 | 状态 |
|------|------|
| `TranslationService` 新增 3 个方法 | ✅ |
| `pnpm build` 通过 | ✅ |
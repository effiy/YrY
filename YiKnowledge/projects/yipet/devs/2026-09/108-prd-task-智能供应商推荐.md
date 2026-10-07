---

doc_type: task
prd_task_id: "YP-09-108"
title: "YP-09-108: 智能供应商推荐 — 技术设计"
status: 已完成
priority: P2
owner: Claude + Linter
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "108-基础设施-智能供应商推荐.md"

type: task
---

# YP-09-108: 智能供应商推荐 — 技术设计

## 实现

**文件**：`api/services/translation.ts` — `getProviderRecommend(fromLang?, toLang?)`

```typescript
async getProviderRecommend(fromLang?, toLang?) {
  return client.rpc<ProviderRecommendation>(
    "services.translation.translate_service",
    "provider_recommend",
    { from_lang: fromLang || 'auto', to_lang: toLang || 'zh' }
  );
}
```

**返回类型**：`{ recommended: string|null, providers: Array<{name, success_rate, status, total}>, healthy_count, degraded_count, down_count }`

**跨项目对称**：YiVad `getProviderRecommend` 用于 Dashboard 可视化排名卡片，YiPet 版本为将来智能引擎选择预埋。
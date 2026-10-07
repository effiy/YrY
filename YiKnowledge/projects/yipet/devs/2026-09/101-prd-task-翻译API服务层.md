---

doc_type: task
prd_task_id: "YP-09-101"
title: "YP-09-101: 翻译 API 服务层 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 0.2
source_prd: "101-基础设施-翻译API服务层.md"

type: task
---

# YP-09-101: 翻译 API 服务层 — 技术设计

## 实现

**文件**：`api/services/translation.ts`

```typescript
export function createTranslationService(client: ApiClient) {
  return {
    translate(params) → client.rpc("services.translation.translate_service", "translate", params),
    queryHistory(params) → client.rpc("services.database.data_service", "query_documents", {...}),
    feedback(params) → client.rpc("services.translation.translate_service", "translation_feedback", {...}),
  };
}
export type TranslationService = ReturnType<typeof createTranslationService>;
```

**类型**：`TranslateResult`、`TranslateParams`、`TranslationRecord`

**工厂函数选择**：使用工厂函数而非 class，更轻量，类型通过 ReturnType 推导。
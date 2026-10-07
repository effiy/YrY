---

doc_type: task
prd_task_id: "YP-09-103"
title: "YP-09-103: 翻译服务注入链 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 0.15
source_prd: "103-基础设施-翻译服务注入链.md"

type: task
---

# YP-09-103: 翻译服务注入链 — 技术设计

## 实现

```
index.ts: store.injectServices({translation: api.translation})
  → chat.ts: injectServices(services) → injectSharedServices(services)
    → services.ts: _translation = services.translation
      → getTranslation(): TranslationService
```

**文件变更**：`api/services/index.ts`（ApiServices + factory）、`chat/stores/services.ts`（注入管理）、`chat/stores/chat.ts`（import + injectServices签名）、`chat/index.ts`（启动注入）

**类型修复**：`TranslationService` 为工厂返回类型，需 `import { createTranslationService, type TranslationService }` + `export type { TranslationService }`
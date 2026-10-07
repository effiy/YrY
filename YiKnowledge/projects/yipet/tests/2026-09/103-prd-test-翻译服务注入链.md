---

doc_type: test
prd_test_id: "YP-09-103"
title: "YP-09-103: 翻译服务注入链 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_task: "103-prd-task-翻译服务注入链.md"

type: test
---

# YP-09-103: 翻译服务注入链 — 测试方案

| 场景 | 期望 |
|------|------|
| ApiServices 含 translation | TypeScript 接口检查通过 |
| createApiServices 注入 | translation 字段存在 |
| getTranslation() 调用 | 返回 TranslationService 实例 |
| vue-tsc --noEmit | 0 errors |
| npm test | 138 passed，无回归 |

## 测试命令

```bash
npm run typecheck && npm run build && npm test
```
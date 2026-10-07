---

doc_type: test
prd_test_id: "YP-09-101"
title: "YP-09-101: 翻译 API 服务层 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_task: "101-prd-task-翻译API服务层.md"

type: test
---

# YP-09-101: 翻译 API 服务层 — 测试方案

| 场景 | 期望 |
|------|------|
| createTranslationService 返回正确结构 | {translate, queryHistory, feedback} 均为 function |
| translate 调用 RPC | module="services.translation.translate_service", method="translate" |
| translate 默认 use_memory=true | 参数含 use_memory: true |
| RPC error → throw | Error("Server error") |
| queryHistory queries translation_records | cname: "translation_records" |

## 测试命令

```bash
npm test -- tests/api/translation.test.ts
```
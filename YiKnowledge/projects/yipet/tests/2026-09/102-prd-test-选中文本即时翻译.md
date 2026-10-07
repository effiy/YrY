---

doc_type: test
prd_test_id: "YP-09-102"
title: "YP-09-102: 选中文本即时翻译 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_task: "102-prd-task-选中文本即时翻译.md"

type: test
---

# YP-09-102: 选中文本即时翻译 — 测试方案

| 场景 | 期望 |
|------|------|
| 选中 "Hello" → translate | 译文写入 inputTemplate |
| 未选中文本 | notify info |
| 选中单字符 "A" | notify info（length < 2） |
| chat 未打开 | auto-open |
| API 失败 | notify error |
| 多供应商结果 | provider 标签区分 |
| 缓存命中 | cached=true 标签 |

## 测试命令

```bash
npm run build && npm test
# 手动：加载扩展，选中文本，点击工具栏翻译按钮
```
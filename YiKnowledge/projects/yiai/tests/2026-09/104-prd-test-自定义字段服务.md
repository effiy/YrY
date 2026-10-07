---

doc_type: test
prd_test_id: "YA-09-104"
title: "YA-09-104: 自定义字段服务 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_task: "104-prd-task-自定义字段服务.md"

type: test
---

# YA-09-104: 自定义字段服务 — 测试方案

| 场景 | 期望 |
|------|------|
| create 缺少 name | 抛 INVALID_PARAMS |
| create field_type="invalid" | 抛 BusinessException |
| create 正常 text 类型 | 返回含 key 的数据 |
| list by entity_type="bug" | 过滤正确 |
| update field_def | 字段更新成功 |
| delete field_def | 记录删除 |
| 8 种 field_type 全支持 | 均通过校验 |

## 测试命令

```bash
pytest tests/ -k "custom_field" -v
```
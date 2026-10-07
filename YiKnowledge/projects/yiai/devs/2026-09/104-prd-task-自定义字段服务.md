---

doc_type: task
prd_task_id: "YA-09-104"
title: "YA-09-104: 自定义字段服务 — 技术设计"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate: 0.3
source_prd: "104-需求-自定义字段服务.md"

type: task
---

# YA-09-104: 自定义字段服务 — 技术设计

## 业务上下文

`services/custom_fields/custom_field_service.py` 为 Issue/Bug/Project 实体提供动态自定义字段定义 CRUD。MongoDB `custom_field_defs` 集合存储字段元数据。

## 架构

```
YiVad → RPC("services.custom_fields.custom_field_service", method, params)
  → custom_field_service.list_field_defs / create_field_def / update_field_def / delete_field_def
    → data/repository → MongoDB custom_field_defs
```

## 实现

**文件**：`services/custom_fields/custom_field_service.py`（~200 行）

**8 种字段类型**：text(500 chars), number(min/max), date, select(options[]), multi_select(options[]), user, url, checkbox

**RPC 方法**：
- `list_field_defs({entity_type?, pageNum?, pageSize?})` → 按 order 排序
- `create_field_def({data: {name, entity_type, field_type, ...}})` → 校验 + 默认 validation
- `update_field_def({key, data})` → 部分更新
- `delete_field_def({key})` → 物理删除

**数据模型**（MongoDB `custom_field_defs`）：`{key, name, entity_type, field_type, validation, order, enabled, required, created_at, updated_at}`

## 非功能需求

| 维度 | 实现 |
|------|------|
| 校验 | name/entity_type/field_type 必填，field_type ∈ FIELD_TYPES |
| 排序 | order 字段 + order by asc |
| 数据访问 | 复用 data/repository CRUD 方法 |
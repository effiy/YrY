---
doc_type: module
prd_task_id: "YV-09-114"
title: "YV-09-114: 数据架构图生成 — MongoDB 集合数据模型/Schema 可视化、实体关系图、字段级详情、关系连线、导出为图表、自动检测集合关系 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "53-prd-数据架构图生成.md"
---

# YV-09-114: 数据架构图生成 — MongoDB 集合数据模型/Schema 可视化、实体关系图、字段级详情、关系连线、导出为图表、自动检测集合关系 — 开发任务

> 来源 PRD：[53-prd-数据架构图生成.md](../prds/2026-09/53-prd-数据架构图生成.md)
> 需求编号：YV-09-114 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现后端 Schema 采样 | `schema_service.py` | 采样 100 条正确推断类型 | 0.03 |
| 2 | 实现关系检测引擎 | `schema_service.py` | 6 个核心关系正确检测 | 0.04 |
| 3 | 实现 Schema API 封装 | `api/schema.ts` | CRUD 操作正确 | 0.02 |
| 4 | 实现 ER 图组件 | `SchemaGraph.vue` | 10 节点 20 边正常渲染 | 0.06 |
| 5 | 实现集合详情面板 | `CollectionDetail.vue` | 字段列表+统计正确 | 0.04 |
| 6 | 实现关系列表视图 | `RelationList.vue` | 关系正确展示 | 0.03 |
| 7 | 实现导出引擎 | `SchemaExport.vue` | JSON/Mermaid/PNG 全通过 | 0.04 |
| 8 | 组装主页面+路由 | `DataSchemaPage.vue` | 整体可用 | 0.04 |

**总人天：0.3d**

---

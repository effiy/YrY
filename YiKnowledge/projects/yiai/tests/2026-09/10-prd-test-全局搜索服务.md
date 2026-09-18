---
doc_type: test
title: "YA-09-06: 全局搜索服务 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-06"
source_prds: ["10-需求-全局搜索服务"]
source_modules: ["10-prd-task-全局搜索服务"]
source_okr: [yiai-001]
---

# YA-09-06: 全局搜索服务 — 测试规格

> 来源 PRD：[10-需求-全局搜索服务.md](../../prds/2026-09/10-需求-全局搜索服务.md)
> 开发方案：[10-prd-task-全局搜索服务.md](../../devs/2026-09/10-prd-task-全局搜索服务.md)

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-GS-01 | 跨集合搜索 | 搜索"RAG" → knowledge_files + sessions 均有结果 |
| UT-GS-02 | 搜索结果聚合 | 按集合分组 → `{knowledge_files: [...], sessions: [...]}` |
| UT-GS-03 | 权限过滤 | restricted 文档不在结果中 |
| UT-GS-04 | 空查询 → 空结果 | 不报错 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 权限过滤失效 → restricted 文档泄露 |
| S2 — 一般 | 单集合搜索超时导致整体超时 |

---
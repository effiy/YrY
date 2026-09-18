---
doc_type: test
title: "YA-08-07: Dashboard 健康聚合 API — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-07"
source_prds: ["07-需求-Dashboard健康聚合API"]
source_modules: ["07-prd-task-Dashboard健康聚合API"]
source_okr: [yiai-001]
---

# YA-08-07: Dashboard 健康聚合 API — 测试规格

> 来源 PRD：[07-需求-Dashboard健康聚合API.md](../../prds/2026-08/07-需求-Dashboard健康聚合API.md)
> 开发方案：[07-prd-task-Dashboard健康聚合API.md](../../devs/2026-08/07-prd-task-Dashboard健康聚合API.md)
> 需求编号：YA-08-07 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 7 个子路由的数据聚合和降级。

---

## 一、7 子路由验证

| 编号 | 子路由 | 验证点 |
|------|--------|--------|
| UT-DB-01 | `/dashboard/ai` | 模型列表 + Token 用量 |
| UT-DB-02 | `/dashboard/rag` | 索引大小 + 文档数 |
| UT-DB-03 | `/dashboard/knowledge` | 文件数 + 分类统计 |
| UT-DB-04 | `/dashboard/rss` | Feed 源数 + 最近更新 |
| UT-DB-05 | `/dashboard/performance` | 请求量 + P95 延迟 |
| UT-DB-06 | `/dashboard/organization` | 用户/项目/活跃度 |
| UT-DB-07 | `/dashboard/health` | 各依赖连通性状态 |

---

## 二、降级行为

| 编号 | 场景 | 预期 |
|------|------|------|
| UT-DB-08 | Ollama 不可达 | AI 子路由返回 `{status:"unavailable"}`，其他正常 |
| UT-DB-09 | MongoDB 不可达 | health 返回 MDB `{status:"down"}` |
| UT-DB-10 | 全部子路由并行查询 | `asyncio.gather`，总延迟 = max(各路由) |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 单一子系统不可用导致整个 Dashboard 500 |
| S2 — 一般 | 聚合数据与实际 MDB 数据不一致 |

---
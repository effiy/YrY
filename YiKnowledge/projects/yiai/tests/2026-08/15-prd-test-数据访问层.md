---
doc_type: test
title: "YA-08-15: 数据访问层 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-15"
source_prds: ["15-需求-数据访问层"]
source_modules: ["15-prd-task-数据访问层"]
source_okr: [yiai-001]
---

# YA-08-15: 数据访问层 — 测试规格

> 来源 PRD：[15-需求-数据访问层.md](../../prds/2026-08/15-需求-数据访问层.md)

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-DA-01 | `query_documents(cname, filter)` | 使用 `filter` 参数，忽略 `query` |
| UT-DA-02 | `query_documents` 使用 `query`→全表扫描 | WARNING 日志 + 静默忽略 |
| UT-DA-03 | 范围查询 `{gte, lte}` | 过滤字段正确穿透 |
| UT-DA-04 | `tags: ["a","b"]`→`$in` | 不被误判为范围查询 |
| UT-DA-05 | 分页 `skip/limit` | 第 2 页数据正确 |

---
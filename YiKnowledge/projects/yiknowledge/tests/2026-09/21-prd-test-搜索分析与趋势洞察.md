---
doc_type: test
title: "YK-09-18: 搜索分析与趋势洞察 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-18"
source_prds: ["21-架构设计-搜索分析与趋势洞察"]
source_modules: ["21-prd-task-搜索分析与趋势洞察"]
source_okr: [yiknowledge-001]
---

# YK-09-18: 搜索分析与趋势洞察 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-TR-01 | 热门查询 TOP-10 | 按查询次数降序 |
| UT-TR-02 | 零结果查询 → 缺口标识 | `has_content=false` 的查询标记为缺口 |
| UT-TR-03 | Dashboard API | 返回 `{top_queries, content_gaps, trends}` |

---
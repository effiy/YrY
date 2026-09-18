---
doc_type: test
title: "YK-09-33: RAG 检索结果可解释性 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-33"
source_prds: ["36-架构设计-RAG检索结果可解释性"]
source_modules: ["36-prd-task-RAG检索结果可解释性"]
source_okr: [yiknowledge-001]
---

# YK-09-33: RAG 检索结果可解释性 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-EX-01 | 四维度分开展示 | bm25/vec/freshness/field 均有数值 |
| UT-EX-02 | 来源高亮定位 | 匹配文本在原文中 `<mark>` 包裹 |
| UT-EX-03 | 维度权重和为 1 | 四个维度占比之和=1.0 |

---
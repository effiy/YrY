---
doc_type: test
title: "YK-09-14: RAG 混合检索 Alpha 调优 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-14"
source_prds: ["17-架构设计-RAG混合检索Alpha调优"]
source_modules: ["17-prd-task-RAG混合检索Alpha调优"]
source_okr: [yiknowledge-001]
---

# YK-09-14: RAG 混合检索 Alpha 调优 — 测试用例

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-AL-01 | factual 查询 → α=0.7 | "MongoDB 连接池配置" → α≥0.6 |
| UT-AL-02 | keyword 查询 → α=0.3 | "RBAC" → α≤0.4 |
| UT-AL-03 | 离线评估：👍 多的查询 → α 调优 | 调整后 👍 率提升 |
| UT-AL-04 | AB 测试分流 | user_id 一致性验证 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S2 — 一般 | α 调整后检索质量退化（MRR 下降） |

---
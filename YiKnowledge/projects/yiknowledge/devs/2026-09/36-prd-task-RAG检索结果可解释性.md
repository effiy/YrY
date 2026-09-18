---
doc_type: module
prd_task_id: "YK-09-33"
title: "YK-09-33: RAG 检索结果可解释性 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "36-架构设计-RAG检索结果可解释性.md"
source_okr: [yiknowledge-001]
related_tests: ["36-prd-test-RAG检索结果可解释性"]
---

# YK-09-33: RAG 检索结果可解释性 — 开发方案

> 需求编号：YK-09-33 · 人天：0.5d

---

## 一、架构总览

RAG 检索结果展示四维度相关度分解（bm25/vec/freshness/field）和来源高亮。复用 YA-09-04 的分维度评分数据，前端展示"为什么这条结果排在前面"。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 分维度评分展示 UI | 0.2 |
| 2 | 来源高亮（匹配文本定位） | 0.15 |
| 3 | 测试 | 0.15 |

**总计：0.5d**

---
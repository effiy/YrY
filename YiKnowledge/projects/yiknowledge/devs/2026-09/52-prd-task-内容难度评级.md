---
doc_type: module
prd_task_id: "YK-09-49"
title: "YK-09-49: 内容难度评级 — 开发方案"
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
source_prd: "52-架构设计-内容难度评级.md"
source_okr: [yiknowledge-001]
related_tests: ["52-prd-test-内容难度评级"]
---

# YK-09-49: 内容难度评级 — 开发方案

> 需求编号：YK-09-49 · 人天：0.5d

---

## 一、架构总览

基于可读性分析（HSK 词汇等级、句子复杂度、技术术语密度）自动分级：beginner/intermediate/advanced/expert。复用 M20 `ReadabilityAnalyzer` 的输出，添加难度映射规则。结果写入 frontmatter `difficulty` 字段。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 可读性→难度映射规则 | 0.15 |
| 2 | frontmatter 写入 + KnowledgeWatcher 集成 | 0.2 |
| 3 | 测试 | 0.15 |

**总计：0.5d**

---
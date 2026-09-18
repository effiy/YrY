---
doc_type: module
prd_task_id: "YK-09-38"
title: "YK-09-38: 检索片段优化 — 开发方案"
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
source_prd: "41-架构设计-检索片段优化.md"
source_okr: [yiknowledge-001]
related_tests: ["41-prd-test-检索片段优化"]
---

# YK-09-38: 检索片段优化 — 开发方案

> 需求编号：YK-09-38 · 人天：0.5d

---

## 一、架构总览

RAG 检索片段（snippet）当前固定截断 200 字符，可能在词中间截断。优化：按完整句子边界截断 + 动态窗口（短文档扩展上下文，长文档收紧窗口）+ 关键词居中对齐。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 句子边界检测 + 智能截断 | 0.2 |
| 2 | 动态窗口 + 关键词居中对齐 | 0.15 |
| 3 | 测试 | 0.15 |

**总计：0.5d**

---
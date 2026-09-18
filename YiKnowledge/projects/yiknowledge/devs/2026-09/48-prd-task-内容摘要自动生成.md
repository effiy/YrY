---
doc_type: module
prd_task_id: "YK-09-45"
title: "YK-09-45: 内容摘要自动生成 — 开发方案"
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
source_prd: "48-架构设计-内容摘要自动生成.md"
source_okr: [yiknowledge-001]
related_tests: ["48-prd-test-内容摘要自动生成"]
---

# YK-09-45: 内容摘要自动生成 — 开发方案

> 需求编号：YK-09-45 · 人天：0.5d

---

## 一、架构总览

LLM 为每篇文档生成 ≤200 字摘要，写入 frontmatter `description` 字段。KnowledgeWatcher 扫描时检测无摘要文档，异步调用 YiAi `writing_service` 生成摘要。Dashboard 展示"缺少摘要"列表。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | LLM 摘要生成 + frontmatter 写入 | 0.2 |
| 2 | KnowledgeWatcher 集成 | 0.15 |
| 3 | Dashboard + 测试 | 0.15 |

**总计：0.5d**

---
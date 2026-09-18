---
doc_type: module
prd_task_id: "YK-09-21"
title: "YK-09-21: 标签体系治理 — 开发方案"
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
source_prd: "24-架构设计-标签体系治理.md"
source_okr: [yiknowledge-001]
related_tests: ["24-prd-test-标签体系治理"]
---

# YK-09-21: 标签体系治理 — 开发方案

> 来源 PRD：[24-架构设计-标签体系治理.md](../../prds/2026-09/24-架构设计-标签体系治理.md)
> 需求编号：YK-09-21 · 优先级：P2 · 人天：0.5d

---

## 一、架构总览

标签生命周期管理：合并（"RAG"+"检索增强"→保留"RAG"）、重命名（全库替换）、废弃（标记 deprecated，不删除历史数据）。操作通过 MDB 聚合更新全库 frontmatter `tags` 字段。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 标签合并/重命名 API | 0.2 |
| 2 | 标签废弃 + 全库批量更新 | 0.15 |
| 3 | 测试 | 0.15 |

**总计：0.5d**

## 三、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 批量更新无回滚 | P3 | 合并且发操作出错后无法撤销 | 待实施 |

---
---
doc_type: module
prd_task_id: "YK-09-34"
title: "YK-09-34: 内容新鲜度扫描 — 开发方案"
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
source_prd: "37-架构设计-内容新鲜度扫描.md"
source_okr: [yiknowledge-001]
related_tests: ["37-prd-test-内容新鲜度扫描"]
---

# YK-09-34: 内容新鲜度扫描 — 开发方案

> 需求编号：YK-09-34 · 人天：0.5d

---

## 一、架构总览

复用 YK-09-06 生命周期引擎的 overdue_ratio 计算逻辑，每日扫描全部文档，将超 review_cycle 的文档标记为"需审查"。通过企微通知策展人，Dashboard 展示过期文档列表。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 新鲜度扫描脚本（复用 LifecycleEngine） | 0.15 |
| 2 | 企微通知 + Dashboard 集成 | 0.2 |
| 3 | 测试 | 0.15 |

**总计：0.5d**

---
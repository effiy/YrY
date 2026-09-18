---
doc_type: module
prd_task_id: "YK-09-32"
title: "YK-09-32: 批量知识迁移自动化 — 开发方案"
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
source_prd: "35-架构设计-批量知识迁移自动化.md"
source_okr: [yiknowledge-001]
related_tests: ["35-prd-test-批量知识迁移自动化"]
---

# YK-09-32: 批量知识迁移自动化 — 开发方案

> 需求编号：YK-09-32 · 人天：0.5d

---

## 一、架构总览

跨项目知识文件迁移时，自动更新全库引用和 MDB 索引。复用 YK-09-10 的单文件迁移逻辑，扩展为批量模式（目录级迁移 + 并发处理）。迁移脚本：`git mv` + 引用扫描替换 + redirect 文件生成。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 批量迁移脚本（目录级 + 并发） | 0.2 |
| 2 | 全库引用批量更新 | 0.15 |
| 3 | MDB 索引同步更新 + 测试 | 0.15 |

**总计：0.5d**

---
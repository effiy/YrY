---
doc_type: module
prd_task_id: "YK-09-35"
title: "YK-09-35: API 字段一致性扫描 — 开发方案"
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
source_prd: "38-架构设计-API字段一致性扫描.md"
source_okr: [yiknowledge-001]
related_tests: ["38-prd-test-API字段一致性扫描"]
---

# YK-09-35: API 字段一致性扫描 — 开发方案

> 需求编号：YK-09-35 · 人天：0.5d

---

## 一、架构总览

定期扫描 YiAi RPC 方法参数与前端 TypeScript 调用代码的一致性，检测参数名漂移（如 `filter`→`query`）。复用 YA-09-08 API 契约校验的参数白名单，新增 TS 端调用扫描。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | TS 代码 RPC 调用扫描脚本 | 0.2 |
| 2 | 前后端参数对比 + 漂移检测 | 0.15 |
| 3 | CI 集成 + 报告 | 0.15 |

**总计：0.5d**

---
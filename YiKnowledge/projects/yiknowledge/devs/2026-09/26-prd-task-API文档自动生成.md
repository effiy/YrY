---
doc_type: module
prd_task_id: "YK-09-23"
title: "YK-09-23: API 文档自动生成 — 开发方案"
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
source_prd: "26-架构设计-API文档自动生成.md"
source_okr: [yiknowledge-001]
related_tests: ["26-prd-test-API文档自动生成"]
---

# YK-09-23: API 文档自动生成 — 开发方案

> 来源 PRD：[26-架构设计-API文档自动生成.md](../../prds/2026-09/26-架构设计-API文档自动生成.md)
> 需求编号：YK-09-23 · 优先级：P2 · 人天：0.5d

---

## 一、架构总览

从 YiAi FastAPI 路由自动生成 OpenAPI 3.0 规范文档，嵌入 YiKnowledge 作为静态 API 参考页面。YiAi 已有 `/docs` (Swagger UI)，只需将生成的 `openapi.json` 导出到 YiKnowledge 静态目录。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | FastAPI `openapi.json` 导出脚本 | 0.15 |
| 2 | YiKnowledge 静态页面渲染 (Swagger UI) | 0.2 |
| 3 | 集成测试 | 0.15 |

**总计：0.5d**

## 三、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | API 文档需手动触发更新 | P3 | 非 CI 自动化 | 待实施 |

---
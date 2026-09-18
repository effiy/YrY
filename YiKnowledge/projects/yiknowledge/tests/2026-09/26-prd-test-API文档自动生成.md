---
doc_type: test
title: "YK-09-23: API 文档自动生成 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-23"
source_prds: ["26-架构设计-API文档自动生成"]
source_modules: ["26-prd-task-API文档自动生成"]
source_okr: [yiknowledge-001]
---

# YK-09-23: API 文档自动生成 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-API-01 | openapi.json 导出有效 | JSON 通过 OpenAPI 3.0 schema 校验 |
| UT-API-02 | Swagger UI 渲染正确 | 所有端点可见，可交互测试 |
| UT-API-03 | 文档与代码同步 | 新增 RPC 方法后文档自动包含 |

---
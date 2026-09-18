---
doc_type: test
title: "YA-08-01: GraphQL 联邦层 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-01"
source_prds: ["01-需求-GraphQL联邦层"]
source_modules: ["01-prd-task-GraphQL联邦层"]
source_okr: [yiai-001]
---

# YA-08-01: GraphQL 联邦层 — 测试规格

> 来源 PRD：[01-需求-GraphQL联邦层.md](../../prds/2026-08/01-需求-GraphQL联邦层.md)
> 开发方案：[01-prd-task-GraphQL联邦层.md](../../devs/2026-08/01-prd-task-GraphQL联邦层.md)
> 需求编号：YA-08-01 · 优先级：P2

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 GraphQL 查询、RPC 适配器、DataLoader、Federation 子图。

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-GQ-01 | 单实体查询 | `query { knowledgeFile(path:"x") { title } }` → 返回 title |
| UT-GQ-02 | 跨服务查询聚合 | `query { knowledgeFile { title } sessions { key } }` → 两个 RPC 被聚合 |
| UT-GQ-03 | RPC 适配器错误→GraphQL error | RPC 返回 1002 → `errors[{message, code}]` |
| UT-GQ-04 | N+1 → DataLoader 批量 | 查询 10 个 knowledgeFile 的 related docs → 2 次 RPC（非 11 次） |
| UT-GQ-05 | Federation `@key` 解析 | `_entities` 查询正确解析跨子图引用 |
| UT-GQ-06 | 查询深度限制 | depth=6 → 拒绝 (max_depth=5) |
| UT-GQ-07 | 空查询参数 | `knowledgeFile(path:"")` → validation error |

---

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-GQ-01 | POST `/graphql` 查询 | 返回 JSON `{data, errors}` |
| IT-GQ-02 | GraphiQL 交互式查询 | `/graphql` GET → GraphiQL 界面 |
| IT-GQ-03 | 三个子图联合查询 | data + chat + knowledge 子图同时工作 |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | GraphQL 查询导致 RPC 500 但未转换为 GraphQL error |
| S2 — 一般 | N+1 未优化（DataLoader 未生效） |

---
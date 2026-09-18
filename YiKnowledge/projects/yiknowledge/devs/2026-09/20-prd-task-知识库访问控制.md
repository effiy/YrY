---
doc_type: module
prd_task_id: "YK-09-17"
title: "YK-09-17: 知识库访问控制 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "20-架构设计-知识库访问控制.md"
source_okr: [yiknowledge-001]
related_tests: ["20-prd-test-知识库访问控制"]
---

# YK-09-17: 知识库访问控制 — 开发方案

> 来源 PRD：[20-架构设计-知识库访问控制.md](../../prds/2026-09/20-架构设计-知识库访问控制.md)
> 需求编号：YK-09-17 · 优先级：P2 · 人天：1.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

基于 RBAC 的知识库访问控制：`curator`（读写+审批）、`engineer`（读写）、`viewer`（只读）三级角色。权限通过 frontmatter `access` 字段声明，KnowledgeWatcher 扫描时写入 MDB，RAG 检索时过滤。

## 二、关键技术决策

- **frontmatter 声明式**：`access: public | internal | restricted`，不引入独立权限系统
- **RAG 检索过滤**：检索时自动附加 `access` 过滤条件（基于请求用户角色）

## 三、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | frontmatter `access` 字段 + KnowledgeWatcher 解析 | 0.3 |
| 2 | RAG 检索 access 过滤 | 0.3 |
| 3 | 审批流程（restricted→curator 审批→公开） | 0.2 |
| 4 | 测试 | 0.2 |

**总计：1.0d**

## 四、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 角色权限硬编码 | P3 | curator/engineer/viewer 角色不可动态扩展 | 待实施 |

---
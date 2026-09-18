---
doc_type: module
prd_task_id: "YP-08-02"
title: "YP-08-02: 知识库与 RAG 集成 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiPet
project_id: yipet
prd_month: "202608"
source_prd: "02-功能实现-知识库与RAG集成.md"
---

# YP-08-02: 知识库与 RAG 集成 — 开发方案

> 需求编号：YP-08-02 · 优先级：P0

---

## 一、方案概述

在聊天窗口中集成 YiKnowledge 知识树浏览和 RAG 检索，支持文件级/目录级范围限定。

```mermaid
flowchart LR
  TREE["知识树<br/>7 角色目录"] --> SELECT["选择范围"]
  SELECT --> RAG["RAG 检索<br/>YiAi /rag/search"]
  RAG --> CHAT["SSE 流式<br/>+ 内联引用"]
```

### 核心功能

| 功能 | 说明 |
|------|------|
| 知识树浏览 | 7 角色目录 → 递归子目录 → 文件列表 |
| RAG 范围限定 | 文件级/目录级 scope 选择 |
| 子问题分解 | decompose → 多个子问题并行检索 |
| 来源预览 | 检索结果点击查看源文件 |
| RAG 状态监控 | 索引状态 + 重建触发 |

### 实施步骤

| 步骤 | 内容 |
|------|------|
| 1 | knowledgeService API + 知识树组件 |
| 2 | RAG 检索集成 (scope/decompose) |
| 3 | 来源预览 + 状态监控 |
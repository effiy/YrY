---
doc_type: module
prd_task_id: "YP-08-07"
title: "YP-08-07: API 服务扩展 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202608"
source_prd: "06-功能实现-API服务扩展.md"
---

# YP-08-07: API 服务扩展 — 开发方案

> 需求编号：YP-08-07 · 优先级：P1

---

## 一、方案概述

扩展 4-Tier API 层：新增会话分支/知识库/RAG/通知等 Service。

### 新增 Service

| Service | RPC 方法 | 用途 |
|---------|---------|------|
| BranchService | branchFromMessage | 会话分支 |
| KnowledgeService | getTree/getFile | 知识库浏览 |
| RagService | search/chat | RAG 检索 |
| NotificationService | list/markRead | 通知管理 |

### 实施步骤

| 步骤 | 内容 |
|------|------|
| 1 | 4 个新 Service (Layer 4) |
| 2 | Types 类型定义 (Layer 3) |
| 3 | ApiClient 流式增强 (Layer 1) |
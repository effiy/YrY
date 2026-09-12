---
doc_type: module
prd_task_id: "YP-08-03"
title: "知识库与 RAG 集成 — 知识树浏览、RAG 聊天、文件预览与子问题分解 — 开发任务"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiPet
project_id: yipet
prd_month: "202608"
estimate_frontend: 6.0
source_prd: "02-功能实现-知识库与RAG集成.md"
---

# 知识库与 RAG 集成 — 开发任务

> 来源 PRD：[02-功能实现-知识库与RAG集成.md](../../prds/2026-08/02-功能实现-知识库与RAG集成.md)
> 需求编号：YP-08-03 · 优先级：P1 · 人天：6.0d
> 类型：功能 · 状态：已完成

## 实施路线图

### 阶段一：核心实现（约 3.0d）

| 步骤 | 任务 | 产出 | 验证方式 |
|------|------|------|----------|
| 1 | 知识树 API 集成 | `KnowledgeService` + `KnowledgeTree.vue` | 目录树渲染正确 |
| 2 | RAG 聊天集成 | `RagChat.vue` + SSE 流式解析 | RAG 检索增强对话正常 |
| 3 | 文件预览组件 | `FilePreview.vue`（Markdown/代码/图片） | 多格式预览正常 |
| 4 | 子问题分解 | `useSubQuestion.ts` + @提及解析 | 子问题拆分和追问正常 |

### 阶段二：完善与收尾（约 3.0d）

| 步骤 | 任务 | 产出 |
|------|------|------|
| 5 | @提及自动补全 | `MentionAutocomplete.vue` |
| 6 | 知识树搜索与过滤 | 搜索 + 标签过滤 |
| 7 | 文档更新 | CLAUDE.md / 知识库更新 |
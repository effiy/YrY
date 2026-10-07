---
prd_task_id: "YV-09-87"
title: "YV-09-87: RAG 聊天模型参数传递修复"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-22
updated: 2026-09-22
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
estimate_backend: 0.25
source_prd: null
related_devs: [87-prd-task-RAG聊天模型参数传递]
related_tests: [87-prd-test-RAG聊天模型参数传递]
tags: [RAG, 模型选择, 参数传递, 前后端, Bug修复]
category: 项目/管理后台/Bug修复
source: internal
type: 需求
issue_type: Bug修复
related_modules: ["87-prd-task-RAG聊天模型参数传递"]
benefit: "产品需求：RAG聊天模型参数传递"
lifecycle: active
---

# YV-09-87: RAG 聊天模型参数传递修复

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY），不含实现方案与测试用例。

> 需求编号：YV-09-87 · 优先级：P1 · 人天：0.5d（前端 0.25d + 后端 0.25d）· 状态：已完成

实现方案见[开发方案](../../devs/2026-09/87-prd-task-RAG聊天模型参数传递.md)，验证方式见[测试用例](../../tests/2026-09/87-prd-test-RAG聊天模型参数传递.md)。

---

## 背景

### 问题描述

在 AI 聊天页面 (`/#/ai-chat`) 中，开启 RAG 功能后发送消息时，聊天无响应。后端日志显示 `model: null` 错误：

```
API Error: 400 event:error
data:{"code":"InvalidParameter","message":"The model `null` does not exist or you do not have access to it.","request_id":"..."}
```

**根因**：前端 `streamRagChat` 调用未传递 `model` 参数，后端 `rag_chat_stream` 也未接受 `model` 参数，而是硬编码使用 `settings.rag_llm_model`。当该配置值与实际可用的模型不匹配时，RAG 聊天完全不可用。

### 影响范围

| 影响 | 说明 |
|------|------|
| RAG 聊天完全不可用 | 用户开启 RAG 后无法获取任何回复 |
| 模型选择被忽略 | 用户在 UI 中选择的模型对 RAG 聊天无效 |
| 配置耦合 | RAG 聊天强制使用 `config.yaml` 中的 `rag.llm_model`，无法按会话切换 |

---

## 需求描述

### 核心需求

1. 前端在 RAG 聊天请求中传递用户当前选择的模型名称
2. 后端接受并优先使用请求中的模型参数，仅在未提供时回退到 `settings.rag_llm_model`

### 验收标准

- [ ] RAG 开启时，用户在 UI 中选择的模型能被 RAG 聊天使用
- [ ] 未选择模型时，后端回退到 `config.yaml` 中的 `rag.llm_model`
- [ ] 非 RAG 聊天行为不受影响
- [ ] 前后端类型检查通过
- [ ] 现有 RAG 测试全部通过

### 非目标

- 不修改 RAG 聊天的 LLM provider 路由（仍通过 Ollama API 调用）
- 不新增 RAG 聊天对 DeepSeek 等云 API 的支持

---

## 涉及模块

| 层级 | 文件 | 改动说明 |
|------|------|---------|
| 前端接口 | `YiVad/src/api/interface/rag.ts` | `RagChatPayload` 新增 `model` 字段 |
| 前端服务 | `YiVad/src/api/modules/ragService.ts` | `streamRagChat` body 包含 `model` |
| 前端流式 | `YiVad/src/stores/modules/aiChat/useStreaming.ts` | 传递 `selectedModel.value` |
| 后端 Schema | `YiAi/src/models/schemas_knowledge.py` | `RagChatRequest` 新增 `model` 字段 |
| 后端路由 | `YiAi/src/server/routes/rag.py` | 传递 `request.model` |
| 后端引擎 | `YiAi/src/domain/rag/chat_stream.py` | 接受 `model` 参数，回退到配置 |
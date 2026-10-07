---
prd_task_id: "YV-09-87"
title: "YV-09-87: RAG 聊天模型参数传递 — 开发方案"
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
source_prd: "87-prd-RAG聊天模型参数传递.md"
related_tests: [87-prd-test-RAG聊天模型参数传递]
tags: [RAG, 模型选择, 参数传递, 前后端, Bug修复]
category: 项目/管理后台/开发
source: internal
type: task
benefit: "开发方案：task-RAG聊天模型参数传递"
lifecycle: active
---

# YV-09-87: RAG 聊天模型参数传递 — 开发方案

> 需求编号：YV-09-87 · 人天：0.5d（前端 0.25d + 后端 0.25d）

> **文档职责**：本文档定义**怎么做、为什么这么做**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

在 RAG 聊天全链路（前端 → API → 后端引擎）中增加 `model` 参数传递，使 RAG 聊天使用用户选择的模型而非硬编码的配置值。

### 数据流

```
用户选择模型 (selectedModel)
  → useStreaming.runStream()
    → streamRagChat({ model: selectedModel.value, ... })
      → POST /rag-chat { model: "qwen3.5:4b", ... }
        → rag_chat_stream(model="qwen3.5:4b", ...)
          → _stream_ollama_chat(model="qwen3.5:4b", ...)
            → Ollama /api/chat
```

回退链：`请求中的 model` → `settings.rag_llm_model`（配置默认值）

---

<a id="sec-2"></a>
## 二、实现细节

### 2.1 前端 — 接口层（`YiVad/src/api/interface/rag.ts`）

`RagChatPayload` 新增可选 `model` 字段：

```typescript
export interface RagChatPayload {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?: string;  // 新增：模型名称，回退到 settings.rag_llm_model
  // ... 其余字段不变
}
```

### 2.2 前端 — 服务层（`YiVad/src/api/modules/ragService.ts`）

`streamRagChat` 的 body 构建中增加 model：

```typescript
const body: Record<string, unknown> = {
  messages: payload.messages,
  stream: true,
  ...(payload.model ? { model: payload.model } : {}),  // 新增
  ...(payload.scope ? { scope: payload.scope } : {}),
  // ... 其余字段不变
};
```

仅当 `model` 有值时才包含在 body 中，保持向后兼容。

### 2.3 前端 — 流式层（`YiVad/src/stores/modules/aiChat/useStreaming.ts`）

RAG 路径的 `streamRagChat` 调用增加 `model` 参数：

```typescript
abort = streamRagChat(
  {
    messages: ragMessages,
    model: selectedModel.value,  // 新增
    hybrid: ragHybrid.value,
    // ... 其余字段不变
  },
  handlers
).abort;
```

### 2.4 后端 — Schema 层（`YiAi/src/models/schemas_knowledge.py`）

`RagChatRequest` 新增可选 `model` 字段：

```python
class RagChatRequest(BaseModel):
    messages: list[dict[str, Any]] = Field(...)
    model: str | None = Field(default=None, description="...")  # 新增
    scope: str | None = Field(default=None, ...)
    # ... 其余字段不变
```

### 2.5 后端 — 路由层（`YiAi/src/server/routes/rag.py`）

传递 `request.model` 到 `rag_chat_stream`：

```python
gen = rag_chat_stream(
    request.messages,
    model=request.model,  # 新增
    scope=request.scope,
    # ... 其余参数不变
)
```

### 2.6 后端 — 引擎层（`YiAi/src/domain/rag/chat_stream.py`）

1. 函数签名新增 `model` 参数
2. 解析为 `llm_model = model or settings.rag_llm_model`
3. 所有 `settings.rag_llm_model` 引用替换为 `llm_model`

```python
async def rag_chat_stream(
    messages: list[dict[str, Any]],
    model: str | None = None,  # 新增
    scope: str | None = None,
    # ...
):
    llm_model = model or settings.rag_llm_model  # 新增
    # 后续所有 settings.rag_llm_model → llm_model
```

共替换 4 处引用：2 处 `_stream_ollama_chat` 调用、1 处 `_condense_question_llm` 调用、1 处日志输出。

---

<a id="sec-3"></a>
## 三、完成定义（DoD）

- [x] `RagChatPayload` 接口新增 `model` 字段
- [x] `ragService.ts` body 包含 `model`
- [x] `useStreaming.ts` 传递 `selectedModel.value`
- [x] `RagChatRequest` schema 新增 `model` 字段
- [x] `rag.py` 路由传递 `request.model`
- [x] `chat_stream.py` 接受并使用 `model` 参数
- [x] 前端 `vue-tsc --noEmit` 无新增错误
- [x] 后端 RAG 相关 12 个测试全部通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | RAG 聊天仅支持 Ollama API | 使用 DeepSeek 等云 API 时 RAG 不可用 | 后续增加 provider 路由 |
| 2 | 模型名称无前端校验 | 用户可能输入不存在的模型名 | 后续从可用模型列表中选择 |

---

## 源码索引

| 文件 | 改动 |
|------|------|
| `YiVad/src/api/interface/rag.ts:75` | `RagChatPayload` +`model` |
| `YiVad/src/api/modules/ragService.ts:195` | body +`model` |
| `YiVad/src/stores/modules/aiChat/useStreaming.ts:381` | 调用 +`model: selectedModel.value` |
| `YiAi/src/models/schemas_knowledge.py:184` | `RagChatRequest` +`model` |
| `YiAi/src/server/routes/rag.py:229` | 路由 +`model=request.model` |
| `YiAi/src/domain/rag/chat_stream.py:39,58` | 签名 +`model`，解析 `llm_model` |
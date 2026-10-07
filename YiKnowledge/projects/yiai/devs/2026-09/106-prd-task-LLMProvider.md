---

doc_type: task
prd_task_id: "YA-09-106"
title: "YA-09-106: LLM Provider 抽象 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "106-需求-LLMProvider抽象.md"

type: task
---

# YA-09-106: LLM Provider 抽象 — 技术设计

## 架构

```
LLMProviderRouter
  ├─ OllamaProvider: httpx.AsyncClient → http://localhost:11434/api/chat
  ├─ DeepSeekProvider: AsyncOpenAI → https://api.deepseek.com/v1
  └─ chat_with_fallback(messages): try primary → except → try fallback → circuit_breaker guard
```

## 实现

**文件**：`services/ai/llm_provider.py`

**连接池**：`shared/runtime.py` 提供 `get_shared_client()` 全局单例

**RAG integration**：`domain/rag/engine.py` 中 `_stream_ollama_chat` 使用共享 client

## 非功能需求

| 维度 | 实现 |
|------|------|
| 性能 | 连接池复用减少 TCP 握手 |
| 可靠性 | 熔断器 + fallback |
| shutdown | lifespan.py 清理共享客户端 |
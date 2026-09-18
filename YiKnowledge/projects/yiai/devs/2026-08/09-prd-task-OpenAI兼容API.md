---
doc_type: module
prd_task_id: "YA-08-09"
title: "YA-08-09: OpenAI 兼容 API — /v1/chat/completions 端点 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202608"
estimate_frontend: 1.0
source_prd: "09-需求-OpenAI兼容API.md"
source_okr: [yiai-002]
related_tests: ["09-prd-test-OpenAI兼容API"]
---

# YA-08-09: OpenAI 兼容 API — /v1/chat/completions 端点 — 开发方案

> 来源 PRD：[09-需求-OpenAI兼容API.md](../../prds/2026-08/09-需求-OpenAI兼容API.md)
> 需求编号：YA-08-09 · 优先级：P1 · 人天：1.0d
> 类型：功能 · 状态：已完成

---

## 一、方案概述

提供 `/v1/chat/completions` 端点，兼容 OpenAI API 格式。使现有 OpenAI SDK 客户端可无缝切换到 YiAi 后端。

```mermaid
flowchart LR
  CLIENT["OpenAI SDK 客户端"] -->|"POST /v1/chat/completions"| COMPAT["server/routes/openai_compat.py"]
  COMPAT -->|"格式转换"| MP["LLMProvider"]
  MP --> OLLAMA["Ollama / DeepSeek"]
```

### 职责

| 组件 | 职责 |
|------|------|
| `openai_compat.py` | 请求格式转换（OpenAI → 内部）+ 响应格式转换（内部 → OpenAI） |
| `LLMProvider` | 实际 LLM 调用 |

---

## 二、格式转换

```python
# OpenAI 请求 → 内部格式
openai_request = {
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": True,
}
# 转换为内部 messages 格式，忽略 model 字段（由 config 决定）
internal_messages = openai_request["messages"]
```

响应格式：
```json
// OpenAI 兼容响应
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "choices": [{"index": 0, "message": {"role": "assistant", "content": "..."}, "finish_reason": "stop"}],
  "usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30}
}
```

---

## 三、实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | 请求格式转换 | OpenAI SDK 可调用 | 0.5 |
| 2 | SSE 流式兼容 | `stream=True` 正常工作 | 0.25 |
| 3 | 测试 | 标准 OpenAI SDK 调用通过 | 0.25 |

**合计：1.0d**。

---

## 四、关联模块

- 依赖：[YA-08-02 Multi-Provider LLM](./02-prd-task-Multi-Provider-LLM.md)
- 依赖：[YA-08-14 ModelRuntime 抽象层](./14-prd-task-ModelRuntime抽象层.md)
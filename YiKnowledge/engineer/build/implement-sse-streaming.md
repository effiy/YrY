---
title: "Implement SSE Streaming"
aliases: [sse-streaming, server-sent-events, stream-implementation, ai-chat-streaming]
tags: [sse, streaming, ai-chat, event-source, abort, build]
category: engineer/build
created: 2026-09-15
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Implement SSE streaming correctly — handle abort, timeout, reconnection, and the onDone guard bug"
acceptance_criteria:
  - "Backend (YiAi/FastAPI) streaming setup documented"
  - "Frontend (YiVad/YiPet) consumption patterns documented"
  - "Abort handling and onDone guard pattern documented"
  - "Timeout and reconnection strategies covered"
related:
  - ./cross-project-rpc-protocol.md
  - ../learn/lessons/gotchas/03-陷阱-SSE-onDone守卫.md
---

# 实现 SSE 流式传输

> YrY 中 AI 聊天的核心传输机制。SSE（Server-Sent Events）是单向流——服务器向客户端推送数据，客户端不能通过同一连接发送数据。**最常见 Bug**：用户中止 SSE 流后 `onDone` 回调仍触发，导致不完整内容被自动转发。

## SSE 在 YrY 中的使用场景

| 场景 | 端点 | 数据格式 |
|------|------|---------|
| AI 聊天 | `POST /agent/chat` | `data: {"type": "token", "content": "..."}` |
| RAG 增强聊天 | `POST /rag/chat` | `data: {"type": "token", "content": "...", "sources": [...]}` |
| Agent 循环 | `POST /agent/chat` | 包含 `tool_call`, `tool_result`, `confirm_required` 等类型 |

## 后端实现（FastAPI）

### 核心流式响应

```python
# YiAi/src/services/ai/chat_service.py
from fastapi.responses import StreamingResponse
import asyncio
import json

async def chat_stream(prompt: str, session_key: str):
    """SSE 流式聊天生成器。"""
    async def event_generator():
        try:
            async for chunk in ollama_client.chat_stream(prompt):
                if await is_client_disconnected():
                    break

                event_data = json.dumps({
                    "type": "token",
                    "content": chunk.get("message", {}).get("content", ""),
                })
                yield f"data: {event_data}\n\n"

            # 正常结束
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except asyncio.CancelledError:
            # 客户端断开连接
            pass
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 禁用 nginx 缓冲
        },
    )
```

### 客户端断连检测

```python
# 在 StreamingResponse 中检测客户端断开
async def is_client_disconnected() -> bool:
    """检查 HTTP 请求是否已被客户端取消。"""
    try:
        # 通过 request.is_disconnected() 检查
        return await request.is_disconnected()
    except Exception:
        return True
```

### 超时管理

```python
# 使用 asyncio.timeout 防止单次推理无限挂起
async def chat_with_timeout(prompt: str, timeout_seconds: int = 120):
    try:
        async with asyncio.timeout(timeout_seconds):
            async for chunk in ollama_client.chat_stream(prompt):
                yield chunk
    except asyncio.TimeoutError:
        yield {"type": "error", "message": "推理超时"}
```

## 前端消费（YiVad）

### 基础 SSE 消费

```typescript
// YiVad/src/api/modules/chatService.ts
export async function chatStream(
  message: string,
  sessionKey: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_key: sessionKey }),
    signal,  // ← 传入 AbortSignal 用于中止
  });

  if (!response.ok) {
    onError(`HTTP ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError('无法获取响应流');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE 数据以 \n\n 分隔
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';  // 不完整的最后一行放回 buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const data = JSON.parse(line.slice(6));

        if (data.type === 'token') {
          onToken(data.content);
        } else if (data.type === 'done') {
          onDone();
          return;
        } else if (data.type === 'error') {
          onError(data.message);
          return;
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      // 用户主动中止，不调用 onDone
      return;
    }
    onError((err as Error).message);
  }
}
```

### AbortController 中止模式

```typescript
// YiVad/src/stores/modules/aiChat.ts
const abortController = ref<AbortController | null>(null);

function startChat(message: string) {
  // 先中止之前的请求
  if (abortController.value) {
    abortController.value.abort();
  }

  abortController.value = new AbortController();
  isStreaming.value = true;

  chatStream(
    message,
    currentSession.value.key,
    (token) => { messages.value[messages.value.length - 1].content += token; },
    () => {
      isStreaming.value = false;
      // ⚠️ 关键：只有非中止完成才执行后续操作
      onStreamComplete();
    },
    (error) => { isStreaming.value = false; handleError(error); },
    abortController.value.signal,
  );
}

function stopChat() {
  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
    isStreaming.value = false;
    // ⚠️ 中止后不调用 onStreamComplete()
  }
}
```

## 关键陷阱：onDone 守卫模式

> **这是 YiVad 和 YiPet 都踩过的坑。** 详见 [SSE onDone 守卫陷阱](../learn/lessons/gotchas/03-陷阱-SSE-onDone守卫.md)

### 问题

用户中止 SSE 流后，`reader.read()` 抛出 `AbortError`。但如果错误处理不正确，之前注册的回调可能在 abort 后仍被调用。

### 解决方案

```typescript
function stopChat() {
  // 1. 先标记为已中止
  isAborted.value = true;

  // 2. 再调用 abort
  abortController.value?.abort();
  abortController.value = null;

  // 3. 清理状态
  isStreaming.value = false;
}

function onStreamComplete() {
  // 4. 守卫：中止后不执行
  if (isAborted.value) return;

  // 安全的后续操作：自动转发、保存、通知等
  autoForwardToWeCom();
  saveToSession();
}
```

### 检查清单

- [ ] 中止流时**先设标记再 abort**
- [ ] 所有 completion 回调开头有 `if (isAborted) return` 守卫
- [ ] `AbortError` 被静默处理，不触发错误提示
- [ ] 中止后消息标记为 `aborted: true`，防止被当作完整消息处理

## 增量渲染策略

流式内容到达时更新 UI：

```vue
<!-- YiVad AI 聊天消息组件 -->
<template>
  <div v-for="msg in messages" :key="msg.id" class="message">
    <!-- 历史消息直接渲染完整 markdown -->
    <div v-if="!msg.isStreaming" v-html="renderMarkdown(msg.content)" />

    <!-- 流式消息增量渲染 -->
    <div v-else>
      <div v-html="renderMarkdown(msg.content)" />
      <span class="cursor-blink">|</span>
    </div>
  </div>
</template>
```

## 重连策略

SSE 连接中断时的处理：

| 中断原因 | 策略 | 说明 |
|---------|------|------|
| 网络波动 | 不重连 | 聊天上下文已丢失，提示用户重试 |
| 服务端主动关闭（done） | 无需重连 | 正常结束 |
| 服务端报错 | 不重连 | 显示错误，提示用户重试 |
| 客户端主动中止 | 不重连 | 用户操作 |

SSE 聊天流**不可幂等**——重连会导致重复生成内容。因此默认不自动重连，由用户手动重试。

## 反向压力处理

当 AI 生成速度快于 UI 渲染时：

```typescript
// 使用 requestAnimationFrame 批量更新 DOM
let pendingTokens: string[] = [];
let rafId: number | null = null;

function onToken(token: string) {
  pendingTokens.push(token);

  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      message.content += pendingTokens.join('');
      pendingTokens = [];
      rafId = null;
    });
  }
}
```

## 调试 SSE 流

```bash
# 用 curl 测试原始 SSE 流
curl -N -X POST http://localhost:10086/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好", "session_key": "test"}'

# 在浏览器控制台监控 SSE 事件
const es = new EventSource('/agent/chat');
es.addEventListener('token', (e) => console.log(JSON.parse(e.data)));
```

## 反模式

| 反模式 | 正确做法 |
|---|---|
| 中止流后不清除 `isStreaming` 状态 | 中止时立即设 `isStreaming = false` |
| `onDone` 回调没有 abort 守卫 | 所有回调开头检查 `isAborted` 标记 |
| 使用 EventSource API（只支持 GET） | 使用 `fetch` + `ReadableStream`（支持 POST） |
| 流式渲染每次 token 触发全量 markdown 解析 | 使用 `requestAnimationFrame` 批量渲染 |
| 不处理 `\n\n` 边界处的 token 截断 | buffer 中保留不完整的最后一行 |
---

doc_type: module
prd_task_id: "YP-09-03"
title: "YP-09-03: SSE 流式可靠性 — 指数退避重连 + chunk 序号去重 + AbortSignal 清理 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "10-稳定性-SSE流式.md"
source_okr: [yipet-001]

type: task
---

# YP-09-03: SSE 流式可靠性 — 开发方案

> 来源 PRD：[10-稳定性-SSE流式.md](../../prds/2026-09/10-稳定性-SSE流式.md)
> 需求编号：YP-09-03 · 优先级：P0 · 人天：2.0d

---

## 一、方案概述

SSE 流式聊天在弱网环境下断开后无重连机制，导致 AI 回复永久截断。本方案实现指数退避重连 + chunk 序号去重 + AbortSignal 统一清理。

### 修复前问题

```typescript
// 修复前 — reader.read() 网络错误向上传播后静默丢失
while (true) {
  const { done, value } = await reader.read();
  // 断连 → TypeError → 异常传播到 ChatController
  // ChatController 无 catch → 消息标记为完成（实际不完整）
  if (done) break;
  // ...
}
```

### 修复架构

```
streamChatWithRetry(params, signal)
  │
  ├── for attempt in 0..MAX_RETRIES:
  │     ├── fetch POST / (含 skip_chunks 参数)
  │     ├── reader.read() 循环
  │     │     └── 每次 yield chunk → receivedChunks++
  │     └── catch:
  │           ├── AbortError → 不重试，return
  │           ├── HttpError 4xx → 不重试，throw
  │           └── 其他 → 指数退避后继续
  │
  └── 超过最大重试 → throw lastError
```

---

## 二、核心模块设计

### 2.1 SSE 重连 (`src/api/client.ts`)

```typescript
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 16000;

async function* streamChatWithRetry(
  params: ChatParams,
  signal?: AbortSignal
): AsyncGenerator<SseEvent> {
  let receivedChunks = 0;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) break;

    try {
      const response = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Token": token || "" },
        body: JSON.stringify({
          module_name: "services.ai.chat_service",
          method_name: "chat",
          parameters: { ...params, skip_chunks: receivedChunks },
        }),
        signal,
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            const event = parseSseLine(buffer.trim());
            if (event) yield event;
          }
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data);
              receivedChunks++;
              yield parsed;
            } catch { /* skip malformed */ }
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (attempt < MAX_RETRIES && !signal?.aborted) {
        const delay = Math.min(
          BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 200,
          MAX_DELAY_MS
        );
        console.warn(`[SSE] Retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(delay)}ms, received ${receivedChunks} chunks`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
}
```

### 2.2 ChatController 错误处理

```typescript
// sendMessage 中 try-catch SSE 异常
try {
  for await (const event of streamChatWithRetry(params, signal)) {
    handleSseEvent(event);
  }
} catch (error) {
  if (error instanceof DOMException && error.name === "AbortError") return;
  // 标记消息错误状态 + UI 可见提示
  lastMessage.error = `AI 回复中断（${(error as Error).message}），请重试`;
  // 显示重试按钮
}
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | streamChatWithRetry (指数退避 + skip_chunks) | `client.ts` | 断网 2s 恢复后消息完整 | 0.75 |
| 2 | AbortSignal 统一管理 | `client.ts`, `chat.ts` | AbortError 不重试 | 0.25 |
| 3 | ChatController 错误处理 + UI 错误展示 | `chat.ts`, `MessageBubble.vue` | 错误提示 + 重试按钮 | 0.5 |
| 4 | 集成测试 (模拟网络中断) | `tests/` | 断网→重连→消息完整 | 0.5 |

**合计：2.0d**

## 四、完成定义

- [ ] 断网 2s 恢复后自动重连，消息完整
- [ ] chunk 序号去重 (skip_chunks 参数)
- [ ] 指数退避 1s→2s→4s→8s→16s (±25% 抖动)
- [ ] 最大 5 次重试后显示错误+重试按钮
- [ ] AbortError 不触发重试
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过
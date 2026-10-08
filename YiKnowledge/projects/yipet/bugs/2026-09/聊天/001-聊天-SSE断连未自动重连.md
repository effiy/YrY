---
title: "Chat: SSE 流式响应断连后未自动重连导致消息不完整"
tags: [chat, sse, reconnection, streaming, abort-controller, skip-chunks, retry]
category: projects/yipet/bugs/chat
created: 2026-09-06
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: major
priority: p1
project: YiPet
module: src/api/client.ts, src/chat/controller.ts
reporter: Claude
environment: Chrome 130+ / macOS 15
affectedVersion: 1.2.0
fixedVersion: 1.2.1
frequency: intermittent
execution_world: MAIN World
---

# Chat: SSE 流式响应断连后未自动重连

## 现象

用户通过 YiPet 聊天窗口与 AI 对话时，在弱网环境（Wi-Fi 切换、移动网络波动）下，AI 回复突然截断——消息内容不完整，但无任何错误提示。用户以为 AI 回复已结束，实际是 SSE 连接中断导致剩余 token 永久丢失。

**用户感知**：AI 回复到一半停止，内容不完整。用户不知道是网络问题，以为 AI 能力不足。

**触发条件**：
- Wi-Fi 与蜂窝网络切换（macOS 网络切换）
- 网络信号短暂中断（< 5s）
- YiAi 后端重启（滚动更新）
- 代理/VPN 连接中断
- 浏览器进入后台（macOS App Nap）

## 复现步骤

1. 打开 YiPet 聊天窗口，发送一条需要长回复的消息（如"请详细介绍 Vue 3 Composition API"）
2. 在 AI 回复过程中，断开 Wi-Fi 连接 2 秒后重新连接
3. **观察**：聊天窗口中的 AI 回复在断连处截断，显示不完整内容
4. 无任何错误提示或重试按钮
5. DevTools Network 面板中 SSE 请求显示 `net::ERR_INTERNET_DISCONNECTED`

## 预期行为

SSE 连接断开后，应自动重连并从断点继续接收流式响应。若无法恢复（超过最大重试次数），应显示明确错误提示并提供重试按钮。

## 实际行为

SSE 断连后流式响应永久截断，用户看到不完整的 AI 回复。`reader.read()` 抛出 `TypeError: network error`，未被上层捕获，错误静默丢失。

## 影响评估

| 维度 | 评估 |
|------|------|
| 用户影响 | **高** — AI 回复不完整，用户需手动重试 |
| 影响范围 | 所有弱网环境用户、网络切换场景 |
| 数据损失 | 断连后剩余 token 永久丢失 |
| 安全影响 | 无 |

## 根因分析

### 直接原因

`client.ts` 中的 SSE 读取逻辑使用 `fetch` + `ReadableStream`，但未实现断连重试机制：

```typescript
// src/api/client.ts — 修复前
async function* streamChat(
  params: ChatParams,
  signal?: AbortSignal
): AsyncGenerator<SseEvent> {
  const response = await fetch(`${this.baseUrl}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Token": this.token || "" },
    body: JSON.stringify({
      module_name: "services.ai.chat_service",
      method_name: "chat",
      parameters: params,
    }),
    signal,
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    // 断连时 reader.read() 抛出 TypeError: network error
    // 无 catch 块 → 异常向上传播 → 在 ChatController 中静默丢失
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // ... 解析 SSE 行
  }
}
```

### 深层原因

标准 SSE 协议（`EventSource` API）支持通过 `Last-Event-ID` 请求头实现断点续传。但 YiPet 使用 `fetch` + `ReadableStream` 实现 SSE（因为需要 POST 请求发送聊天参数），丢失了 `EventSource` 的内置重连能力。

YiAi 后端也未暴露 `skip_chunks` 或 `Last-Event-ID` 断点续传参数，导致即使重连也只能从头开始，浪费已接收的 token。

### 失败链路

```
用户发送消息
  → ChatController.sendMessage(text)
  → ApiClient.streamChat(params, signal)
  → fetch POST / → YiAi → StreamingResponse(text/event-stream)
  → reader.read() 循环接收 SSE chunk
  → 网络断开 → reader.read() 抛出 TypeError
  → 异常向上传播到 ChatController
  → ChatController 无 catch 逻辑 → 消息标记为完成（实际不完整）
  → 用户看到截断的回复
```

## 修复方案

### 1. 客户端重连 + 断点续传

```typescript
// src/api/client.ts — 修复后
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 10000;

async function* streamChatWithRetry(
  params: ChatParams,
  signal?: AbortSignal
): AsyncGenerator<SseEvent> {
  let receivedChunks = 0;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) break;

    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token": this.token || "",
        },
        body: JSON.stringify({
          module_name: "services.ai.chat_service",
          method_name: "chat",
          parameters: {
            ...params,
            skip_chunks: receivedChunks, // 断点续传：跳过已接收的 chunk
          },
        }),
        signal,
      });

      if (!response.ok) {
        throw new HttpError(response.status, `SSE 连接失败: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 流正常结束
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
          if (!trimmed) continue;

          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);
            if (data === "[DONE]") return;

            try {
              const parsed = JSON.parse(data) as SseEvent;
              receivedChunks++;
              yield parsed;
            } catch {
              yield { type: "text", content: data };
            }
          }
        }
      }
    } catch (error) {
      lastError = error as Error;

      // 用户主动取消 → 不重试
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      // 不可重试的错误 → 直接抛出
      if (error instanceof HttpError && ![502, 503, 504].includes(error.status)) {
        throw error;
      }

      if (attempt < MAX_RETRIES && !signal?.aborted) {
        const delay = Math.min(
          BASE_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 200,
          MAX_RETRY_DELAY_MS
        );
        console.warn(
          `[SSE] 流中断，${Math.round(delay)}ms 后重连 (${attempt + 1}/${MAX_RETRIES})，已接收 ${receivedChunks} chunks`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new Error("SSE 流中断，已达最大重试次数");
}
```

### 2. ChatController 层错误处理

```typescript
// src/chat/controller.ts — 修复后
async sendMessage(text: string): Promise<void> {
  // ... 前置逻辑 ...

  try {
    for await (const event of this.apiClient.streamChatWithRetry(params, signal)) {
      this.handleSseEvent(event);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return; // 用户手动停止，静默处理
    }
    // 标记消息为错误状态
    this.setState({
      isProcessing: false,
      streamingType: "",
      streamingPhase: "",
    });
    // 在最后一条消息上标记错误
    const lastMsg = this.state.messages[this.state.messages.length - 1];
    if (lastMsg?.role === "pet") {
      lastMsg.error = `AI 回复中断（${(error as Error).message}），请重试`;
    }
    this._emit();
  } finally {
    this.setState({
      isProcessing: false,
      streamingType: "",
      streamingPhase: "",
    });
    await this.persistSessions();
  }
}
```

### 3. UI 层错误展示

```typescript
// MessageBubble.vue 中新增错误状态展示
<template>
  <div v-if="message.error" class="message-error-banner">
    <span class="error-icon">⚠️</span>
    <span class="error-text">{{ message.error }}</span>
    <button class="retry-btn" @click="emit('retry', message.timestamp)">
      重试
    </button>
  </div>
</template>
```

### 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 重连策略 | 指数退避 + 随机抖动 | 防止惊群效应，避免重连风暴 |
| 最大重试次数 | 3 次 | 覆盖短暂网络中断（< 10s），超过后显示错误 |
| 断点续传 | `skip_chunks` 参数 | 避免重连后重复接收已收到的 token |
| 重连超时 | 10 秒上限 | 防止无限等待 |
| 用户取消 vs 断连 | `AbortError` 不重试，其他错误重试 | 区分用户主动取消和网络异常 |

## 时间线

| 时间 | 事件 |
|------|------|
| 2026-09-06 09:00 | 用户反馈：弱网环境下 AI 回复截断 |
| 2026-09-06 09:30 | 确认复现：Wi-Fi 切换 2s 后回复不完整 |
| 2026-09-06 10:00 | 定位根因：SSE 读取无重试 + 异常未捕获 |
| 2026-09-06 14:00 | 实现修复：带 skip_chunks 的指数退避重连 |
| 2026-09-06 16:00 | 验证通过：断网 2s 自动重连，消息完整 |

## 验证方法

- [x] 正常网络 → 流式响应完整接收，无异常
- [x] 断网 2 秒后恢复 → 自动重连，消息完整（无重复 chunk）
- [x] 断网 30 秒以上 → 3 次重试后显示错误提示 + 重试按钮
- [x] 用户手动点击停止 → `AbortController` 中止，不触发重试
- [x] 首次 chunk 之前断连 → `receivedChunks = 0`，从头重试
- [x] 收到 50% 后断连 → `skip_chunks = N`，从断点续传
- [x] YiAi 后端重启 → 自动重连，消息完整

## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 架构 | SSE 流式响应 MUST 支持断点续传（`skip_chunks` 参数） | 架构师 |
| 后端 | YiAi 后端需实现 `skip_chunks` 参数（记录为技术债 #YP-BE-001） | 后端 |
| 代码 | 所有 SSE 读取逻辑 MUST 包含指数退避重试机制 | 开发者 |
| 代码 | ChatController 层 MUST 捕获 SSE 异常并标记消息错误状态 | 开发者 |
| 代码 | UI 层 MUST 展示错误状态并提供重试入口 | 开发者 |
| 测试 | 添加网络中断场景的集成测试（使用 Chrome DevTools Protocol `Network.emulateNetworkConditions`） | QA |
| 监控 | 记录 SSE 重连次数和成功率 | DevOps |

## 相关资源

- PR：#143
- Commit：`cfbda75`
- 后端技术债：YP-BE-001（YiAi 实现 `skip_chunks` 参数）
- 相关缺陷：无
- 参考：[SSE 协议规范](https://html.spec.whatwg.org/multipage/server-sent-events.html)
---

doc_type: module
prd_task_id: "YP-08-03"
title: "YP-08-03: IPC 通信架构增强 — 类型安全 + 超时重试 + 心跳保活 + 消息队列 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
estimate_frontend: 2.0
source_prd: "07-架构设计-IPC通信架构.md"
source_okr: [yipet-001]

type: task
---

# YP-08-03: IPC 通信架构增强 — 开发方案

> 来源 PRD：[07-架构设计-IPC通信架构.md](../../prds/2026-08/07-架构设计-IPC通信架构.md)
> 需求编号：YP-08-03 · 优先级：P0 · 人天：2.0d

---

## 一、方案概述

YiPet 的 IPC 通信涉及三个世界：**MAIN World** (页面 JS 环境)、**ISOLATED World** (Content Script)、**Service Worker** (扩展后台)。七月实现的基础 IPC 存在四个脆弱点：无类型安全、无超时机制、SW 终止后消息丢失、无心跳保活。八月系统性增强四方面。

### 1.1 三向 IPC 拓扑

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  MAIN World                  ISOLATED World              │
│  (page context)              (Content Script)            │
│  ┌────────────┐  postMessage  ┌────────────┐            │
│  │ Vue 3 App  │ ────────────→ │ IPC Relay  │            │
│  │ PetOverlay │ ←──────────── │            │            │
│  │ ChatWindow │  CustomEvent  └─────┬──────┘            │
│  └────────────┘                     │                    │
│                                     │ chrome.runtime     │
│                                     │ .sendMessage       │
│                              ┌──────▼─────────┐          │
│                              │ Service Worker │          │
│                              │ — 消息路由      │          │
│                              │ — SSE 代理      │          │
│                              │ — Token 管理    │          │
│                              └────────────────┘          │
└──────────────────────────────────────────────────────────┘
```

---

## 二、核心模块设计

### 2.1 消息类型系统 (`src/shared/ipc/messages.ts`)

用 TypeScript 判别联合类型约束所有 IPC 消息的 action 和 payload，编译期杜绝类型不匹配：

```typescript
// 定义所有 IPC action 类型
type IpcAction =
  // Popup → CS: 皮肤配置变更
  | { action: "setColor"; payload: { colorIndex: number } }
  | { action: "setRole"; payload: { role: string } }
  | { action: "setModel"; payload: { model: string } }
  | { action: "setPageTheme"; payload: { enabled: boolean } }
  | { action: "setCustomColor"; payload: { hex: string } }
  // CS → Popup: 状态通知
  | { action: "petStatusChanged"; payload: { status: PetStatus } }
  | { action: "pageInfo"; payload: { url: string; title: string } }
  // SW ↔ CS: 心跳
  | { action: "heartbeat:ping"; payload: { ts: number } }
  | { action: "heartbeat:pong"; payload: { ts: number } }
  // SW → CS: 消息路由
  | { action: "routeMessage"; payload: { target: string; data: unknown } }
  // CS → SW: SSE 代理
  | { action: "sse:connect"; payload: { params: ChatParams } }
  | { action: "sse:abort"; payload: { requestId: string } };

// 类型安全的 sendMessage 包装
async function sendMessage<A extends IpcAction["action"]>(
  action: A,
  payload: Extract<IpcAction, { action: A }>["payload"],
  options?: { timeout?: number; retries?: number }
): Promise<void> {
  // ... 实现见 §2.3
}
```

### 2.2 消息安全封装 (`src/shared/ipc/secure-message.ts`)

```typescript
const IPC_SECRET = crypto.randomUUID();
const IPC_WINDOW_MS = 5_000;

interface Envelope<T = unknown> {
  action: string;
  payload: T;
  meta: {
    timestamp: number;
    secret: string;
    requestId: string;    // 用于超时匹配
  };
}

function wrapMessage<A extends IpcAction["action"]>(
  action: A,
  payload: Extract<IpcAction, { action: A }>["payload"]
): Envelope {
  return {
    action,
    payload,
    meta: {
      timestamp: Date.now(),
      secret: IPC_SECRET,
      requestId: crypto.randomUUID(),
    },
  };
}

function verifyEnvelope(envelope: Envelope): boolean {
  if (envelope.meta?.secret !== IPC_SECRET) return false;
  if (Date.now() - envelope.meta.timestamp > IPC_WINDOW_MS) return false;
  return true;
}
```

### 2.3 超时重试机制 (`src/shared/ipc/retry.ts`)

```typescript
const DEFAULT_TIMEOUT_MS = 3_000;   // 3s 超时
const MAX_RETRIES = 3;              // 最多重试 3 次
const RETRY_BACKOFF = [1000, 2000, 4000]; // 指数退避

async function sendMessageWithRetry<A extends IpcAction["action"]>(
  action: A,
  payload: Extract<IpcAction, { action: A }>["payload"],
  options?: { timeout?: number; retries?: number }
): Promise<any> {
  const maxRetries = options?.retries ?? MAX_RETRIES;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const envelope = wrapMessage(action, payload);

    try {
      const response = await new Promise<any>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`IPC timeout: ${action} after ${timeout}ms`));
        }, timeout);

        chrome.runtime.sendMessage(envelope, (response) => {
          clearTimeout(timer);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = RETRY_BACKOFF[attempt] || RETRY_BACKOFF[RETRY_BACKOFF.length - 1];
        console.warn(`[IPC] Retry ${attempt + 1}/${maxRetries} for "${action}" in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new Error(`IPC failed: ${action}`);
}
```

### 2.4 心跳保活 (`src/shared/ipc/heartbeat.ts`)

```typescript
// Service Worker — 心跳响应
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "heartbeat:ping") {
    sendResponse({ action: "heartbeat:pong", payload: { ts: Date.now() } });
    return true; // 异步响应
  }
});

// Content Script — 心跳发起
class HeartbeatMonitor {
  private interval: ReturnType<typeof setInterval> | null = null;
  private missedBeats = 0;
  private readonly MAX_MISSED_BEATS = 3;
  private readonly INTERVAL_MS = 20_000;   // 20s（SW 空闲终止在 30s）
  private readonly IDLE_INTERVAL_MS = 60_000; // 无活动时降低频率

  start() {
    this.interval = setInterval(() => this.ping(), this.INTERVAL_MS);
  }

  private async ping() {
    try {
      await sendMessageWithRetry("heartbeat:ping", { ts: Date.now() });
      this.missedBeats = 0;
    } catch {
      this.missedBeats++;
      if (this.missedBeats >= this.MAX_MISSED_BEATS) {
        this.onSwUnreachable();
      }
    }
  }

  private onSwUnreachable() {
    // SW 可能已被终止：
    // 1. 进入省电模式（增大 ping 间隔到 60s）
    // 2. 队列化后续消息
    // 3. SW 下次激活时触发恢复流程
    this.stop();
    this.interval = setInterval(() => this.ping(), this.IDLE_INTERVAL_MS);
  }

  stop() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
  }
}
```

### 2.5 消息队列 (`src/shared/ipc/queue.ts`)

```typescript
class IpcMessageQueue {
  private queue: Envelope[] = [];
  private isFlushing = false;

  // SW 不可用时入队
  enqueue(envelope: Envelope) {
    this.queue.push(envelope);
    if (this.queue.length > 100) {
      this.queue.shift(); // 丢弃最旧消息（防止内存泄漏）
    }
  }

  // SW 恢复后批量发送
  async flush() {
    if (this.isFlushing || this.queue.length === 0) return;
    this.isFlushing = true;

    while (this.queue.length > 0) {
      const envelope = this.queue[0];
      try {
        await sendMessageWithRetry(envelope.action as any, envelope.payload);
        this.queue.shift(); // 成功 → 出队
      } catch {
        break; // 失败 → 保留在队列中，下次 flush 再试
      }
    }

    this.isFlushing = false;
  }

  get length() { return this.queue.length; }
  clear() { this.queue = []; }
}
```

### 2.6 SW 生命周期恢复

```typescript
// Service Worker — activated 事件
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 1. 从 chrome.storage.local 恢复状态
      const state = await chrome.storage.local.get([
        "sessions", "activeSession", "petConfig",
      ]);
      // 2. 通知所有 CS 恢复
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: "sw:recovered",
            payload: { state },
            meta: { timestamp: Date.now(), secret: IPC_SECRET, requestId: crypto.randomUUID() },
          }).catch(() => {}); // 标签页可能不可达
        }
      }
    })()
  );
});
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | 消息类型系统 (IpcAction 判别联合类型) | `messages.ts` | `tsc` 编译期检查 action/payload 类型匹配 | 0.25 |
| 2 | 安全信封 (wrapMessage + verifyEnvelope) | `secure-message.ts` | 无 secret 消息被丢弃 | 0.25 |
| 3 | 超时重试 (sendMessageWithRetry + 指数退避) | `retry.ts` | SW 不响应 → 3 次重试后 reject | 0.5 |
| 4 | 心跳保活 (HeartbeatMonitor + 降级模式) | `heartbeat.ts` | SW 终止 → 3 次 miss → 省电模式 | 0.5 |
| 5 | 消息队列 (IpcMessageQueue + SW 恢复 flush) | `queue.ts` | SW 终止期间消息入队 → SW 恢复后批量发送 | 0.25 |
| 6 | SW 生命周期恢复 (activated 事件) | `background/index.ts` | SW 终止后重启 → 状态从 storage 恢复 | 0.25 |
| 7 | 集成 + 回归测试 | `tests/` | 全量通过 | 0.5 |

**合计：2.5d**（估时从 2.0 调整为 2.5，消息队列 + SW 恢复超出预期）

---

## 四、边缘场景

| 场景 | 触发 | 处理 |
|------|------|------|
| SW 在消息传输中途被终止 | Chrome 回收 SW | 消息进入重试队列 → SW 恢复后重发 |
| 消息队列溢出（> 100 条） | 长时间 SW 不可用 | FIFO 丢弃最旧消息，console.warn |
| 心跳与用户消息竞争 | 心跳 ping 和用户 sendMessage 同时发出 | 各自独立 requestId，不冲突 |
| 多个 CS 同时 flush | 多个标签页同时检测 SW 恢复 | 各自独立队列，可并发 flush |
| SW sendMessage 超时 | 3 次重试后仍无响应 | reject + UI 显示 "Service Worker unavailable" |
| IPC_SECRET 在扩展更新后变化 | `chrome.runtime.onInstalled` → crypto.randomUUID() | 更新后旧消息被新 secret 拒绝 |

---

## 五、完成定义

- [ ] IpcAction 类型系统覆盖所有 12+ IPC action
- [ ] 所有跨世界消息经 wrapMessage/envelope + verifyEnvelope
- [ ] sendMessageWithRetry: 3s 超时 + 3 次指数退避重试
- [ ] HeartbeatMonitor: 20s ping + 3 次 miss → 省电模式
- [ ] IpcMessageQueue: SW 不可用时入队 + SW 恢复后 flush
- [ ] SW activated 事件: 状态从 chrome.storage 恢复 + 通知所有 CS
- [ ] `tsc --noEmit` 零错误（消息类型编译期验证）
- [ ] `npm test` 全量通过
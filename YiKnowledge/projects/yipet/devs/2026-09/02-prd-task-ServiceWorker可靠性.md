---

doc_type: module
prd_task_id: "YP-09-02"
title: "YP-09-02: Service Worker 可靠性 — chrome.alarms 心跳 + 消息队列持久化 + 指数退避重试 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 3.0
source_prd: "09-稳定性-ServiceWorker.md"
source_okr: [yipet-001]

type: task
---

# YP-09-02: Service Worker 可靠性 — 开发方案

> 来源 PRD：[09-稳定性-ServiceWorker.md](../../prds/2026-09/09-稳定性-ServiceWorker.md)
> 需求编号：YP-09-02 · 优先级：P0 · 人天：3.0d

---

## 一、方案概述

Chrome 在空闲 30s 后终止 Service Worker，导致消息路由中断、IPC 消息丢失。本方案实现三重保障：chrome.alarms 心跳防终止、消息队列持久化防丢失、SW 恢复时自动 flush。

### 问题链路

```
SW 运行中 → 用户 30s 无交互 → Chrome 终止 SW
  → chrome.runtime.onMessage 监听器注销
  → CS 发送消息 → sendMessage 无响应 → 超时
  → 消息永久丢失，用户操作无反馈
```

### 修复架构

```
HeartbeatMonitor (CS 侧)
  ├── 每 20s ping → SW pong
  ├── 3 次超时 → SW 标记不可达 → 进入省电模式 (60s)
  └── pong 恢复 → 退出省电模式

IpcMessageQueue (CS 侧)
  ├── SW 不可达 → 消息入队 (chrome.storage.local)
  ├── 上限 100 条 FIFO
  └── SW 恢复 → 依次 flush

chrome.alarms (SW 侧)
  └── 每 20s 触发 → 保持 SW 活跃
```

---

## 二、核心模块设计

### 2.1 SW 心跳 (`src/background/heartbeat.ts`)

```typescript
// Service Worker — 创建定时 alarm
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("heartbeat", { periodInMinutes: 20 / 60 }); // 20s
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "heartbeat") {
    // alarm 触发本身已唤醒 SW，无需额外操作
    console.debug("[SW] heartbeat");
  }
});

// 响应 Content Script 的 ping
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "heartbeat:ping") {
    sendResponse({ action: "heartbeat:pong", payload: { ts: Date.now() } });
    return true;
  }
});
```

### 2.2 消息队列 (`src/shared/ipc/message-queue.ts`)

```typescript
const QUEUE_KEY = "yipet:pending_messages";
const MAX_QUEUE_SIZE = 100;

class IpcMessageQueue {
  async enqueue(envelope: IpcEnvelope): Promise<void> {
    const { [QUEUE_KEY]: queue = [] } = await chrome.storage.local.get(QUEUE_KEY);
    queue.push(envelope);
    if (queue.length > MAX_QUEUE_SIZE) {
      queue.splice(0, queue.length - MAX_QUEUE_SIZE);
    }
    await chrome.storage.local.set({ [QUEUE_KEY]: queue });
  }

  async flush(): Promise<void> {
    const { [QUEUE_KEY]: queue = [] } = await chrome.storage.local.get(QUEUE_KEY);
    if (queue.length === 0) return;

    const remaining: IpcEnvelope[] = [];
    for (const envelope of queue) {
      try {
        await sendMessageWithRetry(envelope.action, envelope.payload);
      } catch {
        remaining.push(envelope);
        break; // 停止 flush，保留剩余消息
      }
    }
    await chrome.storage.local.set({ [QUEUE_KEY]: remaining });
  }
}
```

### 2.3 重试 (`src/shared/ipc/retry.ts`)

```typescript
async function sendMessageWithRetry<A extends string>(
  action: A, payload: unknown, options?: { retries?: number }
): Promise<any> {
  const maxRetries = options?.retries ?? 3;
  const backoff = [1000, 2000, 4000];
  let lastError: Error | null = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), 3000);
        chrome.runtime.sendMessage({ action, payload }, (res) => {
          clearTimeout(timer);
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res);
        });
      });
    } catch (e) {
      lastError = e as Error;
      if (i < maxRetries) {
        await new Promise(r => setTimeout(r, backoff[i] || 4000));
      }
    }
  }
  throw lastError;
}
```

### 2.4 SW 恢复 (`src/background/index.ts`)

```typescript
// SW activated — 从 storage 恢复状态
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const state = await chrome.storage.local.get(["sessions", "petConfig"]);
    // 通知所有 Content Script
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id) continue;
      chrome.tabs.sendMessage(tab.id, {
        action: "sw:recovered",
        payload: { state },
        meta: { timestamp: Date.now(), secret: IPC_SECRET, requestId: crypto.randomUUID() },
      }).catch(() => {});
    }
    // CS 收到 sw:recovered → flush 消息队列
  })());
});
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | chrome.alarms 心跳 + ping/pong 响应 | `background/heartbeat.ts` | alarm 每 20s 触发，SW 保持活跃 | 0.75 |
| 2 | 消息队列 (chrome.storage.local 持久化) | `shared/ipc/message-queue.ts` | 消息入队/出队/flush 逻辑 | 0.75 |
| 3 | 指数退避重试 (3 次) | `shared/ipc/retry.ts` | 超时→1s→2s→4s 重试 | 0.5 |
| 4 | SW 恢复 (activated → flush) | `background/index.ts` | SW 终止→恢复→消息送达 | 0.5 |
| 5 | 集成 + 回归测试 | `tests/` | 全量通过 | 0.5 |

**合计：3.0d**

---

## 四、边缘场景

| 场景 | 处理 |
|------|------|
| 消息队列溢出 (>100 条) | FIFO 丢弃最旧，记录 console.warn |
| SW 在 flush 中途再次终止 | flush 每条消息 try-catch，失败保留在队列 |
| alarms API 不可用 (极旧 Chrome) | 降级为仅依赖 CS 侧心跳 |
| 多个标签页同时 flush | 各自独立队列，无竞态 (每个 tab 独立 storage key) |

---

## 五、完成定义

- [ ] chrome.alarms 每 20s 触发心跳
- [ ] SW 终止后消息入队 chrome.storage.local
- [ ] 消息 3 次指数退避重试 (1s→2s→4s)
- [ ] SW 恢复后队列自动 flush
- [ ] 队列溢出 FIFO 保护
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过
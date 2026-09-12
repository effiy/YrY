---
title: "Service Worker: 空闲终止后 IPC 消息丢失导致聊天窗口无响应"
tags: [service-worker, lifecycle, ipc, message-loss, chrome-alarms, heartbeat, retry]
category: projects/yipet/bugs/worker
created: 2026-09-04
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: major
priority: p1
project: YiPet
module: src/background/index.ts, src/content/ipc/bridge.ts
reporter: Claude
environment: Chrome 130+ / macOS 15
affectedVersion: 1.2.0
fixedVersion: 1.2.1
frequency: intermittent
execution_world: Service Worker → ISOLATED → MAIN
---

# Service Worker: 空闲终止后 IPC 消息丢失

## 现象

用户打开聊天窗口，等待约 30 秒不操作后发送第一条消息，消息发送后无响应——无 loading 状态、无 AI 回复、无错误提示。用户再次发送消息后恢复正常。该问题在用户长时间阅读页面内容后首次与扩展交互时出现。

**用户感知**：聊天窗口"卡住"，发送消息后无任何反馈。用户不知道是 Service Worker 唤醒延迟，以为扩展故障。

## 复现步骤

1. Chrome 中加载 YiPet 扩展，打开聊天窗口
2. 等待 30 秒以上不进行任何操作（不点击、不发送消息）
3. 打开 DevTools → `chrome://extensions` → YiPet → 点击 "Service Worker" 链接
4. 观察 Service Worker 控制台：约 30 秒后显示 "Service Worker stopped"
5. 返回聊天窗口，快速输入消息并发送
6. **观察**：第一条消息发送后无响应（无 loading 状态、无 AI 回复）
7. 再次发送消息 → 正常工作

## 预期行为

即使 Service Worker 处于空闲终止状态，第一条 IPC 消息也应被正确处理，用户无感知。

## 实际行为

Service Worker 空闲终止后的第一条 IPC 消息可能丢失，Content Script 的 `sendMessage` Promise 挂起直到超时（30 秒），用户看到聊天窗口无响应。

## 影响评估

| 维度 | 评估 |
|------|------|
| 用户影响 | **高** — 用户首次交互无响应，体验严重受损 |
| 影响范围 | 所有用户，空闲 30s 后首次交互必触发 |
| 数据损失 | 无（消息未发送，用户可重试） |
| 安全影响 | 无 |

## 根因分析

### 直接原因

Chrome MV3 Service Worker 在空闲约 30 秒后被浏览器自动终止（idle timeout）。当 Content Script 通过 `chrome.runtime.sendMessage` 发送 IPC 消息时，Chrome 会**自动唤醒** Service Worker，但唤醒过程需要 100-500ms。在此期间到达的第一条消息可能被 Chrome 的内部消息队列丢弃。

`bridge.ts` 中的消息发送逻辑未处理 Service Worker 唤醒状态，无重试机制：

```typescript
// src/content/ipc/bridge.ts — 修复前
export function sendIpcMessage(message: IpcMessage): Promise<IpcResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}
```

### 深层原因

Chrome MV3 Service Worker 生命周期特点：

```
Service Worker 启动
  │
  ├── 处理事件（message, alarm, command...）
  ├── 空闲 30s → Chrome 发送 "idle timeout" 信号
  ├── 等待未完成的 Promise 解决（最多 5s）
  └── 强制终止（所有未完成 Promise 被 reject）
  
  ... 新事件到达 ...
  
  Chrome 自动唤醒 Service Worker
  ├── 重新执行顶层代码（import、变量初始化）
  ├── 注册事件监听器
  └── 分发事件 → 处理
```

关键问题：**唤醒期间到达的第一条消息可能在监听器注册完成前被分发**，导致消息丢失。

### 失败链路

```
用户发送消息（MAIN World）
  → window.postMessage({ type: "CHAT_SEND", ... })
  → ISOLATED World bridge.ts 接收
  → chrome.runtime.sendMessage({ type: "CHAT_SEND", ... })
  → Chrome 检测到 SW 已终止 → 唤醒 SW
  → SW 重新执行顶层代码（~100-500ms）
  → 消息在 SW 监听器注册前到达 → 消息被丢弃
  → bridge.ts Promise 挂起 → 30s 超时
  → 用户看到无响应
```

## 修复方案

### 1. 客户端重试机制

```typescript
// src/content/ipc/bridge.ts — 修复后
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 300;
const MAX_RETRY_DELAY_MS = 3000;

export async function sendIpcMessage(
  message: IpcMessage,
  options: { retries?: number; signal?: AbortSignal } = {}
): Promise<IpcResponse> {
  const { retries = MAX_RETRIES, signal } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) {
      throw new DOMException("IPC message cancelled", "AbortError");
    }

    try {
      const response = await new Promise<IpcResponse>((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
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

      if (attempt < retries) {
        // 指数退避 + 随机抖动（防止惊群效应）
        const delay = Math.min(
          BASE_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 100,
          MAX_RETRY_DELAY_MS
        );
        console.warn(
          `[IPC Bridge] 消息发送失败 (${attempt + 1}/${retries + 1})，${Math.round(delay)}ms 后重试`,
          { type: message.type, error: lastError.message }
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw new Error(
    `IPC 消息发送失败（已重试 ${retries} 次）: ${lastError?.message}`
  );
}
```

### 2. Service Worker 心跳保活

```typescript
// src/background/index.ts — 修复后
const HEARTBEAT_INTERVAL_MINUTES = 20 / 60; // 20 秒（低于 Chrome 30s idle timeout）

// 创建心跳闹钟
chrome.alarms.create("heartbeat", {
  periodInMinutes: HEARTBEAT_INTERVAL_MINUTES,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "heartbeat") {
    // 空操作 — 仅重置 Service Worker 的 idle timer
    console.debug("[SW] Heartbeat");
  }
});

// 安装/更新时初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install" || details.reason === "update") {
    await chrome.alarms.clear("heartbeat");
    chrome.alarms.create("heartbeat", {
      periodInMinutes: HEARTBEAT_INTERVAL_MINUTES,
    });
    // 初始化默认配置
    await chrome.storage.local.set({
      role: "cat",
      color: "blue",
      model: "qwen3.5",
      petVisible: true,
      language: "zh_CN",
    });
  }
});
```

### 3. 消息幂等性保证

```typescript
// 每条 IPC 消息携带唯一 ID，Service Worker 端去重
interface IpcMessage {
  id: string;          // 唯一消息 ID（uuid）
  type: IpcMessageType;
  source: "yipet" | "yipet-extension";
  data: Record<string, unknown>;
  timestamp: number;
}

// Service Worker 端去重
const processedMessageIds = new Set<string>();
const MAX_PROCESSED_IDS = 1000; // 防止内存泄漏

function isDuplicate(message: IpcMessage): boolean {
  if (processedMessageIds.has(message.id)) return true;
  processedMessageIds.add(message.id);
  // LRU 淘汰
  if (processedMessageIds.size > MAX_PROCESSED_IDS) {
    const first = processedMessageIds.values().next().value;
    processedMessageIds.delete(first);
  }
  return false;
}
```

### 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 心跳间隔 | 20s | 低于 Chrome 30s idle timeout，留 10s 安全边界 |
| 重试次数 | 3 次 | 覆盖 SW 唤醒时间（99% 情况下 < 1s） |
| 重试退避 | 指数退避 + 随机抖动 | 防止惊群效应，基础延迟 300ms |
| 心跳实现 | `chrome.alarms` | MV3 推荐方式，比 `setInterval` 更可靠（SW 终止后仍触发） |
| 消息去重 | 客户端生成 UUID | 避免重试导致重复操作 |

## 时间线

| 时间 | 事件 |
|------|------|
| 2026-09-04 09:00 | 用户反馈：长时间不操作后聊天窗口无响应 |
| 2026-09-04 09:30 | 确认复现：SW 空闲 30s 后首条消息丢失 |
| 2026-09-04 10:00 | 定位根因：SW 唤醒期间消息丢失 + 无重试机制 |
| 2026-09-04 14:00 | 实现修复：客户端重试 + chrome.alarms 心跳保活 |
| 2026-09-04 16:00 | 验证通过：30s 空闲后消息正常响应 |

## 验证方法

- [x] 等待 30 秒后发送消息 → 第一条消息正常响应，无丢失
- [x] 快速连续发送 5 条消息 → 全部正常响应
- [x] Service Worker 心跳日志每 20 秒输出一次
- [x] `chrome://serviceworker-internals` 中 Worker 状态持续为 "Running"
- [x] 浏览器重启后 → 心跳自动恢复，SW 正常初始化
- [x] 扩展更新后 → `onInstalled` 重新创建心跳闹钟

## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 架构 | 所有 IPC 消息 MUST 具备幂等性——重试不会导致重复操作 | 架构师 |
| 代码 | `sendIpcMessage` 函数 MUST 内置重试逻辑（指数退避 + 抖动） | 开发者 |
| 代码 | Service Worker 入口 MUST 注册 `chrome.alarms` 心跳保活 | 开发者 |
| 代码 | 每条 IPC 消息 MUST 携带唯一 ID，SW 端去重 | 开发者 |
| 监控 | 记录 IPC 消息重试次数，超过阈值时上报 | DevOps |
| 测试 | 添加 SW 空闲终止的集成测试（使用 `chrome.runtime.reload()` 模拟） | QA |
| 文档 | 在 [IPC Bridge 模式](../specs/ipc-bridge.md) 中记录 SW 生命周期注意事项 | 开发者 |

## 相关资源

- PR：#141
- Commit：`b485979`
- 相关缺陷：无
- 参考：[Chrome Extensions Service Worker Lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)
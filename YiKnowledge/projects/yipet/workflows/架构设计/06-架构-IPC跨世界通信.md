---
title: IPC 跨世界通信模式
tags: [yipet, patterns, ipc, dispatch-secure-event, chrome-runtime, relay, security]
category: projects/yipet/specs
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: pattern
status: active
---

# Pattern: IPC Relay

> 跨世界通信完整模式：window.postMessage + CustomEvent（dispatchSecureEvent）+ chrome.runtime.sendMessage 三通道、消息安全验证（IPC_SECRET 签名）、action 消息格式、Popup→Content Script→MAIN 双向流、反模式。

## 概述

Chrome MV3 扩展在两个隔离的 JavaScript 世界中运行。IPC Relay 是 ISOLATED World（Content Script）和 MAIN World（页面注入）之间的通信桥梁，通过 `window.postMessage`、`CustomEvent`（`dispatchSecureEvent`）和 `chrome.runtime.sendMessage` 实现多通道消息传递。

**为什么需要 IPC Relay？**
- MAIN World 无法访问 `chrome.runtime.*` API
- ISOLATED World 和 MAIN World 共享 DOM，但 JS 上下文隔离
- 两个世界只能通过 `window.postMessage` 和 `CustomEvent` 通信
- 安全分发需要 `IPC_SECRET`（`crypto.randomUUID()`）签名验证

**相关规范**：
- [扩展架构](./架构设计/02-扩展架构.md)
- [核心模块](./架构设计/05-核心模块.md)
- [认证与权限](./开发规范/03-认证与权限.md)

---

## 通信架构

```
┌─ MAIN World ───────────────────────────────────────────────┐
│  chat/index.ts + stores/chat.ts                              │
│    │ 监听 CustomEvent（yipet:visibilityChanged,              │
│    │   yipet:chatToggled）— 验证 IPC_SECRET 签名             │
│    │ 通过 dataset 接收初始配置（apiBase, role, color, token） │
│    ▼                                                         │
├─ ISOLATED World ───────────────────────────────────────────┤
│  content/ipc/relay.ts                                       │
│    │ chrome.runtime.onMessage（Popup → Content Script）      │
│    │   消息格式: { action: 'setRole', role: 'cat' }           │
│    │ dispatchSecureEvent（CustomEvent + IPC_SECRET）          │
│    │   用于: visibilityChanged, chatToggled                  │
│    │ injectIntoMainWorld（<script> dataset 属性）            │
│    │   用于: apiBase, role, color, visible, ipcSecret, token │
│    ▼                                                         │
├─ Popup ────────────────────────────────────────────────────┤
│  popup/services/chrome.ts                                   │
│    │ chrome.tabs.sendMessage(tabId, { action: 'setRole',    │
│    │   role: 'cat' })                                        │
│    ▼                                                         │
└─ Chrome Browser API ───────────────────────────────────────┘
```

### 三通道通信

| 通道 | 方向 | 用途 | 安全机制 |
|------|------|------|----------|
| `chrome.tabs.sendMessage` | Popup → Content Script | 配置变更（角色/颜色/可见性/大小） | Chrome 内部 API |
| `CustomEvent`（`dispatchSecureEvent`） | ISOLATED → MAIN | 可见性变更、聊天切换 | `IPC_SECRET`（`crypto.randomUUID()`）签名 |
| `<script> dataset` | ISOLATED → MAIN | 初始配置传递（apiBase, role, color, token） | DOM 属性，不经过消息通道 |

---

## 消息格式

### Popup → Content Script（chrome.tabs.sendMessage）

```typescript
// src/shared/ipc/messages.ts
interface PopupToContent {
  action: 'ping' | 'toggleVisibility' | 'setVisibility'
        | 'changeSize' | 'setRole' | 'setColor'
        | 'toggleChat' | 'extensionUpdated';
  // 各 action 的载荷
  visible?: boolean;
  size?: number;
  role?: string;
  color?: number;
  previousVersion?: string;
  currentVersion?: string;
}
```

### ISOLATED → MAIN（CustomEvent + IPC_SECRET）

```typescript
// src/content/ipc/relay.ts
const IPC_SECRET = crypto.randomUUID();

function dispatchSecureEvent<T>(name: string, detail: T): void {
  window.dispatchEvent(new CustomEvent(name, {
    detail: {
      __yipet: true,
      __signature: IPC_SECRET,
      __timestamp: Date.now(),
      data: detail,
    },
  }));
}

// 使用场景
dispatchSecureEvent('yipet:visibilityChanged', { visible: true });
dispatchSecureEvent('yipet:chatToggled', {});
```

### MAIN World 接收验证

```typescript
// src/chat/index.ts
function isValidIpcEvent(e: CustomEvent): boolean {
  const detail = e.detail;
  if (!detail || typeof detail !== 'object') return false;
  if (!detail.__yipet) return false;
  if (!IPC_SECRET || detail.__signature !== IPC_SECRET) return false;
  if (Date.now() - detail.__timestamp > 5000) return false; // 5s 过期
  return true;
}
```

### 消息方向

| 方向 | Action | 触发场景 | 载荷 |
|------|--------|----------|------|
| Popup → CS | `ping` | 检测 Content Script 存活 | — |
| Popup → CS | `toggleVisibility` | 切换宠物显隐 | — |
| Popup → CS | `setVisibility` | 设置宠物显隐 | `{ visible: boolean }` |
| Popup → CS | `changeSize` | 调整宠物大小 | `{ size: number }` |
| Popup → CS | `setRole` | 切换角色 | `{ role: string }` |
| Popup → CS | `setColor` | 切换颜色主题 | `{ color: number }` |
| Popup → CS | `toggleChat` | 快捷键切换聊天 | — |
| Popup → CS | `extensionUpdated` | 扩展更新后重新注入 | `{ previousVersion, currentVersion }` |
| CS → MAIN | `yipet:visibilityChanged` | 宠物显隐变更 | `{ visible: boolean }` |
| CS → MAIN | `yipet:chatToggled` | 聊天窗口切换 | `{}` |

---

## 实现模式

### ISOLATED World 侧（relay.ts）

```typescript
// src/content/ipc/relay.ts — 实际实现

// 安全密钥
const IPC_SECRET = crypto.randomUUID();

function dispatchSecureEvent<T>(name: string, detail: T): void {
  window.dispatchEvent(new CustomEvent(name, {
    detail: {
      __yipet: true,
      __signature: IPC_SECRET,
      __timestamp: Date.now(),
      data: detail,
    },
  }));
}

// 监听 Popup 消息
export function setupMessageRelay(): void {
  chrome.runtime.onMessage.addListener((msg: PopupToContent, _sender, sendResponse) => {
    switch (msg.action) {
      case 'ping': {
        sendResponse({ success: true, visible: _petVisible, size: _petSize, role: _petRole, color: _petColor });
        break;
      }
      case 'toggleVisibility': {
        _petVisible = !_petVisible;
        applyVisibility(_petVisible);
        persist();
        sendResponse({ success: true, visible: _petVisible });
        break;
      }
      case 'setVisibility': {
        _petVisible = !!msg.visible;
        applyVisibility(_petVisible);
        persist();
        sendResponse({ success: true, visible: _petVisible });
        break;
      }
      case 'changeSize': {
        _petSize = (msg.size as number) ?? _petSize;
        applySize(_petSize);
        persist();
        sendResponse({ success: true, size: _petSize });
        break;
      }
      case 'setRole': {
        const canonical = validateRole((msg.role as string) ?? '');
        if (!canonical) { sendResponse({ success: false }); break; }
        _petRole = canonical;
        applyRole(_petRole);
        persist();
        sendResponse({ success: true, role: _petRole });
        break;
      }
      case 'setColor': {
        _petColor = (msg.color as number) ?? _petColor;
        applyColor(_petColor);
        persist();
        sendResponse({ success: true });
        break;
      }
      case 'toggleChat': {
        dispatchSecureEvent('yipet:chatToggled', {});
        sendResponse({ success: true });
        break;
      }
      case 'extensionUpdated': {
        // 清除旧 DOM，重新初始化
        initRelay().catch((err: Error) => console.error('[YiPet] Re-injection failed:', err.message));
        sendResponse({ success: true });
        break;
      }
    }
    return true; // 保持消息通道开放以支持异步 sendResponse
  });
}
```

### MAIN World 侧（接收）

```typescript
// src/chat/index.ts — 实际实现
const IPC_SECRET = dataset.ipcSecret || '';

function isValidIpcEvent(e: CustomEvent): boolean {
  const detail = e.detail;
  if (!detail || typeof detail !== 'object') return false;
  if (!detail.__yipet) return false;
  if (!IPC_SECRET || detail.__signature !== IPC_SECRET) return false;
  if (Date.now() - detail.__timestamp > 5000) return false;
  return true;
}

// 监听 ISOLATED World 的安全事件
window.addEventListener('yipet:visibilityChanged', ((e: CustomEvent) => {
  if (!isValidIpcEvent(e)) return;
  store.setPetVisible(e.detail.data.visible);
}) as EventListener);

window.addEventListener('yipet:chatToggled', ((e: CustomEvent) => {
  if (!isValidIpcEvent(e)) return;
  store.toggleChat();
}) as EventListener);
```

### Popup 侧（发送）

```typescript
// src/popup/services/chrome.ts
export function createChromeService(tabRef: TabRef, storageKey: string): ChromeService {
  return {
    sendMessage(msg: unknown) {
      if (!tabRef.current?.id) return Promise.resolve(null);
      return chrome.tabs.sendMessage(tabRef.current.id, msg).catch((err: Error) => {
        console.warn('[YiPet Popup] sendMessage failed:', err.message);
        return null;
      });
    },
  };
}

// src/popup/App.vue — 使用示例
function updateRole(role: string) {
  const validated = validateRole(role);
  send({
    msg: { action: 'setRole', role: validated },
    okMsg: t('notifyRoleChanged', validated),
    optimistic: { role: validated },
  });
}
```

---

## 安全模式

### IPC_SECRET 签名验证

```typescript
// 每次扩展启动时重新生成
const IPC_SECRET = crypto.randomUUID();

// ISOLATED World 发送安全事件
function dispatchSecureEvent<T>(name: string, detail: T): void {
  window.dispatchEvent(new CustomEvent(name, {
    detail: {
      __yipet: true,
      __signature: IPC_SECRET,
      __timestamp: Date.now(),
      data: detail,
    },
  }));
}

// MAIN World 验证
function isValidIpcEvent(e: CustomEvent): boolean {
  const detail = e.detail;
  if (!detail || typeof detail !== 'object') return false;
  if (!detail.__yipet) return false;                          // 必须是 YiPet 事件
  if (!IPC_SECRET || detail.__signature !== IPC_SECRET) return false; // 签名匹配
  if (Date.now() - detail.__timestamp > 5000) return false;   // 5 秒过期
  return true;
}
```

### 安全约束

| 措施 | 说明 | 实现 |
|------|------|------|
| 签名验证 | `IPC_SECRET`（`crypto.randomUUID()`）每次扩展启动重新生成 | `dispatchSecureEvent` + `isValidIpcEvent` |
| 时间戳过期 | 事件超过 5 秒即拒绝 | `Date.now() - detail.__timestamp > 5000` |
| 来源标记 | `__yipet: true` 标记防止非 YiPet 事件 | `isValidIpcEvent` 第一层检查 |
| 不传递敏感数据 | Token 通过 `dataset` 属性传递，不经过消息通道 | `injectIntoMainWorld` |
| Chrome API 隔离 | Popup→CS 使用 `chrome.tabs.sendMessage`（Chrome 内部安全） | `setupMessageRelay` |

---

## 双向通信模式

### 请求-响应模式

用于 MAIN World 需要从 Service Worker 获取数据时：

```
MAIN World                          ISOLATED World         Service Worker
  │                                      │                      │
  │ postMessage({type, requestId})       │                      │
  │─────────────────────────────────────→│                      │
  │                                      │ sendMessage({type})  │
  │                                      │─────────────────────→│
  │                                      │                      │── chrome.storage.get
  │                                      │                      │←─ result
  │                                      │ sendResponse(result) │
  │                                      │←─────────────────────│
  │ postMessage({type, requestId, data}) │                      │
  │←─────────────────────────────────────│                      │
  │ resolve(data)                        │                      │
```

### 广播模式

用于 Service Worker 向所有标签页广播状态变更：

```typescript
// src/background/index.ts
async function broadcastToAllTabs(msg: PopupToContent): Promise<void> {
  const tabs = await chrome.tabs.query({});
  const results = await Promise.allSettled(
    tabs
      .filter(tab => tab.id !== undefined)
      .map(tab => chrome.tabs.sendMessage(tab.id!, msg))
  );

  // 记录失败的标签页
  const failures = results.filter(r => r.status === "rejected");
  if (failures.length > 0) {
    console.debug(`[SW] 广播失败: ${failures.length}/${tabs.length} tabs`);
  }
}

// 使用示例
async function onRoleChanged(role: string): Promise<void> {
  await broadcastToAllTabs({ action: "setRole", role });
}
```

### 心跳检测

```typescript
// 检测 Content Script 是否存活
async function pingContentScript(tabId: number): Promise<boolean> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: "ping" });
    return response?.success === true;
  } catch {
    return false;
  }
}

// Content Script 侧
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "ping") {
    sendResponse({ success: true, visible: true, size: 120, role: "Teacher" });
  }
  return true;
});
```

---

## 消息流时序

### 聊天消息流（不经过 IPC）

```
用户输入 "Hello"
  │
  ▼
MAIN World: ChatInput 组件
  │ chatStore.sendMessage("Hello")
  ▼
MAIN World: Chat Store (Pinia)
  │ ApiClient.stream(...) → 直接 fetch YiAi
  ▼
YiAi Backend（直接 fetch，不经过 IPC Relay）
  │ SSE 流式响应
  ▼
MAIN World: Chat Store (Pinia)._onToken(text)
  │ Vue 响应式系统自动重渲染
```

> 聊天 API 调用直接通过 fetch 从 MAIN World 发起，不经过 IPC Relay。IPC Relay 仅用于 Popup 配置变更和宠物状态同步。

### 角色切换流（经过 IPC）

```
Popup: 用户选择新角色 "dog"
  │
  ├── 1. chrome.tabs.sendMessage(tabId, { action: 'setRole', role: 'dog' })
  │
  ├── 2. ISOLATED World: chrome.runtime.onMessage
  │     validateRole('dog') → 更新 _petRole
  │     applyRole('dog') → 更新宠物图片
  │     persist() → chrome.storage.local
  │
  └── 3. Popup: 关闭
```

### 聊天切换流（经过 IPC + CustomEvent）

```
快捷键 Ctrl+Shift+X
  │
  ▼
Service Worker: chrome.commands.onCommand
  │ chrome.tabs.sendMessage(tabId, { action: 'toggleChat' })
  ▼
ISOLATED World: relay.ts
  │ dispatchSecureEvent('yipet:chatToggled', {})
  ▼
MAIN World: chat/index.ts
  │ window.addEventListener('yipet:chatToggled', ...)
  │ isValidIpcEvent(e) → store.toggleChat()
```

---

## 错误处理

### 超时处理

```typescript
// CustomEvent 时间戳过期 — 5 秒窗口
if (Date.now() - detail.__timestamp > 5000) return false;
```

### Popup 消息失败处理

```typescript
// src/popup/services/chrome.ts
sendMessage(msg: unknown) {
  if (!tabRef.current?.id) return Promise.resolve(null);
  return chrome.tabs.sendMessage(tabRef.current.id, msg).catch((err: Error) => {
    console.warn('[YiPet Popup] sendMessage failed:', err.message);
    return null;  // 静默失败，Popup 关闭后无需重试
  });
}
```

---

## 调试与监控

### 消息日志

```typescript
const DEBUG_IPC = import.meta.env.DEV;

function logMessage(direction: "MAIN→SW" | "SW→MAIN", message: IpcMessage): void {
  if (!DEBUG_IPC) return;

  console.debug(
    `[IPC ${direction}] ${message.type}` +
    (message.requestId ? ` #${message.requestId}` : "") +
    (message.data ? ` ${JSON.stringify(message.data).slice(0, 100)}` : "")
  );
}
```

### 消息统计

```typescript
class IpcStats {
  private counts = new Map<string, number>();
  private errors = new Map<string, number>();

  record(type: string): void {
    this.counts.set(type, (this.counts.get(type) || 0) + 1);
  }

  recordError(type: string): void {
    this.errors.set(type, (this.errors.get(type) || 0) + 1);
  }

  report(): string {
    const lines: string[] = ["IPC Statistics:"];
    for (const [type, count] of this.counts) {
      const errorCount = this.errors.get(type) || 0;
      lines.push(`  ${type}: ${count} (${errorCount} errors)`);
    }
    return lines.join("\n");
  }
}
```

---

## 反模式

| 反模式 | 错误示例 | 正确做法 | 原因 |
|--------|----------|----------|------|
| MAIN World 直接调用 chrome API | `chrome.storage.local.get("token")` | 通过 dataset 属性从 Content Script 接收数据 | MAIN World 无 chrome.* 权限 |
| 不验证 IPC_SECRET 签名 | `window.addEventListener('yipet:visibilityChanged', handler)` | 使用 `isValidIpcEvent(e)` 验证签名 | 任意页面可派发 CustomEvent |
| 在消息中传递 Token | `postMessage({ token: "eyJ..." })` | 通过 `dataset` 属性传递，不经过消息通道 | postMessage 可被页面脚本拦截 |
| 不验证角色名称 | `_petRole = msg.role` | `validateRole(msg.role)` 验证角色白名单 | 无效角色导致宠物图片 404 |
| 不处理 sendMessage 失败 | `chrome.tabs.sendMessage(...)` 无 catch | `.catch(() => null)` 静默处理 | Popup 关闭后 tab 可能不可用 |
| 忽略时间戳过期 | 接收任意时间的 CustomEvent | 验证 `Date.now() - __timestamp < 5000` | 重放攻击 |

---

## 约束

### 必须遵守
- 所有 Popup → Content Script 通信使用 `chrome.tabs.sendMessage` + `action` 格式
- ISOLATED → MAIN 安全事件使用 `dispatchSecureEvent`（`CustomEvent` + `IPC_SECRET` 签名）
- MAIN World 接收时必须验证 `IPC_SECRET` 签名和时间戳（5 秒过期）
- Token 等敏感数据通过 `<script> dataset` 属性传递，不经过消息通道
- 聊天 API 调用直接通过 fetch（不经过 IPC，减少延迟）
- Popup sendMessage 必须 `.catch()` 处理失败（tab 可能不可用）

### 禁止
- 不在 MAIN World 中调用 `chrome.runtime.*` API
- 不在 MAIN World 中直接读取 `chrome.storage`
- 不跳过 `IPC_SECRET` 签名验证
- 不在消息中传递不可序列化的对象（函数、DOM 节点等）
- 不通过 postMessage 传递 Token 等敏感数据
---
title: IPC 跨世界通信
tags: [yipet, ipc, dispatch-secure-event, chrome-runtime, relay, security]
category: projects/yipet/workflows
created: 2026-09-07
updated: 2026-09-15
source: YiPet
type: pattern
roles: [engineer]
benefit: "三通道安全通信：chrome.tabs.sendMessage + dispatchSecureEvent + dataset"
status: active
---

# IPC 跨世界通信

> Chrome MV3 扩展 ISOLATED World 与 MAIN World 之间的安全通信模式。三通道架构：chrome.tabs.sendMessage + CustomEvent（dispatchSecureEvent）+ `<script>` dataset。

**相关文档**：[双世界模型](./03-架构-双世界执行模型.md) · [扩展架构](./02-架构-扩展架构.md) · [认证权限](../开发规范/06-规范-认证与权限.md)

## 一、通信架构

```
MAIN World                      ISOLATED World              Popup/SW
  │                               │                           │
  │ 需要 chrome API 时              │                           │
  │ dispatchSecureEvent()          │                           │
  │──────────────────────────────→│                           │
  │                               │ chrome.runtime.sendMessage│
  │                               │──────────────────────────→│
  │                               │           sendResponse    │
  │                               │←──────────────────────────│
  │ CustomEvent 回调               │                           │
  │←──────────────────────────────│                           │
  │                               │                           │
  │                               │    chrome.tabs.sendMessage│
  │                               │←──────────────────────────│
  │ dispatchSecureEvent()          │                           │
  │←──────────────────────────────│                           │
```

## 二、三通道

| 通道 | 方向 | 用途 | 安全机制 |
|------|------|------|----------|
| `chrome.tabs.sendMessage` | Popup → CS | 配置变更（角色/颜色/可见性） | Chrome 内部 API |
| `dispatchSecureEvent`（CustomEvent） | ISOLATED → MAIN | 可见性/聊天切换 | IPC_SECRET + 5s 过期 |
| `<script> dataset` | ISOLATED → MAIN | 初始配置传递（apiBase, token） | DOM 属性，不经消息通道 |

**为什么需要 IPC？** MAIN World 无 `chrome.*` API，ISOLATED World 无法访问宿主 JS 变量。两个世界共享 DOM 但 JS 上下文隔离，只能通过 `window.postMessage`/`CustomEvent` 通信。

## 三、安全模型

三层验证（接收端必须全部通过）：

1. **来源标记**：`event.data?.__yipet === true`
2. **签名匹配**：`event.data?.__signature === IPC_SECRET`（`crypto.randomUUID()`，每次扩展启动重新生成）
3. **时间戳**：`Date.now() - event.data?.__timestamp < 5000`（防重放）

**Token 不经过消息通道**：通过 `<script> dataset` 属性从 ISOLATED 传递到 MAIN，避免 postMessage 被页面脚本拦截。

## 四、消息类型

### Popup → Content Script（判别联合）

| Action | 载荷 | 触发场景 |
|--------|------|----------|
| `ping` | — | 检测 CS 存活 |
| `setRole` | `{ role: string }` | 角色切换 |
| `setColor` | `{ color: number }` | 颜色切换 |
| `setVisibility` | `{ visible: boolean }` | 显隐切换 |
| `toggleVisibility` | — | 切换显隐 |
| `changeSize` | `{ size: number }` | 大小调整 |
| `toggleChat` | — | 聊天窗口切换 |
| `extensionUpdated` | `{ previousVersion, currentVersion }` | 扩展更新 |

### ISOLATED → MAIN（CustomEvent）

| 事件名 | 载荷 | 触发场景 |
|--------|------|----------|
| `yipet:visibilityChanged` | `{ visible: boolean }` | 显隐变更 |
| `yipet:chatToggled` | `{}` | 聊天窗口切换 |

## 五、消息流时序

### 配置变更（Popup → MAIN）
```
Popup: chrome.tabs.sendMessage({ action: 'setRole', role: 'dog' })
  → ISOLATED: chrome.runtime.onMessage → validateRole → persist
  → dispatchSecureEvent('yipet:roleChanged', { role })
  → MAIN: window.addEventListener → isValidIpcEvent → applyRole → 更新 UI
```

### 快捷键（SW → MAIN）
```
快捷键 → SW: chrome.commands.onCommand
  → chrome.tabs.sendMessage({ action: 'toggleChat' })
  → ISOLATED: dispatchSecureEvent('yipet:chatToggled', {})
  → MAIN: store.toggleChat()
```

### 聊天消息（不经过 IPC）
聊天 API 调用直接从 MAIN World fetch → YiAi，不经过 IPC。仅 Popup 配置变更和 SW 命令需 IPC。

## 六、广播与心跳

**广播模式**：Service Worker 向所有标签页广播状态变更。`chrome.tabs.query({}) → Promise.allSettled(tabs.map(tab => sendMessage))`。失败的标签页静默忽略。

**心跳检测**：Popup 通过 `{ action: 'ping' }` 检测 Content Script 存活。CS 返回 `{ success: true, visible, size, role }`。

## 七、错误处理

| 场景 | 处理 |
|------|------|
| sendMessage 失败（tab 不可用） | `.catch(() => null)` 静默 |
| IPC_SECRET 不匹配 | `console.warn` + 丢弃 |
| 消息过期（> 5s） | `console.warn` + 丢弃 |
| 心跳超时 | 标记 CS 不可用，Popup 显示离线 |

## 八、反模式

| 反模式 | 正确做法 | 原因 |
|--------|----------|------|
| MAIN 直接调 chrome API | 通过 IPC Relay | 无 chrome API |
| 不验证 IPC_SECRET | 三层验证 | 任意页面可派发 CustomEvent |
| 消息中传递 Token | 通过 `dataset` 属性 | postMessage 可被拦截 |
| 不验证角色名称 | `validateRole()` 白名单 | 无效角色 404 |
| 不处理 sendMessage 失败 | `.catch(() => null)` | tab 不可用 |

## 九、约束

**必须遵守：**
- Popup → CS 用 `chrome.tabs.sendMessage` + `action` 判别联合
- ISOLATED → MAIN 用 `dispatchSecureEvent`（IPC_SECRET + 时间戳）
- MAIN 接收须三层验证
- Token 通过 `dataset` 传递，不经过消息通道
- 聊天 API 直连 fetch（不经过 IPC）

**禁止：**
- MAIN World 不调 `chrome.*` API
- 不跳过 IPC_SECRET 验证
- 不通过 postMessage 传递 Token
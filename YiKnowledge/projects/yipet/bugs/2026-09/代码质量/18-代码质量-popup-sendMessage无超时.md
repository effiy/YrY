---
title: popup/services/chrome.ts 中 sendMessage 无超时和重试
tags: [yipet, code-quality, resilience]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# popup/services/chrome.ts 中 sendMessage 无超时和重试

## 现象

`src/popup/services/chrome.ts` 中的 `sendMessage` 函数直接调用 `chrome.tabs.sendMessage` 无超时保护：

```typescript
// popup/services/chrome.ts
const response = await chrome.tabs.sendMessage(tabId, msg);
```

而 `src/background/index.ts` 中的同名操作已使用 `Promise.race` 实现了 5 秒超时保护：

```typescript
// background/index.ts — 有超时保护
function sendMessageWithTimeout(tabId: number, msg: PopupToContent): Promise<any> {
  return Promise.race([
    chrome.tabs.sendMessage(tabId, msg),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Message timeout')), MSG_TIMEOUT_MS),
    ),
  ]);
}
```

Popup 和 Service Worker 使用了两种不一致的消息发送模式，Popup 缺少超时可能导致弹窗挂起。

## 根因分析

- Popup 和 SW 的消息发送逻辑独立开发，未统一
- Popup 中已有 `.catch(() => { console.warn(...) })` 但无超时机制
- 如果 content script 未响应，`chrome.tabs.sendMessage` 的默认超时可能很长

## 涉及文件

- `src/popup/services/chrome.ts:30-34` — 无超时的 sendMessage
- `src/background/index.ts:11-18` — 有超时的 sendMessageWithTimeout（对比）

## 修复方案

1. 将 `sendMessageWithTimeout` 提取到 `src/shared/ipc/send.ts`，Popup 和 SW 共用
2. 统一超时参数为 5 秒
3. 超时后提供用户可见的错误提示


## 影响范围

**影响模块**：`src/popup/services/chrome.ts` 消息发送逻辑、`src/background/index.ts` 消息发送逻辑。
**影响用户**：当 Content Script 未响应时，Popup 可能挂起，用户看到弹窗"转圈"但无任何反馈。
**影响范围**：所有通过 Popup 触发的扩展功能（角色切换、颜色变更、宠物显隐控制）。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 将 `sendMessageWithTimeout` 提取到 `src/shared/ipc/send.ts`，所有执行上下文共用 | 开发者 |
| 代码 | 统一超时参数为 5 秒 | 开发者 |
| 体验 | 超时后提供用户可见的错误提示和重试选项 | 开发者 |
| 测试 | 模拟 Content Script 无响应场景的集成测试 | QA |


## 经验教训

当同一逻辑在多个执行上下文中重复实现时，不一致是必然结果。Popup 和 Service Worker 都需要向 Content Script 发送消息，但只有 SW 有超时保护。将共享的 IPC 逻辑提取到公共模块是消除不一致的唯一途径。

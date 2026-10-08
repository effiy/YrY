---
title: 无 Content Script 注入失败的重试机制
tags: [yipet, code-quality, resilience]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# 无 Content Script 注入失败的重试机制

## 现象

`background/index.ts` 中的 `sendMessageWithTimeout` 函数在 5 秒超时后直接 reject，无重试逻辑：

```typescript
function sendMessageWithTimeout(tabId: number, msg: PopupToContent): Promise<any> {
  return Promise.race([
    chrome.tabs.sendMessage(tabId, msg),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Message timeout')), MSG_TIMEOUT_MS),
    ),
  ]);
}
```

调用方仅 `.catch(() => {})` 静默吞没失败：

```typescript
// 快捷键处理
sendMessageWithTimeout(tab.id, msg).catch(() => {});
// 更新广播
sendMessageWithTimeout(tab.id, {...}).catch(() => {});
```

当 content script 未就绪时（页面加载中、Service Worker 刚恢复），消息永远无法送达，用户点击快捷键无反馈。

## 根因分析

- Content script 注入是异步的——`chrome.tabs.sendMessage` 在 content script 监听器注册前调用会失败
- Chrome 未提供 content script 就绪的回调
- 失败时无重试、无降级、无用户通知

## 涉及文件

- `src/background/index.ts:11-18,53,72` — 消息发送和快捷键处理
- `src/background/index.ts:31-38` — 更新广播

## 修复方案

1. 实现重试策略：首次失败后 100ms、500ms、1500ms 三次重试
2. 快捷键无响应时显示通知："宠物正在加载中，请稍后再试"
3. Content script 注入后主动 ping Service Worker 注册就绪状态
4. 使用 `chrome.scripting.executeScript` 主动注入 content script（如未注入）


## 影响范围

**影响模块**：`src/content/bootstrap.ts` 注入逻辑。
**影响用户**：Content Script 注入失败时（如页面加载期间 DOM 未就绪），无重试机制意味着宠物永久不会出现在该页面上，除非用户手动刷新。
**影响范围**：所有页面的 Content Script 注入流程。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 注入失败时实现指数退避重试（最多 3 次） | 开发者 |
| 代码 | 利用 MutationObserver 等待 DOM 中的关键元素就绪后再注入 | 开发者 |
| 监控 | 记录注入失败率，按页面类型分类 | DevOps |
| 体验 | 注入失败 3 次后显示提示：建议刷新页面 | 开发者 |


## 经验教训

Content Script 的注入时机是脆弱的——页面可能还在加载、DOM 可能尚未就绪、CSP 可能阻止注入。单次尝试失败就放弃的策略不够健壮。指数退避重试 + 关键 DOM 元素就绪检测是更可靠的方式。

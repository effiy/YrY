---
title: Service Worker onInstalled 向所有标签页广播更新通知
tags: [yipet, code-quality, performance]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# Service Worker onInstalled 向所有标签页广播更新通知

## 现象

`src/background/index.ts` 的 `chrome.runtime.onInstalled` 监听器在扩展更新时向**所有打开的标签页**发送消息：

```typescript
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id) continue;
      sendMessageWithTimeout(tab.id, {
        action: 'extensionUpdated', ...
      }).catch(() => { /* skip silently */ });
    }
  }
});
```

当用户打开了 50+ 个标签页时，这会触发 50 次 `chrome.tabs.sendMessage` 调用。每个调用都需要 Chrome 唤醒对应的 content script（如果处于休眠状态）。

## 根因分析

- `chrome.tabs.query({})` 返回所有窗口的所有标签页
- 大多标签页不会注入 YiPet content script（用户可能未在那些页面使用宠物）
- `sendMessageWithTimeout` 5 秒超时，50 个标签页 × 5 秒 = 最多 250 秒的等待
- 失败时仅静默 `.catch()`，但已浪费了网络和 CPU 资源

## 涉及文件

- `src/background/index.ts:22-40` — `onInstalled` 广播逻辑

## 修复方案

1. 仅向已注入 content script 的标签页发送（维护已注入标签页集合）
2. 使用 `chrome.tabs.query({ url: ["*://*/*"] })` 过滤 chrome:// 等不可注入页面
3. 限制并发发送数量（`Promise.all` 分批，每批 5 个）
4. 将更新通知改为惰性——content script 下次激活时自行检测版本变化


## 影响范围

**影响模块**：`src/background/index.ts` Service Worker 更新广播逻辑。
**影响用户**：扩展更新时，如果用户打开了 50+ 标签页，每个标签页都会收到广播消息，可能导致短时间的 CPU 和网络资源消耗。
**影响范围**：扩展更新时的所有已打开标签页，用户标签页数量越多影响越大。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 广播操作前评估目标数量，超过阈值（如 10 个标签页）时采用惰性通知策略 | 开发者 |
| 代码 | 限制并发 `sendMessage` 数量，分批发送 | 开发者 |
| 架构 | 更新通知改为惰性——Content Script 下次激活时自行检测版本变化 | 架构师 |
| 监控 | 记录扩展更新时的广播耗时和成功率 | DevOps |


## 经验教训

在 Chrome 扩展中，"向所有标签页广播"是一个看似简单但实际昂贵的操作。每个 `chrome.tabs.sendMessage` 都可能触发 Service Worker 唤醒 Content Script。对于需要广播的场景，惰性通知（Content Script 主动轮询）比主动推送更具可扩展性。

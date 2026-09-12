---
title: YiPet Skills Index 使用 kebab-case 目录但角色子目录为英文
tags: [yipet, code-quality, naming]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 背景脚本消息处理缺少超时保护

## 现象

`src/background/index.ts` 中的消息处理函数使用 `chrome.runtime.onMessage.addListener`，但未对长时间运行的消息处理设置超时：

```typescript
// background/index.ts — 消息处理无超时
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  // 处理消息...
  // sendResponse 可能永远不会被调用
});
```

当消息处理逻辑中抛出异常或 await 操作挂起时，`sendResponse` 不会返回，导致调用方（content script 或 popup）无限等待。

## 根因分析

- Chrome 扩展的消息传递基于 `sendResponse` 回调——如果 5 分钟内不调用，消息通道会断开
- 但 5 分钟对于 UI 操作来说太长了——用户会感到"卡住"
- 没有应用层超时：如果 YiAi 后端响应慢，popup/chat 会一直等待

## 涉及文件

- `src/background/index.ts` — Service Worker 消息处理器

## 修复方案

1. 为关键消息处理逻辑添加 `Promise.race` 超时保护（30 秒）
2. 超时时返回错误状态而非挂起
3. 调用方（ApiClient）已有 fetch timeout，确保端到端超时链路闭合


## 影响范围

**影响模块**：`src/background/index.ts` Service Worker 消息处理器。
**影响用户**：当消息处理挂起时，调用方（Popup、Content Script）无限等待，用户看到弹窗或聊天窗口"卡住"。
**影响范围**：所有通过 `chrome.runtime.sendMessage` 发送到 Service Worker 的 IPC 消息。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 所有 `sendResponse` 调用必须在合理时间内（30 秒内）完成 | 开发者 |
| 代码 | 为关键消息处理逻辑添加 `Promise.race` 超时保护 | 开发者 |
| 监控 | 记录消息处理耗时，超过阈值时上报 | DevOps |
| 流程 | 新增消息类型时评估处理时间，长耗时操作应考虑流式响应 | 开发者 |


## 经验教训

Chrome 扩展的消息传递基于回调模式，`sendResponse` 如果不被调用，消息通道会在 5 分钟后断开。但对于用户交互来说，5 分钟太长了——用户会在几秒内就认为扩展故障。应用层超时保护是必需的，不应依赖 Chrome 的内部超时。

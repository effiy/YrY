---
title: 缺少 content script 与 Service Worker 间的心跳机制
tags: [yipet, code-quality, reliability]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 缺少 content script 与 Service Worker 间的心跳机制

## 现象

Content script 和 Service Worker 之间没有定期心跳。SW 无法感知 content script 是否仍存活：

- 用户关闭标签页时 SW 不知情
- Content script 被 Chrome 暂停时 SW 仍尝试发送消息

## 涉及文件

- `src/background/index.ts`
- `src/content/ipc/relay.ts`

## 修复方案

Content script 每 30 秒 ping SW，SW 维护活跃标签页集合。


## 影响范围

**影响模块**：Content Script 和 Service Worker 之间的长连接管理。
**影响用户**：当 SW 重启或 Content Script 重新注入时，双方的状态可能不一致——SW 认为连接存在但实际已断开。
**影响范围**：所有需要 SW 中转的 Content Script 功能。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 建立 Content Script 和 SW 之间的定期心跳通信（如每 30 秒 ping/pong） | 开发者 |
| 代码 | 一方检测到连接断开时主动重建连接 | 开发者 |
| 代码 | 使用 `chrome.runtime.connect` 的长连接模式替代 `sendMessage` 的短连接 | 开发者 |
| 监控 | 记录连接断开和重建的频率 | DevOps |


## 经验教训

在 Chrome MV3 中，Content Script 和 Service Worker 的生命周期是独立的。SW 可能空闲终止，Content Script 可能因页面刷新重新注入。没有心跳机制，双方无法感知对方的存续状态，导致消息发送到已断开的连接。

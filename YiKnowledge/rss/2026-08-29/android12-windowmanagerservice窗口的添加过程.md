---
title: android12 WindowManagerService窗口的添加过程
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7679012813105578024
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 16:53:08 GMT
author: 码农coding
---

窗口的添加是一个从应用进程到系统服务进程（SystemServer）的跨进程通信（IPC）过程。核心逻辑在 WindowManagerService (WMS) 的 addWindow 方法中。
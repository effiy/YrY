---
title: Electron preload.ts 类型无法自动推导的解决方案
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679300960056852522
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 04:56:51 GMT
author: 律宏阔
---

将 Electron preload 暴露的 API 抽成共享类型，并通过 `global.d.ts` 扩展 `Window`，解决 `window.electron` 无法自动推导的问题
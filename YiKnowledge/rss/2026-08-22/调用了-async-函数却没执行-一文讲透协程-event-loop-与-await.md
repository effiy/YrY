---
title: 调用了 async 函数却没执行？一文讲透协程、event loop 与 await
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676392949267283994
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 05:45:23 GMT
author: Zane1994
---

写在前面 Day17、Day18 分别讲了多线程和多进程，两者都是"重量级"的并发方案——线程有 GIL 限制，进程有创建开销和内存隔离。面对成千上万个 I/O 密集型任务（比如同时发出几千个网络请求
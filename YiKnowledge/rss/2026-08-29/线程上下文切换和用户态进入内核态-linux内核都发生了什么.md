---
title: 线程上下文切换和用户态进入内核态 linux内核都发生了什么
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7678976901449154601
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 08:23:43 GMT
author: 那咋乎吧
---

先抓住最关键的区别： 这两个动作可以连续发生，但不是一回事。下面用 x86-64 上线程 A 执行阻塞式 recv() 的完整过程串起来。 一、线程运行时涉及哪些数据结构 线程 A 在内核中的核心结构
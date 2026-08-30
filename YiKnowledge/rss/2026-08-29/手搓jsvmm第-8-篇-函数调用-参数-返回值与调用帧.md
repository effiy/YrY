---
title: 手搓JSVMM第 8 篇：函数调用：参数、返回值与调用帧
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679324747243094062
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 16:00:56 GMT
author: 泯泷
---

1. 本文目标 现在 VM 已经支持表达式、变量和控制流。下一步是函数： 本篇要实现： Function Object FunctionMeta Call Frame 参数传递 Return Addr
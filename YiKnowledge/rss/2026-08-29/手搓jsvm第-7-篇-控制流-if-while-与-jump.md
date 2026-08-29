---
title: 手搓JSVM第 7 篇：控制流：if、while 与 jump
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679222800792879155
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 14:07:47 GMT
author: 泯泷
---

1. 本文目标 前面我们已经能编译和执行直线代码： 但真实程序会有分支和循环： 本篇目标是让 VM 支持控制流： label jump jump_if_false if while 2. 为什么控制流
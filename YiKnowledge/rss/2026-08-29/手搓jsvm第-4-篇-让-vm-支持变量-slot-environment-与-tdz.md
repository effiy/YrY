---
title: 手搓JSVM第 4 篇：让 VM 支持变量：Slot、Environment 与 TDZ
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679222800792846387
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 14:02:42 GMT
author: 泯泷
---

本文目标 前三篇我们已经让 VM 能执行表达式： 到第 3 篇为止，我们手里是一台寄存器式的表达式计算机。它能把临时值放进 r0、r1、r2： 但 JavaScript 不只有表达式
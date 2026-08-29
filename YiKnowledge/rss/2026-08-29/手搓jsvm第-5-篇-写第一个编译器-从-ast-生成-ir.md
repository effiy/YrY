---
title: 手搓JSVM第 5 篇：写第一个编译器：从 AST 生成 IR
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679088949327953930
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 14:04:42 GMT
author: 泯泷
---

第 5 篇：写第一个编译器：从 AST 生成 IR 1. 本文目标 前四篇里，我们一直在手写 VM 指令或 bytecode。这一篇，我们希望给定这样一段源码： 它能自动变成类似下面的中间指令
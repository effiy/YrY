---
title: 🕰️ 闭包 + setTimeout 的 5 个经典陷阱：为什么定时器看到的永远不是最新的值？
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676411402015195172
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 13:15:58 GMT
author: 前端阿凡
---

问题场景 写循环、回调、定时器时，经常遇到"变量值不对"的玄学： 或者： 代码看起来完全合理，结果却全错——定时器/回调执行时的值，跟你写代码时脑子里想的完全不是一回事。这是前端最经典也最隐蔽的坑之一
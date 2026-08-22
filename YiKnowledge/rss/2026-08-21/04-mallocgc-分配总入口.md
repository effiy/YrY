---
title: 04. mallocgc：分配总入口
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676313682340741158
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Fri, 21 Aug 2026 12:03:37 GMT
author: 用户33014486763
---

1. mallocgc 函数签名与职责 mallocgc 是 Go 运行时内存分配的唯一入口。所有用户态分配——new(T)、make([]T, n)、逃逸到堆的局部变量——最终都调到这里。 参数解读
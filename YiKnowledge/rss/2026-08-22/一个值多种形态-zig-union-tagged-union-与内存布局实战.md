---
title: 一个值多种形态：Zig union、Tagged Union 与内存布局实战
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676490671499395122
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 14:18:18 GMT
author: 唐青枫
---

一个值多种形态：Zig union、Tagged Union 与内存布局实战 当一个值可能是整数、字符串或一组结构化数据时，union 可以把这些可能性组织成一个类型。多个成员共享同一块存储，同一时刻
---
title: 里氏替换原则的盲区：为什么符合契约的List替换依然会失败？
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679222800792059955
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 08:47:48 GMT
author: SamDeepThinking
---

Java里有一个很有意思的问题： 两个对象明明都是List，为什么一个能add，另一个却不让你add？ 代码能编译，但运行时直接抛出UnsupportedOperationException。 如果把
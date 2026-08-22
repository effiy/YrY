---
title: HashMap 为什么要在长度16、容量必须是2的幂这些细节上较劲
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676694450110480393
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 05:30:33 GMT
author: Zane1994
---

写在前面 HashMap 是被问得最深的一个集合类，随便一道追问就能扯出扰动函数、树化阈值、扩容时的位运算优化这些细节。这篇把 JDK 8 之后 HashMap 的底层结构和扩容机制从头捋一遍，讲清楚
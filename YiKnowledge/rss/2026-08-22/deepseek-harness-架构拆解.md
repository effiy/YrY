---
title: DeepSeek Harness 架构拆解
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676398004519239690
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 08:29:41 GMT
author: Pika
---

DeepSeek Harness 架构拆解：一切皆插件的 Agent 框架是怎么实现的 一、为什么这套代码值得读 市面上绝大多数 agent 框架，都是"一个主循环 + 一堆写死的能力
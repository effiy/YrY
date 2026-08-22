---
title: LangChain 源码解析：HumanInTheLoopMiddleware 如何实现 Agent 人机协同
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676694450111201289
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 07:56:48 GMT
author: 用户388456719954
---

HumanInTheLoopMiddleware是LangChain提供的一个中间件，能够让用户参与到agent的执行当中。 HumanInTheLoopMiddleware给agent提供一种能力，
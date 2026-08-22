---
title: 实测 OpenConnector：给 Agent 接 SaaS，别再把 Token 塞进环境变量
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676404079283748900
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 07:37:26 GMT
author: alwaysmavs
---

给 Agent 接 GitHub、Gmail、Slack 或 Notion，最容易的做法是什么？ 把 token 塞进环境变量，给模型注册几个函数，几分钟就能跑起来。 但只要继续往前走一步——第二个用
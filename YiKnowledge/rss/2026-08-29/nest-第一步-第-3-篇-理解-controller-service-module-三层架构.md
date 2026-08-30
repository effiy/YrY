---
title: Nest 第一步 · 第 3 篇：理解 Controller / Service / Module 三层架构
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7679053043288326150
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 14:00:00 GMT
author: Z思学
---

一、三层架构图解 我们先用一张图，看清楚三层架构的数据流向： 这张图告诉我们什么？ 步骤 谁在做 做什么 1 前端 发起 HTTP 请求 GET /users 2 Controller 接收请求，调用
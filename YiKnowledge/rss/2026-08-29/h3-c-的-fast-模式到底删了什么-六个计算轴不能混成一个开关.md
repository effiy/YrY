---
title: h3.c 的 fast 模式到底删了什么：六个计算轴不能混成一个开关
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7678923751792082986
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 01:20:45 GMT
author: 武子康
---

h3.c 的 fast 模式到底删了什么：六个计算轴不能混成一个开关 很多推理工具把优化收进一个 fast=true。速度变快后，用户只看到总耗时下降，却不知道程序少算了哪些部分，也不知道画面出错时应
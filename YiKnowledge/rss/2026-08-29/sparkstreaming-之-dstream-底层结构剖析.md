---
title: SparkStreaming 之 DStream 底层结构剖析
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7679133086101454894
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 10:48:18 GMT
author: starzy
---

一、DStream 到底是个什么东西 先给一个判断，省得绕：DStream 是"RDD 的时间序列"，它自己一个字节的数据都不存。 回想上一篇文章里 batchInterval 的概念——Spark
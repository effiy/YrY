---
title: kubelet源码阅读
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7678969657584697350
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 06:17:30 GMT
author: 程序猿阿越
---

本文分析kubelet源码，包括： kubelet心跳和Node信息上报； syncLoop主循环； worker循环； 同步Pod和删除Pod； 注：基于kubernetes 1.36.1。
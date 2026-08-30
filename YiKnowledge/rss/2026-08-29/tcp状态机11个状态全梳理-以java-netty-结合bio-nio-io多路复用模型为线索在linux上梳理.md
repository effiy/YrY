---
title: TCP状态机11个状态全梳理（以java netty 结合bio,nio, io多路复用模型为线索在linux上梳理）
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7678976901449662505
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 13:21:55 GMT
author: 那咋乎吧
---

Java Socket：从 BIO、NIO 到 Linux epoll 的完整内核链路 1. 先建立整体认知 BIO、NIO 和 epoll 不在同一个抽象层次： 名称 所在层次 核心含义 BIO J
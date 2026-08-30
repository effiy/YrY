---
title: 从 getStore() 到 execute() —— 单连接 IMAP 管理器的五次迭代记录
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7679201776696115251
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 14:29:45 GMT
author: Jesse_EC
---

它只有 220 行，却是整个项目里我改得最多、想得最久的一个类。 全文所有代码都来自真实的 git 提交记录，包括那些我后来才发现是错的写法。
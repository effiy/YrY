---
title: 33B 音画模型塞进 Apple Silicon，h3.c 重写了哪些 Runtime 职责
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676625061881823251
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 02:07:59 GMT
author: 武子康
---

很多推理工具把优化收进一个 fast=true。速度变快后，用户只看到总耗时下降，却不知道 程序少算了哪些部分，也不知道画面出错时应该撤回哪个开关。 h3.c 固定版本 8974cc0 把这件事拆得很
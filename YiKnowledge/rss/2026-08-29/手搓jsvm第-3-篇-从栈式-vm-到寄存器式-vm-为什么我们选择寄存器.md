---
title: 手搓JSVM第 3 篇：从栈式 VM 到寄存器式 VM：为什么我们选择寄存器
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679088949327921162
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 14:01:22 GMT
author: 泯泷
---

本文目标 前两篇我们已经让 VM 能执行： 不过它还是栈式 VM，临时值都放在 stack 里。本篇要把它升级成寄存器式 VM
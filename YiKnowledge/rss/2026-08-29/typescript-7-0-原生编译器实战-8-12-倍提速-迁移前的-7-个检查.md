---
title: TypeScript 7.0 原生编译器实战：8—12 倍提速，迁移前的 7 个检查
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679223034338836490
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 09:54:16 GMT
author: 深蓝AI
---

tsc -b 跑了两分多钟还没有结束，编辑器里的红色波浪线要等十几秒才出现。项目代码没有突然变大，开发机也没有明显变慢，真正拖住反馈速度的，可能是编译器本身。对大型 TypeScript 项目来说，类
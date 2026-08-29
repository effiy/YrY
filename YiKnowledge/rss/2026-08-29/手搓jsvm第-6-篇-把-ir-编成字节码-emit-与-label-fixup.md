---
title: 手搓JSVM第 6 篇：把 IR 编成字节码：emit 与 label fixup
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679223034339508234
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 14:06:02 GMT
author: 泯泷
---

第 6 篇：把 IR 编成字节码：emit 与 label fixup 1. 本文目标 第 5 篇我们已经能把简化 AST 降级成 IR： 本篇继续向前走一步： 最终我们要得到： 这里的数字只是一种示
---
title: Go语言第十章(指针)
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7679264879620194344
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sun, 30 Aug 2026 00:51:45 GMT
author: 小满zs
---

值传递与引用类型 调用函数时，实参怎么传给形参？改形参会不会影响外面的变量吗？ Go 的答案比「值传递 / 引用传递」二分法更精确：Go 里永远是值传递——传参时会复制一份。但有些类型的「那一份」只是
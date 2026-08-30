---
title: Effective Python 条款 6：善用拆包告别恼人的下标索引
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7679133086102306862
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sun, 30 Aug 2026 00:04:00 GMT
author: 软件科学_郝学胜
---

很多刚上手 Python 的同学，访问元组、列表里的数据时，第一反应就是疯狂写下标[0]、[1]、[i‑1]。下标写多了，代码里到处都是数字魔法值，可读性直线下降，改代码的时候还很容易把[0]写成[1
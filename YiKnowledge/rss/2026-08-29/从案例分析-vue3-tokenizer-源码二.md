---
title: 从案例分析 Vue3 Tokenizer 源码二
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7679133086102061102
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 15:37:33 GMT
author: 单线程_01
---

从案例分析 Vue3 Tokenizer 源码一： 情形二：文本含插值(source=“some {{ foo + bar }} text”) 本小节核心验证文本节点与插值节点的解析逻辑。插值表达式已
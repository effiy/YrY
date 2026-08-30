---
title: Reranker（重排器）
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7679012813105266728
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 14:04:03 GMT
author: 李洱
---

1.为什么有了向量检索，还需要Reranker？ 在RAG系统中，向量检索（Vector Retrieval）负责从海量知识库中快速召回Top-K条相关文本。它的优势是快——即使数据库里有上亿条文档，
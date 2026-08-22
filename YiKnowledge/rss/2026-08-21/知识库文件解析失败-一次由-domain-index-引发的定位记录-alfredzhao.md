---
title: 知识库文件解析失败：一次由 Domain Index 引发的定位记录 - AlfredZhao
tags:
- 博客园
category: engineer/learn/lessons
created: '2026-08-22'
source: https://www.cnblogs.com/jyzhao/p/21385620
type: rss
source_name: 博客园
source_url: https://feed.cnblogs.com/blog/sitehome/rss
published: '2026-08-21T22:19:00Z'
author: AlfredZhao
---

【摘要】知识库上传文件后，解析流程不一定失败在文件本身。有时日志只暴露出“保存分块失败”，真正的问题却在数据库对象状态上。笔者环境中，这次问题最终定位到 Oracle 表上的 Domain Index 处于 failed 状态。 01 | 先用小文件复现问题 为了快速验证，笔者先用一个小文件复现。上传后，解 <a href="https://www.cnblogs.com/jyzhao/p/21385620" target="_blank">阅读全文</a>
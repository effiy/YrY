---
title: 用 crontab 给 LLM 使用量装上“监控眼” - AlfredZhao
tags:
- 博客园
category: engineer/learn/lessons
created: '2026-08-29'
source: https://www.cnblogs.com/jyzhao/p/22757555
type: rss
source_name: 博客园
source_url: https://feed.cnblogs.com/blog/sitehome/rss
published: '2026-08-29T17:36:00Z'
author: AlfredZhao
---

【摘要】在把大模型接入日常工作流之后，笔者很快遇到了一个新问题：模型到底被用了多少次？每天的高峰时段是什么时候？周末是不是真的没人调用？如果对这些数据一无所知，就谈不上优化成本、排查异常，更谈不上为后续扩容做规划。 于是，笔者为 LLM 使用量加了一层可观测性，做法很简单——用 Linux 自带的 cron <a href="https://www.cnblogs.com/jyzhao/p/22757555" target="_blank">阅读全文</a>
---
title: GitHub 公布本周八小时宕机事故原因
tags:
- Solidot 奇客
category: engineer/lessons
created: '2026-08-22'
source: https://www.solidot.org/story?sid=85147
type: rss
source_name: Solidot 奇客
source_url: https://www.solidot.org/index.rss
published: Thu, 20 Aug 2026 17:28:23 +0800
---

最大的代码托管平台 GitHub 本周发生了一次持续了近八小时的宕机事故，再次在开发者中间引发了寻找替代平台的讨论。GitHub 今年频繁发生宕机事故，已促使多个知名开源项目宣布迁移出去。本周的宕机事故始于 8 月 17 日 13:28 UTC，直至 21:15 UTC 才完全解决——持续 7 小时 47 分钟的事故导致 Issues、Pull Requests、API、Actions 和 Copilot 等服务大量出错。GitHub 解释说，事故直接原因是位于公司美国中部数据中心的负载均衡器网络饱和，而自动扩容策略的配置错误，以及 Visual Studio Code 中一个导致流量放大 10 倍的重试 bug 等一系列连锁反应导致了此次事故持续了如此长时间。
<p></p>
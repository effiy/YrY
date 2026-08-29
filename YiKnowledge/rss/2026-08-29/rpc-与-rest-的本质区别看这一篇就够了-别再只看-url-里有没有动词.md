---
title: RPC 与 REST 的本质区别看这一篇就够了：别再只看 URL 里有没有动词
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679054762876731443
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 02:51:49 GMT
author: Wilson王艺谋
---

RPC把远端系统描述成可调用的方法，REST把它描述成可操作的资源。本文用同一个导出任务讲清两种抽象如何影响HTTP语义、幂等重试、状态恢复与接口演进，并给出一套可直接用于API评审的选择方法。
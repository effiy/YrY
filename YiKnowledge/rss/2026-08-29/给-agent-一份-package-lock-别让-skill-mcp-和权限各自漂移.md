---
title: 给 Agent 一份 package-lock：别让 Skill、MCP 和权限各自漂移
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7678871866053459987
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 02:49:36 GMT
author: 用户527467561421
---

Agent 的能力由 Skill、MCP、App、权限和模型路由共同决定。本文用 Manifest、Lockfile、能力指纹、回归与灰度，构建可复现的配置发布流程。
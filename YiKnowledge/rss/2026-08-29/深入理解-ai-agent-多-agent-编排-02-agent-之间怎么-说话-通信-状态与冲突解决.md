---
title: '深入理解 AI Agent · 多 Agent 编排 #02：Agent 之间怎么“说话“——通信、状态与冲突解决'
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679026674805456923
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 01:00:14 GMT
author: 宋哥转AI
---

上一篇聊了多 Agent 编排的四种模式——串行、并行、条件分支、竞争。模式定义的是"拓扑"，但拓扑之上还需要三样东西让协作真正运转： 传话：Agent A 怎么把消息发给 Agent B 共享记忆：
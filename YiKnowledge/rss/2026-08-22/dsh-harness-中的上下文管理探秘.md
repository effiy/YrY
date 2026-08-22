---
title: DSH harness 中的上下文管理探秘
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676421336285741099
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 07:18:00 GMT
author: demo007x
---

Agent 记忆管理：上下文管理 + 长期记忆 0. 记忆管理的两层结构 记忆管理分两层，按"数据存在哪里"划分： 层 数据位置 生命周期 代表技术 短期 / 工作记忆 模型上下文窗口内 单次会话 t
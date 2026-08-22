---
title: AI 消息列表虚拟滚动：这是业务问题，还是组件能力边界？
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676436966289309711
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Fri, 21 Aug 2026 17:45:21 GMT
author: one_last_FE
---

本文分析 BubbleList 不支持虚拟滚动时的取舍：历史分页和滚动锚定属于业务侧能力，真正虚拟滚动更应由组件层支持；业务侧不应硬改组件。
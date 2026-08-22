---
title: 啃完 TS 工具类型我发现：Pick 和 Omit 原来就是一层窗户纸
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676404079284535332
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 15:32:44 GMT
author: To_OC
---

写后台接口的时候，有个问题一直卡着我：同一个 User 类型，列表页只要 id 和 name，详情页又不想要 email 这种敏感字段，更新接口里所有字段还都得是可选的。以前我的做法就是复制粘贴 in
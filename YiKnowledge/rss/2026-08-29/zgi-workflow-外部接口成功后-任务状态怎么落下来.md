---
title: ZGI Workflow：外部接口成功后，任务状态怎么落下来
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7678969657585778694
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 14:15:00 GMT
author: ZGIAI
---

外部接口返回成功，工作流页面却停在处理中，常见原因在于请求回执没有回写任务状态。把请求编号、目标对象、节点状态和最终业务结果连起来，才能知道任务究竟完成到哪一步。
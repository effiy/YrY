---
title: ZGI 批量测试：上线前验证 Agent
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676709710489878538
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 13:54:58 GMT
author: ZGIAI
---

Agent 上线前需要用一组真实任务批量检查答案、工具调用、流程状态和业务副作用。测试样本应同时覆盖正常输入、缺失信息、越权请求和外部接口异常，并为每类任务设置可判断的通过标准。
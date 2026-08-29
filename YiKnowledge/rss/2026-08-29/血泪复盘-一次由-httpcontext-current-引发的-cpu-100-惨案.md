---
title: 血泪复盘：一次由 HttpContext.Current 引发的 CPU 100% 惨案
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7678974488122327092
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 03:47:03 GMT
author: 人丰
---

一、 案发现场：CPU 突然“起飞” MES业务系统的某个核心应用节点突然告警：CPU 使用率逼近 100%。 第一反应是重启，先恢复生产，重启后 CPU 确实回落了。但没过半小时，曲线再次陡峭上升，
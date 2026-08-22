---
title: 若依启动突然报 Redis MISCONF？一次从应用报错到磁盘爆满的完整排查记录
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-22'
source: https://juejin.cn/post/7676404079283388452
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 22 Aug 2026 06:05:19 GMT
author: 掘金者阿豪
---

若依启动突然报 Redis MISCONF？一次从应用报错到磁盘爆满的完整排查记录 最近在启动一个若依后台项目时，遇到了一个看起来像 Spring Bean 注入失败的问题。项目使用的是 RuoYi
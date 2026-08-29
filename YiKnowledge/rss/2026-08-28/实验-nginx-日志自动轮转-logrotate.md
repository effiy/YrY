---
title: '# 实验：Nginx 日志自动轮转（logrotate）'
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7678899026394153014
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Fri, 28 Aug 2026 14:30:04 GMT
author: 帷幕落秋
---

一、实验目的 理解 logrotate 的作用：自动压缩、切割、清理旧日志，防止日志撑爆磁盘 掌握 logrotate 配置文件的编写方法（/etc/logrotate.d/ 下的规则文件） 实际验证
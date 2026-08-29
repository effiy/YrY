---
title: Netty对接医疗监护仪HL7协议，使用MLLP解码器解析数据 - 小鱼，
tags:
- 博客园
category: engineer/learn/lessons
created: '2026-08-29'
source: https://www.cnblogs.com/xiaoyu01/p/22738580
type: rss
source_name: 博客园
source_url: https://feed.cnblogs.com/blog/sitehome/rss
published: '2026-08-28T06:12:00Z'
author: 小鱼，
---

【摘要】1.介绍 医疗设备通讯中通常使用HL7协议进行通讯，底层网络层依然是TCP/IP协议， 由于TCP是字节流协议，它和HL7都并没有定义一段报文的开始和结束，所以引入了MLLP协议 MLLP即（Minimal Lower Layer Protocol），一种基于TCP/IP的通信协议，非常轻量级， 一 <a href="https://www.cnblogs.com/xiaoyu01/p/22738580" target="_blank">阅读全文</a>
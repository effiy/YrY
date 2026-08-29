---
title: 把自定义唤醒词部署到 ESP32-S3：ONNX 转 INT8 TFLite 的完整链路
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7678978303476826139
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Fri, 28 Aug 2026 23:13:15 GMT
author: 踩蚂蚁
---

很多端侧语音项目都会经历同一个过程：模型在电脑上用 ONNX Runtime 跑通了，准备复制到 ESP32-S3 时，却发现固件里根本没有 ONNX Runtime。 这不是少装了一个库，而是运行环
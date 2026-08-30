---
title: Rust 桌面宠物拖拽踩坑实录：重影、不跟手、置顶失效
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-30'
source: https://juejin.cn/post/7679133086102110254
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 15:55:59 GMT
author: 再吃一根胡萝卜
---

一、背景：我想做一个桌面宠物 需求很简单： 桌面上悬浮一个 96×96 的小窗口，无边框、背景透明、始终置顶 窗口内容就是一张 icon.png 鼠标左键能拖动它 系统托盘带右键菜单（显示/隐藏、退出
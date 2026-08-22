---
title: AliExpress 被发现静默运行 WebAudio 指纹
tags:
- Solidot 奇客
category: engineer/lessons
created: '2026-08-22'
source: https://www.solidot.org/story?sid=85150
type: rss
source_name: Solidot 奇客
source_url: https://www.solidot.org/index.rss
published: Thu, 20 Aug 2026 23:26:17 +0800
---

有开发者注意到一个奇怪的现象：蓝牙耳机支持多点蓝牙音频，能同时连接 PC 和手机，PC 通常优先播放音频，只有在 PC 没有播放内容时手机才会播放音频。这位开发者注意到，在 Firefox 或 Chrome 浏览器中打开 AliExpress 网页后，手机会停止播放音频，关闭网页则会恢复。这位开发者随后展开了调查，发现高度混淆的阿里巴巴安全脚本会创建两个 WebAudio 图形，成为浏览器指纹的一部分，该静默运行的 WebAudio 指纹会干扰多点蓝牙音频。用户可利用 uBlock Origin 扩展屏蔽阿里巴巴的脚本 collina.js 和 fireyejs.js 关闭这一指纹。
<p></p>
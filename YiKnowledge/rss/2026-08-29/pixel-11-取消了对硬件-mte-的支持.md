---
title: Pixel 11 取消了对硬件 MTE 的支持
tags:
- Solidot 奇客
category: engineer/lessons
created: '2026-08-30'
source: https://www.solidot.org/story?sid=85233
type: rss
source_name: Solidot 奇客
source_url: https://www.solidot.org/index.rss
published: Sun, 30 Aug 2026 07:44:03 +0800
---

Android 安全加固项目 GrapheneOS 发现，Google 新一代旗舰智能手机 Pixel 11 取消了对硬件 MTE（hardware memory tagging）的支持，导致该项目无法完成对 Pixel 11 的支持。MTE（Memory Tagging Extension）是 ARMv8.5-A 架构引入的安全特性，通过标记分配的内存去跟踪非法内存操作，改进内存安全性。Google 是从 2023 年发布的 Pixel 8 起开始支持硬件 MTE。但 Android 和 Pixel OS 从未默认启用 MTE，相比下苹果的  iPhone 17 默认启用了它的 MTE 实现 Memory Integrity Enforcement(MIE)。GrapheneOS 会自动为更多应用启用 MTE，为每个安装的应用提供一个开关供用户可选启用。对于不兼容的应用则提供开关可选禁用。GrapheneOS 正与摩托罗拉合作推出支持 GrapheneOS 的手机，新手机将使用高通的骁龙 8 Elite Gen 5，该 SoC 支持硬件 MTE。GrapheneOS 项目不推荐用户购买 Pixel 11，建议购买更便宜的 Pixel 8、9 和 10。
<p></p>
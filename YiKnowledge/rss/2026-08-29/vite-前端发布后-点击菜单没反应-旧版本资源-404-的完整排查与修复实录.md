---
title: Vite 前端发布后「点击菜单没反应」？旧版本资源 404 的完整排查与修复实录
tags:
- 掘金
category: engineer/learn/lessons
created: '2026-08-29'
source: https://juejin.cn/post/7679020474673184814
type: rss
source_name: 掘金
source_url: https://juejin.cn/rss
published: Sat, 29 Aug 2026 06:00:14 GMT
author: codeY
---

一、起因：一次平平无奇的发布 我们的项目是一个 Vue 3 + TypeScript + Vite 6 的中后台系统，部署在 nginx（Docker 容器）里。所有路由都做了懒加载，构建产物是带内容
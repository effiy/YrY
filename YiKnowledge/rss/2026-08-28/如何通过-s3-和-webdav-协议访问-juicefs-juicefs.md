---
title: 如何通过 S3 和 WebDAV 协议访问 JuiceFS？ - JuiceFS
tags:
- 博客园
category: engineer/learn/lessons
created: '2026-08-29'
source: https://www.cnblogs.com/JuiceData/p/22737877
type: rss
source_name: 博客园
source_url: https://feed.cnblogs.com/blog/sitehome/rss
published: '2026-08-28T04:53:00Z'
author: JuiceFS
---

【摘要】不同应用访问数据的方式并不相同：有的依赖 POSIX 文件接口，有的基于 S3 API 构建，也有用户希望通过文件管理器浏览和编辑远程文件。JuiceFS 的多协议访问能力，正是为了让这些工具能够访问同一套文件系统。 本文会先说明 S3 Gateway 与 WebDAV 共享的初始化链路，再说明二者 <a href="https://www.cnblogs.com/JuiceData/p/22737877" target="_blank">阅读全文</a>
---
doc_type: module
prd_task_id: "YP-09-121"
title: "YP-09-121: 本地模型管理与下载 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "128-功能实现-本地模型管理与下载.md"
---

# YP-09-121: 本地模型管理与下载 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-121 · 状态：待开始

<a id="sec-1"></a>
## 一、方案概述

管理 Ollama 本地模型：列表/下载/删除/切换。

| 功能 | API |
|------|-----|
| 模型列表 | Ollama `/api/tags` |
| 下载模型 | Ollama `/api/pull` + 进度 |
| 删除模型 | Ollama `/api/delete` |
| 切换默认 | chrome.storage 持久化 |
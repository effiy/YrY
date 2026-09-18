---
doc_type: module
prd_task_id: "YP-09-94"
title: "YP-09-94: DevTools 调试面板 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "101-工具-DevTools调试面板.md"
---

# YP-09-94: DevTools 调试面板 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-94 · 状态：待开始

---

<a id="sec-1"></a>
## 一、方案概述

`window.YiPet.help()` 调试面板：扩展状态/CDN 加载/Storage 数据/IPC 消息日志。

### 调试命令

| 命令 | 功能 |
|------|------|
| `YiPet.help()` | 显示调试面板 |
| `YiPet.status()` | 扩展状态概览 |
| `YiPet.storage()` | chrome.storage 数据查看 |
| `YiPet.ipc()` | IPC 消息日志 |
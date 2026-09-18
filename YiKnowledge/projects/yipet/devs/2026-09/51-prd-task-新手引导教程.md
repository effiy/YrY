---
doc_type: module
prd_task_id: "YP-09-44"
title: "YP-09-44: 新手引导教程 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prd: "51-功能实现-新手引导教程.md"
---

# YP-09-44: 新手引导教程 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-44 · 状态：待开始

## 引导步骤

首次安装后展示 4 步引导：

| 步骤 | 内容 | 目标元素 |
|------|------|---------|
| 1 | 欢迎 | Floating Pet |
| 2 | 聊天 | Chat Window |
| 3 | 设置 | Popup |
| 4 | 快捷键 | 键盘操作 |

> 使用 intro.js 或自实现遮罩引导。完成后 localStorage 标记不再显示。
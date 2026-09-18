---
doc_type: module
prd_task_id: "YP-09-122"
title: "YP-09-122: 屏幕录制与分享 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "129-功能实现-屏幕录制与分享.md"
---

# YP-09-122: 屏幕录制与分享 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-122 · 状态：待开始

## 录制功能

`chrome.desktopCapture` + `MediaRecorder` API。

| 功能 | API |
|------|-----|
| 屏幕录制 | `chrome.desktopCapture.chooseDesktopMedia` |
| 音频录制 | `getUserMedia({ audio: true })` |
| 导出 WebM | `MediaRecorder` |
| 分享链接 | 上传 + 生成链接 |
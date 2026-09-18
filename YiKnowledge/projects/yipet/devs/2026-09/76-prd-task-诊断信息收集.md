---
doc_type: module
prd_task_id: "YP-09-69"
title: "YP-09-69: 诊断信息收集 — 开发方案"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prd: "76-工具-诊断信息收集.md"
---

# YP-09-69: 诊断信息收集 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-69

## 诊断信息

| 信息 | 来源 |
|------|------|
| Chrome 版本 | `navigator.userAgent` |
| 扩展版本 | `chrome.runtime.getManifest().version` |
| Storage 用量 | `chrome.storage.local.getBytesInUse` |
| SW 状态 | `chrome.runtime.getBackgroundPage` |
| 错误日志 | `window.__YIPET_ERRORS__` |

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

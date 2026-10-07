---
title: "YV-103-需求: 前端状态常量传播 — Bug Store 迁移"
tags: [需求, 状态常量, 代码去重, bug store]
category: 项目/管理后台/需求
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
roles: [engineer]
---

# YV-103: 前端状态常量传播 — Bug Store

## 一、背景

bug store 有 12 处硬编码状态字符串（`"open"`, `"in_progress"`, `"resolved"` 等），未使用统一的 `utils/status.ts` 模块。

## 二、修复

| 文件 | 变更 |
|------|------|
| `utils/status.ts` | 新增 `REJECTED`/`PLANNED` + `Rejected` 遗留映射 |
| `stores/modules/bug.ts` | `_VALID_STATUSES` + `_STATUS_NORMALIZE` → 使用 `Status` 常量 |

## 三、验收

- [x] bug store 不再包含硬编码状态字符串
- [x] `_VALID_STATUSES` 使用 `Status.OPEN/IN_PROGRESS/...`
- [x] `_STATUS_NORMALIZE` 映射使用 `Status` 常量
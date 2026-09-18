---
doc_type: module
prd_task_id: "YA-08-11"
title: "YA-08-11: 维护工具服务 — 未引用图片清理 + 会话垃圾回收 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202608"
estimate_frontend: 0.5
source_prd: "11-需求-维护工具服务.md"
source_okr: [yiai-003]
related_tests: ["11-prd-test-维护工具服务"]
---

# YA-08-11: 维护工具服务 — 未引用图片清理 + 会话垃圾回收 — 开发方案

> 来源 PRD：[11-需求-维护工具服务.md](../../prds/2026-08/11-需求-维护工具服务.md)
> 需求编号：YA-08-11 · 优先级：P2 · 人天：0.5d
> 类型：功能 · 状态：已完成

---

## 一、方案概述

提供两类维护端点：**未引用图片清理**（OSS 中无引用的孤立图片）和**会话垃圾回收**（过期会话清理）。通过 `/maintenance/*` 端点手动触发或定时执行。

### 功能

| 端点 | 功能 |
|------|------|
| `/maintenance/cleanup-images` | 扫描 OSS 图片，删除无引用的孤立图片 |
| `/maintenance/gc-sessions` | 清理超过 N 天未活跃的会话 |
| `/maintenance/status` | 返回存储用量统计 |

---

## 二、实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | 孤立图片检测 + 清理 | 无引用图片被删除 | 0.2 |
| 2 | 会话 GC | 过期会话被清理 | 0.15 |
| 3 | 存储统计 | 返回各集合文档数/大小 | 0.15 |

**合计：0.5d**。

---

## 三、关联模块

- 依赖：[YA-08-05 文件管理服务](./05-prd-task-文件管理服务.md)
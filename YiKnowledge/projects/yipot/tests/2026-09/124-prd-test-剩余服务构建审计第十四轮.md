---
doc_type: test
title: "YiPot 剩余服务审计与构建审计（第十四轮）— 测试方案"
tags: [测试方案, 翻译引擎, caiyun, niutrans]
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
test_id: YP-09-124
prd_ref: YP-09-77
dev_ref: YP-09-118
roles: [engineer]
---

# YiPot 剩余服务审计与构建审计（第十四轮）— 测试方案

> 测试编号：YP-09-124 · 关联 PRD：YP-09-77 · 关联开发：YP-09-118

---

## 一、测试用例

### TC-01: Caiyun 翻译 — 正常

| 项 | 内容 |
|-----|------|
| **前置条件** | 彩云 token 已配置 |
| **步骤** | 翻译 "hello" → en→zh → Caiyun |
| **预期** | 正常返回翻译结果 |

### TC-02: Caiyun — config 缺失

| 项 | 内容 |
|-----|------|
| **步骤** | 不配置 token → 翻译 |
| **预期** | "Please configure token" 错误（非 TypeError） |

### TC-03: Niutrans 翻译 — 正常

| 项 | 内容 |
|-----|------|
| **前置条件** | Niutrans apikey 已配置 |
| **步骤** | 翻译 "hello" → en→zh → Niutrans |
| **预期** | 正常返回翻译结果 |

### TC-04: Niutrans — config 缺失

| 项 | 内容 |
|-----|------|
| **步骤** | 不配置 apikey → 翻译 |
| **预期** | API 返回认证错误（非 TypeError） |

---

## 二、回归测试

执行 [主测试策略](../master-test-strategy.md) 回归冒烟套件（15 项）。

## 三、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/77-prd-剩余服务构建审计第十四轮.md` |
| 开发方案 | `../devs/2026-09/118-prd-task-剩余服务构建审计第十四轮.md` |
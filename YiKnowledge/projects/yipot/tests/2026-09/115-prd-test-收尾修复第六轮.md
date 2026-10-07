---
doc_type: test
title: "YiPot 收尾修复（第六轮）— 测试方案"
tags: [测试方案, 前端, 生命周期, timer, listener]
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
test_id: YP-09-115
prd_ref: YP-09-69
dev_ref: YP-09-110
roles: [engineer]
---

# YiPot 收尾修复（第六轮）— 测试方案

> 测试编号：YP-09-115 · 关联 PRD：YP-09-69 · 关联开发：YP-09-110

---

## 一、测试用例

### TC-01: General 服务端口 debounce

| 项 | 内容 |
|-----|------|
| **步骤** | 1. 设置 → 通用 → 快速连续修改服务端口 2. 切换页面 |
| **预期** | `toast.success` 在最后一次输入 500ms 后触发，无 `setState on unmounted` 警告 |

### TC-02: WindowControl resize listener

| 项 | 内容 |
|-----|------|
| **步骤** | 1. 设置窗口最大化/还原 2. 观察窗口控制按钮图标 |
| **预期** | 最大化/还原按钮图标正确切换 |

### TC-03: 组件卸载清理

| 项 | 内容 |
|-----|------|
| **步骤** | 快速打开/关闭设置窗口 5 次 |
| **预期** | 无内存泄漏，无残留 listener |

---

## 二、回归测试

- 设置窗口所有 tab 正常切换
- 翻译/OCR 功能正常

## 三、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/69-prd-收尾修复第六轮.md` |
| 开发方案 | `../devs/2026-09/110-prd-task-收尾修复第六轮.md` |
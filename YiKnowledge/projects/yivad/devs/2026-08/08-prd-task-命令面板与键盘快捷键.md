---
doc_type: module
prd_task_id: "YV-08-08"
title: "命令面板与键盘快捷键系统 — Cmd+K 全局快速导航 — 开发任务"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
estimate_frontend: 1.5
source_prd: "08-prd-命令面板与键盘快捷键.md"
---

# 命令面板与键盘快捷键系统 — Cmd+K 全局快速导航 — 开发任务

> 来源 PRD：[08-prd-命令面板与键盘快捷键.md](../prds/2026-08/08-prd-命令面板与键盘快捷键.md)
> 需求编号：YV-08-08 · 优先级：P1 · 人天：1.5d

## 五、实施步骤

### 步骤 1: 命令面板组件（0.75d）

- [x] 实现 `CommandPalette.vue`：Teleport、遮罩、输入框、结果列表
- [x] 实现键盘导航：上下箭头、Enter、Esc
- [x] 实现搜索高亮 `highlight()` 函数
- [x] 实现 200ms 防抖搜索

**验证：** 按 `Cmd+K` 打开面板，输入关键词搜索 Issue 和 Project

### 步骤 2: Quick Actions（0.25d）

- [x] 定义 5 个快速操作（含图标、快捷键、颜色）
- [x] 无搜索词时显示 Quick Actions

**验证：** 打开面板（无输入），显示 5 个快速操作，回车执行

### 步骤 3: KeyboardShortcuts 组件（0.25d）

- [x] 实现快捷键帮助面板
- [x] 展示所有可用快捷键及说明

**验证：** 按 `?` 打开快捷键帮助面板

### 步骤 4: 集成到 App.vue（0.25d）

- [x] 在 `App.vue` 中注册 `CommandPalette`
- [x] 全局键盘监听注册

**验证：** 任意页面按 `Cmd+K` 均可打开命令面板

---

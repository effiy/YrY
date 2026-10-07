---
prd_task_id: "YV-09-138"
title: "YV-09-138: 自定义主题编辑器 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "68-prd-自定义主题编辑器.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 自定义主题编辑器]
roles: [engineer]
benefit: "开发方案：task-自定义主题编辑器"
lifecycle: active
---

# YV-09-138: 自定义主题编辑器 — 开发方案

> 需求编号：YV-09-138 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

可视化主题编辑器：自定义品牌色/背景色/字体/圆角等 CSS 变量。

### 可编辑变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| --brand-color | #409EFF | 品牌色 |
| --bg-color | #f5f7fa | 背景色 |
| --text-color | #303133 | 文字色 |
| --border-radius | 4px | 圆角 |
| --font-family | system-ui | 字体 |

> 低优先级。


### 架构方案

**技术路线**：用户设置子页面 (`/settings/appearance`)，颜色选择器 + 实时预览 + CSS 变量覆盖

**数据模型**：
```
存储到 `users` 集合或 `localStorage`；主题变量包括：`--primary-color`, `--bg-color`, `--text-color`, `--border-radius` 等
```

**组件树**：
```
ThemeEditor.vue (颜色选择器 + 预览面板) + ThemePresets.vue (预设主题)
```

**关键决策**：
主题通过 CSS 自定义属性（`document.documentElement.style.setProperty`）动态注入；Element Plus 主题变量同步覆盖


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。

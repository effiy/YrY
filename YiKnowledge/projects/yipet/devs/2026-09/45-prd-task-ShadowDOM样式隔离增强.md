---

doc_type: module
prd_task_id: "YP-09-38"
title: "YP-09-38: Shadow DOM 样式隔离增强 — 开发方案"
status: 方案已编写
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["45-prd-test-ShadowDOM样式隔离增强.md"]
source_prd: "45-架构设计-ShadowDOM样式隔离增强.md"

type: task
---

# YP-09-38: Shadow DOM 样式隔离增强 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-38 · 优先级：P1

---

<a id="sec-1"></a>
## 一、方案概述

增强 Shadow DOM 隔离：CSS 变量穿透、字体继承控制、Element Plus 弹窗 Teleport 到 Shadow Root。

### 增强项

| 增强 | 说明 |
|------|------|
| CSS 变量穿透 | `:host` 继承宿主 CSS 变量 |
| 字体控制 | `all: initial` 重置 + 自定义字体 |
| Teleport 修复 | `el-dialog/el-popper` appendTo shadow root |

```css
:host {
  all: initial;
  font-family: "Inter", system-ui, sans-serif;
  color: var(--text-primary, #303133);
}
```

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

---

## 一、需求背景

来源 PRD：45-架构设计-ShadowDOM样式隔离增强.md

### 用户痛点

1. **宿主页面 `color` 继承导致文字颜色异常**：中
1. **创建 `shadow-reset.css` 三层防护样式**：不同宿主页面中宠物 UI 样式一致
1. **在 `overlay.ts` 中注入 `shadow-reset.css`**：输入 `:host` 在 DevTools 中可见

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 增强 | 说明 |
| CSS 变量穿透 | `:host` 继承宿主 CSS 变量 |
| 字体控制 | `all: initial` 重置 + 自定义字体 |
| Teleport 修复 | `el-dialog/el-popper` appendTo shadow root |
| # | 缺口 |
| — | 无 |
| — | ### 技术债 |
| 技术债 | 优先级 |

## 三、关键技术决策

| # | 决策 | 理由 |
|---|------|------|
| 1 | 纯前端浏览器 API 实现 | 无需服务端依赖，响应 < 50ms，离线可用 |
| 2 | 独立 Vue 3 Composable 封装 | 单一职责，可复用于 Popup + Side Panel |

## 四、实施步骤

| 步骤 | 任务 | 预估 |
|------|------|------|
| 1 | Composable 核心逻辑 + 状态管理 | 0.1d |
| 2 | Vue 3 UI 组件开发（含错误/空/加载状态） | 0.1d |
| 3 | 边界场景处理 + 集成测试 | 0.1d |

**总计：0.3d**

## 五、完成记录

> **状态**：方案已编写 · **日期**：2026-09-23 · 实施排期待定

## 六、技术债与缺口

| # | 项目 | 优先级 | 说明 | 状态 |
|---|------|--------|------|------|
| 1 | 宿主页面 `direction: rtl` 穿透 Shadow DOM | P1 | 宠物 UI 布局镜像翻转，元素错位 | 待实施 |
| 2 | 宿主页面 `font-family` 继承导致字体不一致 | P1 | 宠物 UI 使用宿主字体而非设计字体 | 待实施 |


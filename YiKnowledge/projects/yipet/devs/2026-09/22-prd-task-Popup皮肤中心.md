---

doc_type: module
prd_task_id: "YP-09-15"
title: "YP-09-15: Popup 皮肤中心 — 开发方案"
status: 方案已编写
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["22-prd-test-Popup皮肤中心.md"]
source_prd: "22-架构设计-Popup皮肤中心.md"

type: task
---

# YP-09-15: Popup 皮肤中心 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-15 · 优先级：P1

---

<a id="sec-1"></a>
## 一、方案概述

Popup 皮肤中心：角色选择器（猫/狗/狐狸）、颜色选择器（预设+自定义）、模型选择器、实时预览。

### 组件结构

```
Popup/
├── App.vue
├── components/
│   ├── RoleSelector.vue    # 角色网格选择
│   ├── ColorPicker.vue     # 颜色预设 + 自定义
│   ├── ModelSelector.vue   # Ollama 模型列表
│   └── PreviewPanel.vue    # 实时预览
```

### 数据流

Popup 选择 → `chrome.storage.local.set` → `chrome.tabs.sendMessage` → Content Script → Floating Pet 更新

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

来源 PRD：22-架构设计-Popup皮肤中心.md

### 用户痛点

1. **`role-config.ts` 中角色配置与 `YiAi/services/ai/role_service.py` 的 prompt 模板无类型关联——两端各自维护角色定义**：0.5
1. **皮肤切换的 CSS 变量通过 `style.setProperty` 逐个设置——无批量更新机制**：0.25
1. **社区角色（MongoDB `roles` 集合）的加载逻辑与内置角色加载逻辑分离——无统一的 `RoleRepository` 抽象**：0.25

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| # | 缺口 |
| — | 无 |
| — | ### 技术债 |
| 技术债 | 优先级 |
| 说明 | 状态 |
| — | 无 |
| — | — |
| 步骤 | 任务 |

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
| 1 | `chrome.storage.local` 变更计数 | P1 | 高频切换可能表示用户不满意默认皮肤 | 待实施 |
| 2 | 最受欢迎角色/皮肤 | P1 | 统计 `yipet:role` / `yipet:skin` 值分布 | 待实施 |


---
doc_type: module
prd_task_id: "YP-09-15"
title: "YP-09-15: Popup 皮肤中心 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "22-功能实现-Popup皮肤中心.md"
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

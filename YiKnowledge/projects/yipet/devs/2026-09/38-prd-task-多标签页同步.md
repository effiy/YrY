---

doc_type: module
prd_task_id: "YP-09-31"
title: "YP-09-31: 多标签页同步 — 开发方案"
status: 方案已编写
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["38-prd-test-多标签页同步.md"]
source_prd: "38-架构设计-多标签页同步.md"

type: task
---

# YP-09-31: 多标签页同步 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-31 · 优先级：P1

---

<a id="sec-1"></a>
## 一、方案概述

多个标签页之间的状态同步：皮肤选择/聊天会话/Pet 显隐状态。

### 同步机制

```typescript
// chrome.storage.onChanged 监听
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key === "petConfig") updatePet(newValue);
      if (key === "chatSession") syncSession(newValue);
    }
  }
});
```

### 同步项

| 状态 | 键 | 同步方向 |
|------|-----|---------|
| 皮肤配置 | petConfig | 所有标签页 |
| 聊天会话 | chatSession | 所有标签页 |
| Pet 显隐 | petVisible | 所有标签页 |

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

来源 PRD：38-架构设计-多标签页同步.md

### 用户痛点

1. **实现 CrossTabSync 核心**：单元测试（广播 + 接收）
1. **集成会话同步**：创建/删除会话跨 Tab 同步
1. **集成宠物状态同步**：可见性/皮肤跨 Tab 同步

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 状态 | 键 |
| 皮肤配置 | petConfig |
| 聊天会话 | chatSession |
| Pet 显隐 | petVisible |
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
| 1 | 不同 Tab 看到不同会话列表 | P1 | 20-30%（多 Tab 用户） | 待实施 |
| 2 | session:created | P1 | B4[Tab B Pinia Store 更新]
        B3 --> | 待实施 |


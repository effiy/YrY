---
doc_type: module
prd_task_id: "YP-09-31"
title: "YP-09-31: 多标签页同步 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "38-架构设计-多标签页同步.md"
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

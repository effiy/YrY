---
doc_type: module
prd_task_id: "YP-09-17"
title: "YP-09-17: 聊天窗口拖拽管理 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "24-架构设计-聊天窗口拖拽管理.md"
---

# YP-09-17: 聊天窗口拖拽管理 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-17 · 优先级：P1

---

<a id="sec-1"></a>
## 一、方案概述

聊天窗口自由拖拽：窗口位置/大小调整、边界吸附、最小尺寸限制。

### 拖拽实现

```typescript
function useDraggable(el: Ref<HTMLElement>) {
  let startX = 0, startY = 0;
  function onMousedown(e: MouseEvent) {
    startX = e.clientX - el.value.offsetLeft;
    startY = e.clientY - el.value.offsetTop;
    document.addEventListener("mousemove", onMousemove);
    document.addEventListener("mouseup", onMouseup);
  }
  function onMousemove(e: MouseEvent) {
    el.value.style.left = `${e.clientX - startX}px`;
    el.value.style.top = `${e.clientY - startY}px`;
  }
}
```

### 约束

| 约束 | 值 |
|------|-----|
| 最小宽度 | 400px |
| 最小高度 | 300px |
| 边界吸附 | 距边缘 16px 吸附 |

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

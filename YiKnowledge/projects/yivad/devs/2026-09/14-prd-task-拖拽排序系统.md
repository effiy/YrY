---
prd_task_id: "YV-09-37"
title: "YV-09-37: 拖拽排序系统 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "14-prd-拖拽排序系统.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 拖拽排序系统]
benefit: "开发方案：task-拖拽排序系统"
lifecycle: active
---

# YV-09-37: 拖拽排序系统 — 开发方案

> 需求编号：YV-09-37 · 优先级：P2 · 人天：1.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

通用拖拽排序 composable，支持列表拖拽重排、跨容器移动、动画过渡，封装为 `useDraggable` hook 供 Kanban/列表页等场景复用。

### 核心接口

```typescript
interface DragSortOptions {
  items: Ref<DragItem[]>;
  onReorder: (items: DragItem[]) => Promise<void>;  // 排序持久化回调
  animation?: number;  // 过渡动画时长 ms，默认 200
}
```

### 实施步骤

| 步骤 | 内容 | 人天 |
|------|------|------|
| 1 | useDraggable composable 核心 | 0.5 |
| 2 | 动画过渡 + 视觉反馈 | 0.5 |
| 3 | Kanban + 列表页集成 | 0.5 |

**合计：1.5d**


### 架构方案

**技术路线**：集成 `vuedraggable` (基于 SortableJS)，为列表/卡片/表格行提供拖拽排序能力

**组件树**：
```
DraggableList.vue (通用拖拽包装) + 各页面集成 (ProTable 行拖拽 + 模块卡片拖拽)
```

**关键决策**：
拖拽后通过 API 批量更新 `order` 字段；动画使用 CSS transition 而非 JS 动画；移动端降级为手动排序按钮


---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 拖拽排序交互正常（列表/跨容器）
- [ ] 排序结果持久化到后端
- [ ] 动画过渡平滑（60fps）

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------
---

## 源码索引

> 此特性为轻量级功能（1.5d），前端主要为数据展示层。

| 文件 | 说明 | 文件路径 |
|------|------|------|
| — | 参见对应 PRD 涉及文件 | — |

---

## 实现完成记录

> **状态**：已完成（1.5d 轻量特性）· **复核日期**：2026-09-15

### 产出

| 分类 | 说明 |
|------|------|
| 类型 | 前端数据展示（数据由 YiAi 后端提供服务） |
| 测试 | 见 [测试方案](../../tests/2026-09/14-prd-test-拖拽排序系统.md) |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过

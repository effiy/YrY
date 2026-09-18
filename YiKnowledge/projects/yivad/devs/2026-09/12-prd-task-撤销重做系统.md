---
doc_type: module
prd_task_id: "YV-09-33"
title: "YV-09-33: 撤销重做系统 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "12-prd-撤销重做系统.md"
---

# YV-09-33: 撤销重做系统 — 开发方案

> 需求编号：YV-09-33 · 人天：1.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

通用撤销/重做 composable `useUndoRedo`，基于快照栈模式，支持 Ctrl+Z/Ctrl+Shift+Z 快捷键。

### 核心接口

```typescript
function useUndoRedo<T>(source: Ref<T>, maxHistory = 50) {
  const state = ref<T>(cloneDeep(source.value));
  const undoStack = ref<T[]>([]);
  const redoStack = ref<T[]>([]);

  function snapshot() {
    undoStack.value.push(cloneDeep(state.value));
    if (undoStack.value.length > maxHistory) undoStack.value.shift();
    redoStack.value = []; // 新快照清除 redo 栈
  }

  function undo() {
    if (!undoStack.value.length) return;
    redoStack.value.push(cloneDeep(state.value));
    state.value = undoStack.value.pop()!;
  }

  function redo() {
    if (!redoStack.value.length) return;
    undoStack.value.push(cloneDeep(state.value));
    state.value = redoStack.value.pop()!;
  }

  return { state, snapshot, undo, redo, undoStack, redoStack };
}
```

### 适用场景

| 场景 | 快照时机 |
|------|---------|
| 表单编辑 | 字段变更后 |
| Kanban 拖拽 | 拖拽结束 |
| 列表排序 | 排序完成 |

### 实施步骤

| 步骤 | 内容 | 人天 |
|------|------|------|
| 1 | useUndoRedo composable 核心 | 0.5 |
| 2 | Ctrl+Z / Ctrl+Shift+Z 全局快捷键 | 0.25 |
| 3 | 表单 + Kanban 集成 | 0.25 |

**合计：1.0d**

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] undo/redo 快照栈正确
- [ ] Ctrl+Z 撤销，Ctrl+Shift+Z 重做
- [ ] 最大 50 条历史限制

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

> 此特性为轻量级功能（1.0d），前端主要为数据展示层。

| 文件 | 说明 | 文件路径 |
|------|------|------|
| — | 参见对应 PRD 涉及文件 | — |

---

## 实现完成记录

> **状态**：已完成（1.0d 轻量特性）· **复核日期**：2026-09-15

### 产出

| 分类 | 说明 |
|------|------|
| 类型 | 前端数据展示（数据由 YiAi 后端提供服务） |
| 测试 | 见 [测试方案](../../tests/2026-09/12-prd-test-撤销重做系统.md) |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过

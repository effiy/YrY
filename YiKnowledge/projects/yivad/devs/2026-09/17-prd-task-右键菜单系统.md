---
doc_type: module
prd_task_id: "YV-09-42"
title: "YV-09-42: 右键菜单系统 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "17-prd-右键菜单系统.md"
---

# YV-09-42: 右键菜单系统 — 开发方案

> 需求编号：YV-09-42 · 优先级：P2 · 人天：1.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

通用右键菜单组件，Teleport to body + position:fixed 定位，全局点击关闭。封装为 `useContextMenu` composable 供列表页/Roadmap 等场景复用。

### 核心接口

```typescript
interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  divider?: boolean;
}

function useContextMenu(items: ContextMenuItem[]) {
  const visible = ref(false);
  const position = ref({ x: 0, y: 0 });

  function open(e: MouseEvent) {
    e.preventDefault();
    position.value = { x: e.clientX, y: e.clientY };
    visible.value = true;
  }
  return { visible, position, open };
}
```

### 设计要点

| 要点 | 说明 |
|------|------|
| Teleport to body | 避免被父元素 overflow/crop |
| position:fixed | 相对于视口，不受滚动影响 |
| 全局点击关闭 | `document.addEventListener('click', close)` |
| 边缘检测 | 超出视口时反向展开 |

### 实施步骤

| 步骤 | 内容 | 人天 |
|------|------|------|
| 1 | useContextMenu composable | 0.3 |
| 2 | ContextMenu 组件 (Teleport + 动画) | 0.4 |
| 3 | 列表页/Roadmap 集成 | 0.3 |

**合计：1.0d**

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 右键菜单出现在鼠标位置
- [ ] 全局点击/ESC 关闭
- [ ] 边缘检测反向展开

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
| 测试 | 见 [测试方案](../../tests/2026-09/17-prd-test-右键菜单系统.md) |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过

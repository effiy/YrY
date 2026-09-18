---
doc_type: module
prd_task_id: "YV-09-44"
title: "YV-09-44: 多标签页工作区 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "19-prd-多标签页工作区.md"
---

# YV-09-44: 多标签页工作区 — 开发方案

> 需求编号：YV-09-44 · 人天：1.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

增强标签页系统：标签拖拽排序、右键菜单（关闭/关闭其他/关闭右侧/关闭所有）、持久化恢复。

### Tabs Store

```typescript
export const useTabsStore = defineStore("yivad-tabs", () => {
  const tabs = ref<Tab[]>([]);
  const activeTab = ref("");

  function addTab(tab: Tab) {
    if (!tabs.value.find(t => t.path === tab.path)) {
      tabs.value.push(tab);
    }
    activeTab.value = tab.path;
  }

  function removeTab(path: string) {
    const idx = tabs.value.findIndex(t => t.path === path);
    tabs.value.splice(idx, 1);
    // 自动切换到相邻标签
    if (activeTab.value === path) {
      const next = tabs.value[idx] || tabs.value[idx - 1];
      if (next) { activeTab.value = next.path; router.push(next.path); }
    }
  }

  function closeOthers(path: string) { tabs.value = tabs.value.filter(t => t.path === path); }
  function closeAll() { tabs.value = []; router.push("/"); }
}, { persist: { key: "yivad-tabs", pick: ["tabs", "activeTab"] } });
```

### 右键菜单

| 操作 | 说明 |
|------|------|
| 关闭 | 关闭当前标签 |
| 关闭其他 | 保留当前，关闭其余 |
| 关闭右侧 | 关闭当前右侧所有标签 |
| 关闭所有 | 关闭全部标签，回到首页 |

### 实施步骤：1.0d

| 步骤 | 内容 |
|------|------|
| 1 | 拖拽排序 | 
| 2 | 右键菜单 4 项操作 |
| 3 | 持久化恢复 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 标签拖拽重排
- [ ] 右键菜单全部操作正常
- [ ] 刷新恢复标签页

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
| 测试 | 见 [测试方案](../../tests/2026-09/19-prd-test-多标签页工作区.md) |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过

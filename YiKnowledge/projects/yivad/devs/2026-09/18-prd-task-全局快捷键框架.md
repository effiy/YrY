---
doc_type: module
prd_task_id: "YV-09-43"
title: "YV-09-43: 全局快捷键框架 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "18-prd-全局快捷键框架.md"
---

# YV-09-43: 全局快捷键框架 — 开发方案

> 需求编号：YV-09-43 · 人天：0.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

`useShortcuts` composable 统一管理全局快捷键，支持作用域（全局/页面级/弹窗内）、冲突检测。

### 核心接口

```typescript
interface Shortcut {
  keys: string;         // "Ctrl+S" / "Cmd+K"
  handler: () => void;
  scope: "global" | "page" | "modal";
  description: string;
}

function useShortcuts(shortcuts: Shortcut[]) {
  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
  });
  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });

  function handleKeydown(e: KeyboardEvent) {
    // 输入框内不触发
    if (isInputFocused()) return;

    const matched = shortcuts.find(s =>
      matchKeys(e, s.keys) && isScopeActive(s.scope)
    );
    if (matched) { e.preventDefault(); matched.handler(); }
  }
}
```

### 默认快捷键

| 快捷键 | 作用 |
|--------|------|
| `Ctrl+S` | 保存 |
| `Ctrl+K` | 命令面板 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` | 重做 |
| `?` | 快捷键帮助 |

### 实施步骤：0.5d

| 步骤 | 内容 |
|------|------|
| 1 | useShortcuts composable | 
| 2 | 全局注册 + 冲突检测 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 快捷键注册/注销正确
- [ ] 输入框内不触发
- [ ] 弹窗内快捷键优先于全局

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

> 此特性为轻量级功能（0.5d），前端主要为数据展示层。

| 文件 | 说明 | 文件路径 |
|------|------|------|
| — | 参见对应 PRD 涉及文件 | — |

---

## 实现完成记录

> **状态**：已完成（0.5d 轻量特性）· **复核日期**：2026-09-15

### 产出

| 分类 | 说明 |
|------|------|
| 类型 | 前端数据展示（数据由 YiAi 后端提供服务） |
| 测试 | 见 [测试方案](../../tests/2026-09/18-prd-test-全局快捷键框架.md) |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过

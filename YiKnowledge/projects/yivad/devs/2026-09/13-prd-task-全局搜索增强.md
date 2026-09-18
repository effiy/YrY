---
doc_type: module
prd_task_id: "YV-09-36"
title: "YV-09-36: 全局搜索增强 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "13-prd-全局搜索增强.md"
---

# YV-09-36: 全局搜索增强 — 开发方案

> 需求编号：YV-09-36 · 人天：1.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

在现有全局搜索基础上增强：正则搜索、搜索语法（`type:issue`、`status:open`）、搜索建议、最近搜索改进。

### 增强功能

| 功能 | 说明 | 示例 |
|------|------|------|
| 搜索语法 | `key:value` 过滤 | `type:issue status:open` |
| 正则搜索 | `/pattern/` 触发 | `/bug.*crash/` |
| 搜索建议 | 输入时下拉相关搜索 | 基于历史搜索 |
| 最近搜索 | 最近 20 条 | localStorage 持久化 |

### 搜索语法解析

```typescript
function parseQuery(q: string): { text: string; filters: Record<string, string> } {
  const filters: Record<string, string> = {};
  const text = q.replace(/(\w+):(\S+)/g, (_, key, val) => {
    filters[key] = val;
    return "";
  }).trim();
  return { text, filters };
}

// "type:issue status:open login bug" → { text: "login bug", filters: { type: "issue", status: "open" } }
```

### 实施步骤

| 步骤 | 内容 | 人天 |
|------|------|------|
| 1 | 搜索语法解析器 | 0.25 |
| 2 | 正则搜索支持 | 0.25 |
| 3 | 搜索建议 + 最近搜索 UI | 0.5 |

**合计：1.0d**

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] `type:issue status:open` 语法正确过滤
- [ ] 正则 `/pattern/` 搜索生效
- [ ] 最近搜索 20 条持久化

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
| 测试 | 见 [测试方案](../../tests/2026-09/13-prd-test-全局搜索增强.md) |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过

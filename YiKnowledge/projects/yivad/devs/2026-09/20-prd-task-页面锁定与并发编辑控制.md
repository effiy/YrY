---
doc_type: module
prd_task_id: "YV-09-45"
title: "YV-09-45: 页面锁定与并发编辑控制 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "20-prd-页面锁定与并发编辑控制.md"
---

# YV-09-45: 页面锁定与并发编辑控制 — 开发方案

> 需求编号：YV-09-45 · 人天：0.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

当用户编辑文档/表单时，通过乐观锁或悲观锁防止并发编辑冲突。

### 两种模式

| 模式 | 适用场景 | 实现 |
|------|---------|------|
| 乐观锁 | 低频编辑（文档） | `version` 字段，提交时校验 |
| 悲观锁 | 高频编辑（表单） | 进入编辑时加锁，离开时释放 |

### 乐观锁实现

```typescript
async function save(data: Record<string, unknown>, currentVersion: number) {
  const result = await updateDocument({
    cname: "items",
    key: { _id: data._id, version: currentVersion }, // 条件更新
    data: { ...data, version: currentVersion + 1 },
  });
  if (result.modifiedCount === 0) {
    ElMessage.warning("数据已被他人修改，请刷新后重试");
  }
}
```

### 实施步骤：0.5d

- 乐观锁 `version` 字段 + 条件更新
- 冲突检测 + 用户提示

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 并发编辑时检测版本冲突
- [ ] 冲突时提示用户刷

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
| 测试 | 见 [测试方案](../../tests/2026-09/20-prd-test-页面锁定与并发编辑控制.md) |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过

---
title: "页面锁定与并发编辑控制 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
prd_month: "202609"
source_prds: ["20-prd-页面锁定与并发编辑控制"]
source_modules: ["20-prd-task-页面锁定与并发编辑控制"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, 页面锁定与并发编辑控制]
benefit: "并发编辑冲突检测、乐观锁/悲观锁、锁心跳与自动释放测试"
lifecycle: active
---

# 页面锁定与并发编辑控制 — 测试用例

> 来源 PRD：[20-prd-页面锁定与并发编辑控制.md](../../prds/2026-09/20-prd-页面锁定与并发编辑控制.md)
> 开发方案：[20-prd-task-页面锁定与并发编辑控制.md](../../devs/2026-09/20-prd-task-页面锁定与并发编辑控制.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 测试策略

| 层级 | 说明 | 自动化 |
|------|------|--------|
| L1 单元 | useEditLock composable 锁状态管理逻辑 | Vitest |
| L2 组件 | LockIndicator + ConflictResolver 组件渲染 | Vitest + @vue/test-utils |
| L3 集成 | 乐观锁冲突检测 + 悲观锁获取/释放 | Vitest + mock |
| L4 端到端 | 双用户并发编辑完整流程 | 手动（双浏览器标签页） |

---

## 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | 乐观锁：version 检查 + 冲突提示 | UT + IT | ✅ |
| FR-2 | 悲观锁：进入编辑获取锁 + 离开释放 | IT | ✅ |
| FR-3 | 锁心跳：定期续约 + 超时自动释放 | UT + IT | ✅ |
| FR-4 | ConflictResolver：冲突解决 UI | CT + IT | ✅ |
| FR-5 | LockIndicator：锁定状态指示器 | CT | ✅ |

---

## L1 单元测试

### UT-01: 乐观锁版本比较

**GIVEN** 文档当前 version = 3，用户编辑基于 version = 3  
**WHEN** 保存时传入 `expectedVersion: 3`  
**THEN** 后端校验通过 → 保存成功，version 更新为 4  
**WHEN** 另一用户基于 version = 3 保存（version 已被更新为 4）  
**THEN** 返回 `{ conflict: true, currentVersion: 4 }` → 前端显示冲突提示

### UT-02: 悲观锁获取

**GIVEN** 文档未被锁定  
**WHEN** 用户进入编辑页面 → `useEditLock().acquire(documentId)`  
**THEN** 返回 `{ acquired: true, lockId, expiresAt }`  
**AND** `lockStore.activeLocks` 包含该文档的锁记录

### UT-03: 锁心跳续约

**GIVEN** 锁的 `expiresAt` = 当前时间 + 30s  
**WHEN** 心跳定时器触发（每 15s）→ `renewLock(lockId)`  
**THEN** `expiresAt` 更新为当前时间 + 30s  
**AND** 后端锁记录被续约

### UT-04: 锁超时自动释放

**GIVEN** 用户持有锁，但心跳停止（用户关闭浏览器/网络断开）  
**WHEN** 锁过期（30s 无心跳）  
**THEN** 后端自动释放锁  
**AND** 其他用户可获取该文档的锁

---

## L2 组件测试

### CT-01: LockIndicator 状态显示

**GIVEN** 文档当前被用户 B 锁定（编辑中）  
**WHEN** 用户 A 打开该文档  
**THEN** LockIndicator 显示黄色「编辑中 — 用户 B」标签  
**AND** 编辑按钮显示为 disabled + tooltip「用户 B 正在编辑」

### CT-02: ConflictResolver 冲突对话框

**GIVEN** 用户保存时检测到 version 冲突（本地 v3，服务器 v4）  
**WHEN** ConflictResolver 对话框弹出  
**THEN** 显示选项：① 查看最新版本 ② 强制覆盖 ③ 复制我的修改  
**AND** 选择「查看最新版本」→ 加载 v4 并并排对比差异

### CT-03: 锁释放确认

**GIVEN** 用户持有锁并点击「离开页面」  
**WHEN** 触发 `beforeunload` 或路由导航守卫  
**THEN** 显示确认提示「有未保存的修改，确定离开？」  
**AND** 确认后 → `releaseLock(lockId)` → 锁被释放

---

## L3 集成测试

### IT-01: 乐观锁完整流程

**GIVEN** 用户 A 和用户 B 同时打开同一 Issue  
**WHEN** A 先保存（version 3→4 成功）  
**AND** B 基于 version 3 保存  
**THEN** B 收到 `{ conflict: true }` → ConflictResolver 弹出  
**AND** B 选择「查看最新版本」→ 数据刷新为 v4 → B 可重新编辑保存

### IT-02: 悲观锁完整流程

**GIVEN** 用户 A 进入 Issue 编辑页  
**WHEN** A 的 `acquireLock()` 成功  
**THEN** 用户 B 打开同一 Issue → LockIndicator 显示「A 正在编辑」  
**AND** B 的编辑按钮 disabled  
**WHEN** A 离开编辑页 → `releaseLock()`  
**THEN** B 的 LockIndicator 更新为「可编辑」→ 编辑按钮 enabled

### IT-03: 锁心跳中断恢复

**GIVEN** 用户 A 持有锁，心跳正常运行  
**WHEN** 网络断开 35s（超过 30s 超时）  
**THEN** 锁被服务端自动释放  
**WHEN** 网络恢复 → A 尝试保存  
**THEN** 显示「锁已过期，请刷新后重新编辑」→ A 刷新 → 重新获取锁

---

## L4 端到端场景

### E2E-01: 双用户并发编辑

1. 用户 A 打开 Issue #42 → 进入编辑 → LockIndicator 绿色「可编辑」
2. 用户 B 打开 Issue #42 → LockIndicator 黄色「A 正在编辑」
3. A 修改标题 → 保存成功
4. B 点击「强制编辑」→ 获取锁（A 的锁被抢占）→ LockIndicator 红色「锁已被抢占」
5. B 修改标题 → 保存成功
6. A 尝试保存 → ConflictResolver 弹出 → 选择「查看最新版本」
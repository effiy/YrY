---
title: "YV-09-63: 用户引导与新手任务 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-63"
source_prds: ["31-prd-用户引导与新手任务"]
source_modules: ["31-prd-task-用户引导与新手任务"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, 用户引导与新手任务]
benefit: "测试用例：用户引导与新手任务"
lifecycle: active
---

# YV-09-63: 用户引导与新手任务 — 测试用例

> 来源 PRD：[31-prd-用户引导与新手任务.md](../../prds/2026-09/31-prd-用户引导与新手任务.md)
> 开发方案：[31-prd-task-用户引导与新手任务.md](../../devs/2026-09/31-prd-task-用户引导与新手任务.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 测试策略

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | useOnboarding composable 状态管理 | Vitest | 每次提交 |
| L2 组件 | OnboardingTour 步骤渲染 + 交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | driver.js 集成 + 进度持久化 | Vitest + mock | 每次提交 |
| L4 端到端 | 完整引导流程（首次登录→完成） | 手动 | 提测/回归 |

---

## 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | 首次登录触发 5 步引导 | IT | ✅ 已完成 |
| FR-2 | 每步正确高亮目标元素 | CT | ✅ 已完成 |
| FR-3 | 中断续做（localStorage 进度） | UT + IT | ✅ 已完成 |
| FR-4 | 完成全部步骤后标记 completed | IT | ✅ 已完成 |
| FR-5 | 已有用户不触发引导 | IT | ✅ 已完成 |
| FR-6 | 重新引导按钮 | CT + IT | ✅ 已完成 |

---

## L1 单元测试

### UT-01: useOnboarding 状态管理

**GIVEN** `useOnboarding()` composable 初始化  
**WHEN** 调用 `startOnboarding()`  
**THEN** `currentStep` 应为 0，`isActive` 应为 `true`  
**WHEN** 调用 `nextStep()` 3 次  
**THEN** `currentStep` 应为 3  
**WHEN** 调用 `completeOnboarding()`  
**THEN** `isCompleted` 应为 `true`，`isActive` 应为 `false`

### UT-02: 中断续做逻辑

**GIVEN** localStorage `yivad-onboarding-step` = 2  
**WHEN** 调用 `checkOnboarding()`  
**THEN** 应返回 `{ needsOnboarding: true, lastStep: 2 }`  
**AND** `startOnboarding(2)` 应从步骤 2 开始

### UT-03: 已完成用户检测

**GIVEN** `users.onboarding_completed` = `true`  
**WHEN** 调用 `checkOnboarding()`  
**THEN** 应返回 `{ needsOnboarding: false }`

---

## L2 组件测试

### CT-01: OnboardingTour 步骤渲染

**GIVEN** OnboardingTour 组件挂载，步骤 = 2（项目列表）  
**WHEN** driver.js 高亮目标元素 `.menu-item-project`  
**THEN** popover 应显示步骤标题 + 描述 + 进度(2/5)  
**AND**「下一步」按钮可见，「上一步」按钮可见

### CT-02: 欢迎页不可跳过

**GIVEN** 步骤 = 0（欢迎页）  
**WHEN** 渲染 driver.js popover  
**THEN** 关闭按钮应不可见（`allowClose: false`）  
**AND** 仅「开始引导」按钮可见

### CT-03: 完成页

**GIVEN** 步骤 = 4（完成）  
**WHEN** 渲染 driver.js popover  
**THEN** 按钮文字应为「开始使用」  
**AND** 点击 → `onboardingStore.completeOnboarding()` 被调用  
**AND** localStorage `yivad-onboarding-step` 被清除

### CT-04: OnboardingChecklist 进度

**GIVEN** 用户完成了 3/5 个引导步骤  
**WHEN** 渲染 OnboardingChecklist 侧边栏  
**THEN** 进度条应显示 60%（3/5）  
**AND** 已完成的步骤显示 ✓ 标记

---

## L3 集成测试

### IT-01: 首次登录完整引导流程

**GIVEN** 新用户（`onboarding_completed` 不存在）首次登录  
**WHEN** App.vue `onMounted` → `checkOnboarding()`  
**THEN** OnboardingTour 自动启动  
**AND** 显示步骤 0（欢迎页）

### IT-02: 引导中断后恢复

**GIVEN** 用户在步骤 2 关闭了引导  
**WHEN** 用户下次登录  
**THEN** 引导应从步骤 2 继续（而非步骤 0）  
**AND** `localStorage yivad-onboarding-step` = 2

### IT-03: 完成引导后的状态

**GIVEN** 用户完成全部 5 步引导  
**WHEN** 点击「开始使用」  
**THEN** `onboarding_completed` 写入 `users` 集合  
**AND** localStorage 进度被清除  
**AND** 下次登录不再触发引导

### IT-04: 已有用户不触发

**GIVEN** 已有用户（`onboarding_completed: true`）  
**WHEN** 登录  
**THEN** `checkOnboarding()` 返回 `{ needsOnboarding: false }`  
**AND** OnboardingTour 不渲染

### IT-05: 重新引导

**GIVEN** 已完成引导的用户  
**WHEN** 在设置中点击「重新开始引导」  
**THEN** `onboarding_completed` 被重置  
**AND** localStorage 进度被清除  
**AND** 引导从步骤 0 重新开始

---

## L4 端到端场景

### E2E-01: 新用户完整引导流程

1. 创建新用户 → 首次登录
2. 自动弹出引导欢迎页（全屏覆盖）→ 点击「开始引导」
3. 步骤 2: 侧边栏项目菜单高亮 → 点击「下一步」
4. 步骤 3: Header AI Chat 入口高亮 → 点击「下一步」
5. 步骤 4: 知识树区域高亮 → 点击「下一步」
6. 步骤 5: 完成页 → 点击「开始使用」
7. 下次登录 → 引导不再触发
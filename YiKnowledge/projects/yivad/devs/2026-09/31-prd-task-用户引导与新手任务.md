---
prd_task_id: "YV-09-63"
title: "YV-09-63: 用户引导与新手任务 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "31-prd-用户引导与新手任务.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户引导与新手任务]
roles: [engineer]
benefit: "开发方案：task-用户引导与新手任务"
lifecycle: active
---

# YV-09-63: 用户引导与新手任务 — 开发方案

> 需求编号：YV-09-63 · 人天：0.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `OnboardingTour.vue` | 引导游览组件（步骤驱动） | `src/components/onboarding/` |
| `OnboardingChecklist.vue` | 新手任务清单（侧边栏） | `src/components/onboarding/` |
| `useOnboarding.ts` | 引导状态管理 composable | `src/composables/` |
| `onboardingStore.ts` | 引导进度持久化 | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

新用户首次登录时展示引导步骤，帮助快速了解核心功能。

### 架构方案

**技术路线**：使用 `driver.js`（5KB 轻量库）实现步骤驱动的高亮引导。引导状态持久化到 `users.onboarding_completed` + `localStorage`。支持中断续做——用户关闭引导后可从上次中断的步骤继续。

**引导步骤**：

| 步骤 | 内容 | 目标元素 | driver.js 配置 |
|------|------|---------|---------------|
| 1 | 欢迎页 | 全屏覆盖 | `{ showProgress: true, allowClose: false }` |
| 2 | 项目列表 | 侧边栏 `.menu-item-project` | `{ element, popover: { title, description, position: 'right' } }` |
| 3 | AI 聊天 | Header AI Chat 入口 | `{ element, popover: { position: 'bottom' } }` |
| 4 | 知识库 | 知识树 `.knowledge-tree` | `{ element, popover: { position: 'right' } }` |
| 5 | 完成 | — | `{ doneBtnText: '开始使用' }` → 标记 completed |

**组件树**：
```
App.vue (onMounted: 检查是否需要引导)
└── OnboardingTour.vue (driver.js 实例管理)
    └── driver.js Drive 实例 (高亮 + popover)

OnboardingChecklist.vue (可选: 侧边栏任务清单)
├── TaskItem.vue ×N (任务: 了解项目列表 / 试用AI / 浏览知识库 / ...)
└── ProgressBar.vue (完成进度)
```

**数据流**：
```
App.vue onMounted
  → onboardingStore.checkOnboarding()
    → 检查 user.onboarding_completed
    → 检查 localStorage yivad-onboarding-step
    → 未完成 → OnboardingTour.start(lastStep)
    → 用户完成步骤 N → localStorage.setItem('yivad-onboarding-step', N+1)
    → 用户完成全部 → onboardingStore.completeOnboarding()
      → YiAi data_service.update_document("users", { onboarding_completed: true })
      → localStorage.removeItem('yivad-onboarding-step')
```

**关键决策**：
- 引导库：`driver.js`（5KB）vs `shepherd.js`（20KB），初版用 driver.js 轻量方案
- 中断续做：每步完成时保存进度到 localStorage，下次登录从上次中断步骤继续
- 完成标记：引导全部完成后写 `users.onboarding_completed: true`，不再触发
- 重新引导：用户可在设置中点击「重新开始引导」清除完成标记
- 条件触发：仅 `users.onboarding_completed !== true` 时触发，管理员/已有用户不触发

### 实施步骤：0.5d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | driver.js 集成 + OnboardingTour 组件 | 高亮引导 popover 渲染 | 0.15 |
| 2 | 5 步引导内容（文案 + 目标元素定位） | 每步正确高亮目标元素 | 0.12 |
| 3 | useOnboarding composable（进度+完成+重置） | 中断续做 + 完成标记 | 0.10 |
| 4 | OnboardingChecklist 侧边栏 | 任务清单 + 进度条 | 0.08 |
| 5 | 条件触发（仅新用户）+ 重新引导 | 已有用户不触发 + 可重置 | 0.05 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 首次登录用户自动触发引导（5 步流程）
- [ ] 每步高亮正确目标元素 + popover 文案
- [ ] 中断续做：关闭后下次从当前步骤继续
- [ ] 完成全部步骤后标记 completed，不再触发
- [ ] 已有用户（onboarding_completed=true）不触发
- [ ] 设置中提供「重新开始引导」按钮
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口
| — | 无 | — | — |

### 技术债
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.5d）· **复核日期**：2026-09-15

### 产出
| 分类 | 文件数 | 说明 |
|------|--------|------|
| 组件 | 2 | OnboardingTour + OnboardingChecklist |
| Composable | 1 | useOnboarding |
| Store | 1 | onboardingStore |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单
- [x] 5 步引导流程完整
- [x] 中断续做（localStorage 进度保存）
- [x] 完成标记持久化
- [x] 已有用户不触发
- [x] 重新引导按钮
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过
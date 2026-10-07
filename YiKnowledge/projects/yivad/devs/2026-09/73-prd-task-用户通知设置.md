---
prd_task_id: "YV-09-199"
title: "YV-09-199: 用户通知设置 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "73-prd-用户通知设置.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户通知设置]
roles: [engineer]
benefit: "开发方案：task-用户通知设置"
lifecycle: active
---

# YV-09-199: 用户通知设置 — 开发方案

> 需求编号：YV-09-199 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `NotificationPreferences.vue` | 通知偏好设置页面 | `src/views/settings/` |
| `NotificationMatrix.vue` | 复选框矩阵组件（渠道×事件类型） | `src/components/user/` |
| `userSettingsStore.ts` | 用户设置 Store（资料+通知+安全） | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户可配置通知方式：站内/邮件/企微，按通知类型分别设置。

### 架构方案

**技术路线**：独立路由页面 `/settings/notifications`，核心 UI 为「事件类型×通知渠道」复选框矩阵。每个单元格为 `el-checkbox`，整行/整列支持批量切换。偏好数据通过 YiAi `data_service` 持久化到 MongoDB `users.notification_prefs` 字段。

**数据模型**：
```typescript
interface NotificationPreferences {
  prefs: Record<NotificationEventType, NotificationChannels>;
}

type NotificationEventType = 
  | 'issue.assigned'      // Issue 分配
  | 'issue.mentioned'     // @提及
  | 'bug.status_changed'  // Bug 状态变更
  | 'module.progress'     // 模块进度更新
  | 'project.member_added'// 项目成员变更
  | 'comment.added'       // 新评论
  | 'review.requested';   // 代码审查请求

interface NotificationChannels {
  in_app: boolean;   // 站内通知
  email: boolean;    // 邮件通知
  wecom: boolean;    // 企业微信通知
}
```

**组件树**：
```
NotificationPreferences.vue (页面容器)
├── NotificationMatrix.vue (复选框矩阵)
│   ├── MatrixHeader.vue (列头: 站内/邮件/企微 + 批量切换按钮)
│   ├── MatrixRow.vue ×N (行: 事件类型 + 3 个 el-checkbox)
│   └── MatrixFooter.vue (全选/取消全选 + 重置为默认)
└── SaveStatusIndicator.vue (自动保存: saved/saving/error)
```

**数据流**：
```
组件挂载 → userStore.fetchNotificationPrefs()
  → YiAi data_service.query_documents("users", { filter: { _id: userId } })
  → 提取 notification_prefs 字段
  → 填充复选框矩阵

用户切换复选框
  → watch(deep:true) + debounce 1s
  → YiAi data_service.update_document("users", { notification_prefs })
  → SaveStatusIndicator: 'saving' → 'saved'
```

**关键决策**：
- 自动保存策略：`watch(notificationPrefs, deep:true)` + debounce 1s，避免频繁 API 调用
- 全选/取消：列头提供批量切换按钮（整列启用/禁用），行头同样提供（整行启用/禁用）
- 默认配置：新用户默认仅启用站内通知（`in_app: true`），邮件和企微默认关闭
- 企微通知依赖：需要 YiAi 企业微信集成服务已配置
- 重置功能：「重置为默认」按钮 → 恢复为系统默认配置 → 自动保存

### 通知偏好矩阵

| 类型 | 站内 | 邮件 | 企微 |
|------|------|------|------|
| Issue 分配 | ✅ | ☐ | ☐ |
| Bug 变更 | ✅ | ☐ | ☐ |
| @提及 | ✅ | ✅ | ☐ |
| 模块进度 | ☐ | ☐ | ☐ |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | NotificationMatrix 复选框矩阵组件 | 7×3 矩阵渲染 + 切换交互 | 0.10 |
| 2 | userStore 通知偏好加载+保存 | API 调用 + 自动保存 | 0.06 |
| 3 | 全选/取消全选 + 重置默认 | 批量操作 + 确认 | 0.05 |
| 4 | SaveStatusIndicator + 错误处理 | 保存状态 + 重试 | 0.04 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 7 种事件类型 × 3 种通知渠道的复选框矩阵正确渲染
- [ ] 整列/整行批量切换按钮功能正常
- [ ] 自动保存 debounce 1s（频繁切换不产生多余 API 调用）
- [ ] 页面刷新后偏好保持（从 MongoDB 正确加载）
- [ ] 重置为默认按钮 + 二次确认
- [ ] 未配置企微集成时，企微列灰显 + tooltip 提示
- [ ] `vue-tsc --noEmit` 通过

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
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.25d）· **复核日期**：2026-09-15

### 产出

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | NotificationPreferences.vue |
| 组件 | 1 | NotificationMatrix.vue (复选框矩阵) |
| Store | 1 | userSettingsStore.notificationPrefs |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单

- [x] 7×3 复选框矩阵渲染正确
- [x] 整列/整行批量切换
- [x] 自动保存 debounce 1s
- [x] 企微列未集成时灰显+tooltip
- [x] 重置为默认 + 确认
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过